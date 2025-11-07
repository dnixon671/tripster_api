
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import { createTripRequest, findNearbyDrivers, rejectPendingTrip } from "../services/trip.service.js";
import { notifyDriver, notifyUser } from "../sockets/trip.handlers.js";
import socketInstance, { getDriverSockets } from "../sockets/socketInstance.js";
import { get } from "mongoose";

import { calculateETA, isValidCoordinate, retryOperation, } from "../utils/geo.js";
import { del } from "motion/react-client";


// Buscar conductores cercanos y devuelve la información relevante
export const searchNearbyDrivers = async (req, res) => {
    const currentUserId = req.user.id;

    try {
        // 1. Validar y obtener ubicación del usuario
        const user = await User.findById(currentUserId).select('location rejectedDrivers');
        if (!user || !user.location?.coordinates) {
            return res.status(400).json({
                success: false,
                error: 'Ubicación del usuario no disponible'
            });
        }

        const tripId = req.body.tripId;
        // validar tripId
        if (!tripId) {
            return res.status(400).json({
                success: false,
                error: 'ID de viaje no proporcionado'
            });
        }

        const trip = await Trip.findById(tripId).select('rejectedDrivers');
        const excludedDrivers = trip?.rejectedDrivers || [];

        const [longitude, latitude] = user.location.coordinates;

        // 2. Validar coordenadas
        if (!isValidCoordinate(longitude, latitude)) {
            return res.status(400).json({
                success: false,
                error: 'Coordenadas inválidas'
            });
        }

        // 3. Buscar conductores cercanos (con reintentos)
        const drivers = await retryOperation(
            () => findNearbyDrivers(
                [parseFloat(longitude), parseFloat(latitude)],
                excludedDrivers || [],
                5000 // Radio de 5km
            ),
            2 // Máximo 2 reintentos
        );

        // 4. Formatear respuesta
        const formattedDrivers = drivers.map(driver => ({
            id: driver._id,
            name: driver.username,
            rating: driver.rating,
            vehicle: driver.vehicleInfo || 'No disponible',
            distance: driver.distance, // Usar el campo calculado por $geoNear
            eta: calculateETA(driver.distance), // Tiempo estimado de llegada
            position: driver.location?.coordinates // [long, lat]
        }));

        res.json({
            success: true,
            count: formattedDrivers.length,
            drivers: formattedDrivers
        });

    } catch (error) {
        console.error('Error buscando conductores:', error);
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'development'
                ? error.message
                : 'Error buscando conductores disponibles',
            code: 'DRIVER_SEARCH_ERROR'
        });
    }
};

