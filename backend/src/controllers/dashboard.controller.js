import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Logger from "../utils/logger.js";

// Dashboard para clientes
export const getClientDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener información del usuario
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        // Verificar que sea un cliente
        if (user.role !== 'client') {
            return res.status(403).json({
                success: false,
                error: "Acceso denegado. Este endpoint es solo para clientes"
            });
        }

        // Obtener viajes del cliente
        const trips = await Trip.find({
            passengers: userId
        })
            .populate('driver', 'phone username rating')
            .sort({ createdAt: -1 })
            .limit(10);

        // Obtener estadísticas
        const stats = {
            totalTrips: await Trip.countDocuments({ passengers: userId }),
            activeTrips: await Trip.countDocuments({
                passengers: userId,
                status: { $in: ['pending', 'accepted', 'in_progress'] }
            }),
            completedTrips: await Trip.countDocuments({
                passengers: userId,
                status: 'completed'
            })
        };

        res.status(200).json({
            success: true,
            dashboard: {
                user: {
                    id: user._id,
                    phone: user.phone,
                    username: user.username,
                    role: user.role,
                    rating: user.rating,
                    isOnline: user.isOnline
                },
                stats,
                recentTrips: trips
            }
        });

    } catch (error) {
        Logger.error("Error en getClientDashboard:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener datos del dashboard",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Dashboard para choferes
export const getDriverDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener información del usuario/chofer
        const driver = await User.findById(userId)
            .select('-password')
            .populate('vehicle');

        if (!driver) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        // Verificar que sea un chofer
        if (driver.role !== 'driver') {
            return res.status(403).json({
                success: false,
                error: "Acceso denegado. Este endpoint es solo para choferes"
            });
        }

        // Obtener viajes del chofer
        const trips = await Trip.find({
            driver: userId
        })
            .populate('passengers', 'phone username rating')
            .sort({ createdAt: -1 })
            .limit(10);

        // Obtener estadísticas
        const stats = {
            totalTrips: await Trip.countDocuments({ driver: userId }),
            activeTrips: await Trip.countDocuments({
                driver: userId,
                status: { $in: ['pending', 'accepted', 'in_progress'] }
            }),
            completedTrips: await Trip.countDocuments({
                driver: userId,
                status: 'completed'
            }),
            earnings: 0 // Aquí se puede calcular las ganancias si tienes ese campo
        };

        // Calcular ganancias totales de viajes completados
        const completedTrips = await Trip.find({
            driver: userId,
            status: 'completed'
        }).select('price');

        stats.earnings = completedTrips.reduce((total, trip) => {
            return total + (trip.price || 0);
        }, 0);

        res.status(200).json({
            success: true,
            dashboard: {
                driver: {
                    id: driver._id,
                    phone: driver.phone,
                    username: driver.username,
                    role: driver.role,
                    rating: driver.rating,
                    isOnline: driver.isOnline,
                    driverStatus: driver.driverStatus,
                    vehicle: driver.vehicle,
                    location: driver.location
                },
                stats,
                recentTrips: trips
            }
        });

    } catch (error) {
        Logger.error("Error en getDriverDashboard:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener datos del dashboard",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Endpoint genérico que redirige según el rol
export const getDashboard = async (req, res) => {
    const userRole = req.user.role;

    if (userRole === 'client') {
        return getClientDashboard(req, res);
    } else if (userRole === 'driver') {
        return getDriverDashboard(req, res);
    } else {
        return res.status(403).json({
            success: false,
            error: "Rol no válido para dashboard"
        });
    }
};