//   Crear peticion de viaje
export const requestUserTrip = async (req, res) => {

    const { driverId, starLocation, endLocation, distance } = req.body;
    const currentUser = req.user.id;
    const io = socketInstance.getIO();

    // Verificar que el usuario no tenga un viaje activo
    const userActiveTrip = await Trip.findOne({
        user: currentUser,
        status: { $in: ['pending', 'accepted'] }
    });
    if (userActiveTrip) {
        return res.status(400).json({
            success: false,
            error: 'El usuario ya tiene un viaje activo'
        });
    }

    const driverSockets = getDriverSockets();
    // verficar que el conductor este conectado
    if (!driverSockets.has(driverId.toString())) {
        return res.status(400).json({
            success: false,
            error: 'El conductor no está conectado o no existe'
        });
    }

    // Verificar que el conductor no tenga un viaje activo
    const activeTrip = await Trip.findOne({
        driver: driverId,
        status: { $in: ['pending', 'accepted'] }
    });
    if (activeTrip) {
        return res.status(400).json({
            success: false,
            error: 'El conductor ya tiene un viaje activo'
        });
    }

    try {
        // Crear el viaje en la base de datos
        const trip = await createTripRequest(currentUser, driverId, {
            starLocation,
            endLocation,
            price: 150, // Asegúrate de tener esta función
            status: 'pending'
        }); // Asegúrate de que el modelo de Trip tenga la referencia al usuario

        // console.log('trip', trip);
        // buscar conductor
        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                error: 'Conductor no encontrado'
            });
        }

        // Notificar al conductor via WebSocket (usando la función modular)
        notifyDriver(io, driverId, {
            type: "trip_request",
            tripId: trip._id,
            userId: currentUser, // Enviar ID para obtener detalles después si es necesario
            pickup: trip.pickup || "Ubicación no especificada",
            price: trip.price,
            expiresIn: 30 // Tiempo en segundos
        });

        trip.timeoutId = timeoutId;
        await trip.save();

        // Configurar timeout para rechazo automático        
        const timeoutId = setTimeout(async () => {
            const reason = "Tiempo de espera agotado"
            const by = "timeout";
            await rejectPendingTrip(io, trip._id, driverId, by, reason);
        }, 600000);

        res.json({
            success: true,
            tripId: trip._id,
            expiresIn: 30 // Tiempo para aceptar (segundos)
        });
    } catch (error) {
        console.error('Error en requestUserTrip:', error);
        res.status(500).json({
            success: false,
            error: 'Error al solicitar viaje',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const reassignUserTrip = async (req, res) => {
    const { tripId, driverId } = req.body;
    const currentUser = req.user.id;
    const io = socketInstance.getIO();

    try {
        // verificar que sea el usuario q esta autenticado
        const user = await User.findById(currentUser);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        // Obtenr viaje por el id y el usuario authenticado
        const trip = await Trip.findOne({
            _id: tripId,
            user: currentUser
        }).populate('user');

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Viaje no encontrado'
            });
        }



        // 2. Verificar si es posible asignar otro conductor
        if (trip.reassignmentAttempts >= 3) {
            trip.status = 'cancelled'; // Cambiar el estado a cancelado
            trip.cancellationDetails = {
                by: 'system',
                reason: 'No hay conductores disponibles',
                timestamp: new Date()
            };
            await trip.save();
            return res.status(400).json({
                success: false,
                error: 'Límite de reintentos alcanzado'
            });
        }

        // 3. Buscar un nuevo conductor disponible (implementa esta función)
        // const newDriver = await findAvailableDriver(user.rejectedDrivers || []);
        // if (!newDriver) {
        //     return res.status(404).json({ 
        //         success: false, 
        //         error: 'No hay conductores disponibles' 
        //     });
        // }

        // actualizar viaje con el nuevo conductor
        trip.driver = driverId;
        trip.status = 'pending'; // Cambiar el estado a pendiente

        // Notificar al conductor via WebSocket (usando la función modular)
        notifyDriver(io, driverId, {
            type: "trip_request",
            tripId: trip._id,
            userId: currentUser, // Enviar ID para obtener detalles después si es necesario
            pickup: trip.pickup || "Ubicación no especificada",
            price: trip.price,
            expiresIn: 30 // Tiempo en segundos
        });
        trip.timeoutId = timeoutId;
        await trip.save();
        // Configurar timeout para rechazo automático        
        const timeoutId = setTimeout(async () => {
            const reason = "Tiempo de espera agotado"
            const by = "timeout";
            await rejectPendingTrip(io, trip._id, driverId, by, reason);
        }, 600000);


        res.json({
            success: true,
            tripId: trip._id,
            expiresIn: 30 // Tiempo para aceptar (segundos)
        });

    } catch (error) {
        console.error('Error en reassignUserTrip:', error);
        res.status(500).json({
            success: false,
            error: 'Error al reasignar viaje',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// manejador para los condutores
// debe recibir el id del viaje y la respuesta del conductor (aceptar o rechazar)
// y notificar al usuario sobre la respuesta del conductor
export const handleDriverResponse = async (req, res) => {
    try {
        const { tripId, accepted } = req.body;
        const driverId = req.user.id;

        const io = socketInstance.getIO();

        // Actualizar el viaje
        const trip = await Trip.findOneAndUpdate(
            {
                _id: tripId,
                // driver: driverId,
                status: 'pending'
            },
            {
                status: accepted ? 'accepted' : 'rejected'
            },
            { new: true }
        ).populate('user', 'username rating');
        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Viaje no encontrado o ya fue procesado'
            });
        }
        // si accepted es falso actualizar counter
        // actualizar counteer de viaje rechazados y agregar conduntor a la lista
        if (trip && accepted === false) {
            // Verificar si el conductor ya fue rechazado
            if (!trip.rejectedDrivers.includes(driverId)) {
                trip.rejectedDrivers.push(driverId);
                trip.reassignmentAttempts += 1; // Incrementar el contador de intentos de reasignación
                if (trip.reassignmentAttempts >= 3) {
                    trip.reassignmentAttempts = 0; // Reiniciar el contador si se alcanza el límite
                    // cancelar viaje
                    trip.status = 'cancelled'; // Cambiar el estado a cancelado
                    trip.cancellationDetails = {
                        by: 'system',
                        reason: 'No hay conductores disponibles',
                        timestamp: new Date()
                    };
                } else {
                    trip.status = 'rejected'; // Mantener el estado como pendiente si no se alcanza el límite
                }
                trip.cancellationDetails = {
                    by: 'driver',
                    reason: 'Rechazo del viaje',
                    timestamp: new Date()
                };

                // quitar conductor del viaje
                trip.driver = null;
                // Guardar los cambios en la base de datos
                await trip.save();
            }
        }
        // Notificar al usuario sobre la respuesta del conductor          
        console.log('trip', trip);


        // Notificar al usuario sobre la respuesta del conductor
        notifyUser(io, trip.user._id.toString(), {
            type: 'trip_status',
            status: trip.status,
            tripId: trip._id,
            ...(accepted && {
                driver: {
                    id: driverId,
                    name: req.user.username,
                    vehicle: req.user.vehicle // Asegúrate de popular esto
                }
            }),
            timestamp: new Date()
        });

        res.json({
            success: true,
            status: trip.status,
            tripId: trip._id
        });
    } catch (error) {
        console.error('Error en handleDriverResponse:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar respuesta',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener todos los viaje
