import mongoose from "mongoose";
import Logger from "../utils/logger.js";
// MOdelos
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
// Servicios
import { createUser } from "../services/user.service.js";
import { createVehicle, validateVehicles } from "../services/vehicle.service.js";
import { validateEmail } from "../utils/validators.js";
import { createNotification } from "../services/notification.service.js";
import { logAdminActivity, logRoleUpdate } from "../services/logAdminActivity.js";


// Registrar usuario y vehiculo del mismo
export const registerUser = async (req, res) => {
    const userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        role: req.body.role,
    };

    // verificar que los campos no esten vacios
    if (!userData.username || !userData.email || !userData.password || !userData.phone || !userData.role) {
        return res.status(400).json({
            success: false,
            error: "Campos requeridos: username, email, password, role, phoneee"
        });
    }

    if (!/^\+?\d{8,15}$/.test(userData.phone)) {
        return res.status(400).json({
            success: false,
            error: "Formato de teléfono inválido. Ejemplo: +1234567890 (8-15 dígitos)"
        });
    }

    // // verificar que el role sea uno de los permitidos
    if (!["user", "driver", "admin"].includes(userData.role)) {
        return res.status(400).json(
            {
                success: false,
                error: "Rol de usuario no es valido, permitidos ['user', 'driver'"
            });
    }

    const vehicleData = {
        rand: req.body.rand,
        model: req.body.model,
        license: req.body.license,
        type: req.body.type,
        passengerCapacity: req.body.passengerCapacity,
        luggageCapacity: req.body.luggageCapacity,
        insurancePhotos: req.body.insurancePhotos,
    };

    // // verificar que el usuario sea de tipo driver
    // // revisar si role es driver
    if (userData.role === 'driver') {

        //     // Validar datos requeridos
        if (!vehicleData.rand ||
            !vehicleData.model ||
            !vehicleData.license ||
            !vehicleData.type ||
            !vehicleData.passengerCapacity ||
            !vehicleData.luggageCapacity ||
            !vehicleData.insurancePhotos) {
            return res.status(400).json({
                success: false,
                error: "Campos requeridos: rand, model, license, type, passengerCapacity, luggageCapacity, insurancePhotos"
            });
        }

        // Validar type de vehiculo "motorbike", "tricycle", "bicycle", "light_car", "truck"
        const validTypes = ["motorbike", "tricycle", "bicycle", "light_car", "truck"];
        if (vehicleData.type && !validTypes.includes(vehicleData.type)) {
            return res.status(400).json(
                {
                    success: false,
                    error: "Tipo de vehículo inválido, datos validos: motorbike, tricycle, bicycle, light_car, truck"
                });
        }
        // verificar si la matricula del vehiculo ya existe
        const isvehicle = await validateVehicles(vehicleData.license);
        if (isvehicle) {
            return res.status(400).json({
                success: false,
                error: `Matricula ${vehicleData.license} ya registrada`
            });
        }

        // verificar capacidad de pasajeros y equipaje
        if (vehicleData.passengerCapacity < 1) {
            return res.status(400).json({
                success: false,
                error: "La capacidad de pasajeros debe ser al menos 1"
            });
        }
        if (vehicleData.luggageCapacity < 0) {
            return res.status(400).json({
                success: false,
                error: "La capacidad de equipaje debe ser al menos 0"
            });
        }
    }
    try {
        // verificar si el usuario ya existe atraves del email  
        const emailFound = await User.findOne({ email: userData.email })

        if (emailFound) {
            return res.status(400).json({
                success: false,
                error: `El email ${userData.email} ya está registrado`
            });
        }

        // verificar si el usuario ya existe atraves del telefono
        const userFound = await User.findOne({ phone: userData.phone })
        if (userFound) {
            return res.status(400).json({
                success: false,
                error: `El teléfono ${userData.phone} ya está registrado`
            });
        }

        // crear nuevo usuario        
        const user = await createUser(userData);


        // Si el rol es 'driver', crear un vehículo asociado
        if (userData.role === 'driver') {
            vehicleData.driver = user._id; // Asignar el ID del conductor al vehículo
            const vehicle = await createVehicle(vehicleData);
            user.vehicle = vehicle._id; // Guardar el ID del vehículo en el usuario
            await user.save(); // Guardar el usuario con el ID del vehículo

            // crear registro de actividad al crear un usuario
            const activityLog = {
                userId: req.user.id,
                action: 'user_create',
                targetType: user.role,
                targetId: user._id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    userData,
                    vehicleData,
                }
            };
            // Guardar el registro de actividad (si es necesario)
            await logAdminActivity(activityLog);

            res.status(201).json({ success: true, user: user, vehicle: vehicle });
        } else {
            // crear registro de actividad al crear un usuario
            const activityLog = {
                userId: req.user.id,
                action: 'user_create',
                targetType: user.role,
                targetId: user._id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    userData,
                    vehicleData: null,
                }
            };

            // Guardar el registro de actividad (si es necesario)
            await logAdminActivity(activityLog);
            res.status(201).json({ success: true, user: user });
        }

    } catch (error) {
        Logger.error(error);
        return res.status(500).json({
            success: false,
            error: "Error al crear el usuario",
            data: null
        });
    }
}

// Obtener usuario por id
export const getUserById = async (req, res) => {
    // obtener parameto
    const { id } = req.params;

    // Validación mejorada de ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Se requiere un ID de usuario válido",
            error: "invalid_input",
            details: "El ID debe ser una cadena no vacía"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Formato de ID no válido",
            error: "invalid_id_format",
            details: "El ID debe ser un ObjectId válido de MongoDB"
        });
    }

    try {
        const user = await User.findById(id)
            .select('username email phone role createdAt updatedAt')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                error: "not_found",
                details: `No existe usuario con ID: ${id}`
            });
        }

        // si el usuario es conductor, obtener datos del vehiculo
        if (user.role === 'driver') {
            const vehicle = await Vehicle.findOne({ driverId: id })
                .select('license brand model type passengerCapacity luggageCapacity')
                .lean();
            if (vehicle) {
                user.vehicle = vehicle;
            } else {
                user.vehicle = null; // No se encontró vehículo asociado
            }
        }

        return res.status(200).json({
            user: user
        });
    } catch (error) {
        Logger.error(`[UserService] Error al obtener usuario ${id}:`, error);

        const response = {
            success: false,
            message: "Error al procesar la solicitud"
        };

        if (error instanceof mongoose.Error.CastError) {
            response.message = "ID de usuario no válido";
            response.error = "invalid_id_format";
            return res.status(400).json(response);
        }

        if (process.env.NODE_ENV === 'development') {
            response.error = error.message;
            response.stack = error.stack;
        }

        return res.status(500).json(response);
    }
}

// Actualizar usuario
export const updateUser = async (req, res) => {
    const userId = req.params.id;


    // Verificar permisos admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            error: "No autorizado"
        });
    }

    // Preparar datos
    const userData = {
        username: req.body.username,
        email: req.body.email,
        phone: '+53' + req.body.phone,
        ...(req.user.role === 'admin' && { role: req.body.role }) // Solo admin puede cambiar rol
    };

    // Validar datos requeridos
    if (!userData.username || !userData.email || !userData.phone) {
        return res.status(400).json({
            success: false,
            error: "Campos requeridos: username, email, phone"
        });
    }

    // Validación de EMAIL (añadir junto a las otras validaciones)
    if (!userData.email || !validateEmail(userData.email)) {
        return res.status(400).json({
            success: false,
            error: "Formato de email inválido. Use: usuario@dominio.com"
        });
    }

    // Validaciones avanzadas
    if (!/^\+[1-9]\d{1,14}$/.test(userData.phone)) {
        return res.status(400).json({
            success: false,
            error: "Formato de teléfono inválido. Use formato internacional: +521234567890"
        });
    }

    // verificar que el role sea uno de los permitidos
    if (!["user", "driver", "admin"].includes(userData.role)) {
        return res.status(400).json(
            {
                success: false,
                error: "Rol de usuario no es valido, permitidos ['user', 'driver', admin"
            });
    }

    try {
        // Verificar si el usuario existe        
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        // Verificar unicidad (en paralelo)
        const [emailExists, phoneExists] = await Promise.all([
            User.findOne({ email: userData.email, _id: { $ne: userId } }),
            User.findOne({ phone: userData.phone, _id: { $ne: userId } })
        ]);

        if (emailExists || phoneExists) {
            return res.status(400).json({
                success: false,
                error: emailExists ? "Email ya registrado" : "Teléfono ya registrado"
            });
        }

        // Actualizar usuario
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            userData,
            { new: true, select: '-password' } // Excluir password
        );

        //  Manejo de vehículos (si es admin)
        if (req.user.role === 'admin') {
            if (userData.role === 'driver') {
                updatedUser.vehicle = await Vehicle.findOne({ driverId: userId }).lean() || null;
            } else if (existingUser.role === 'driver') {
                await Vehicle.deleteMany({ driverId: userId });
            }
        }

        // Responder
        return res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);

        const response = {
            success: false,
            error: "Error interno del servidor"
        };

        if (error instanceof mongoose.Error.CastError) {
            response.error = "ID de usuario inválido";
            return res.status(400).json(response);
        }

        return res.status(500).json(response);

    }
}

// Eliminar usuario por id
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Verificar permisos admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: "No autorizado"
        });
    }

    // Validación básica
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID de usuario requerido",
            error: "missing_user_id"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "ID del usuario no válido",
            error: "invalid_user_id"
        });
    }

    try {
        // Verificar si el usuario existe        
        const user = await User.findById(id);

        if (user?.isRoot) {
            return res.status(403).json({
                success: false,
                message: "No se puede eliminar el usuario root"
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        // Eliminar vehículo asociado (si es conductor)
        if (user.role === 'driver') {
            // verificar si el conductor tiene viajes asignados implementar despues
            await Vehicle.deleteMany({ driverId: id });
        }

        // Eliminar usuario
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Usuario eliminado correctamente",
            data: { userId: id }
        });
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);

        const response = {
            success: false,
            error: "Error interno del servidor"
        };

        if (error instanceof mongoose.Error.CastError) {
            response.error = "ID de usuario inválido";
            return res.status(400).json(response);
        }

        return res.status(500).json(response);
    }
}

// Actualizacion de rol
export const updateRole = async (req, res) => {

    const { id: targetUserId } = req.params;
    const { role: newRole } = req.body;
    const currentAdmin = req.user;

    try {
        // Validar que el usuario que realiza la peticion sea admin
        if (currentAdmin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: "No tienes permiso para realizar esta accion"
            })
        }

        // Validar datos de entrada
        if (!newRole || !['user', 'driver', 'admin'].includes(newRole)) {
            return res.status(403).json({
                success: false,
                error: "Rol inválido. Roles permitidos: user, driver, admin"
            })
        }

        // Buscar usuario a actualizar
        const user = await User.findById(targetUserId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            })
        }

        //  Validar auto-modificación
        if (currentAdmin.id === targetUserId) {
            return res.status(400).json({
                success: false,
                error: "No puedes cambiar tu propio rol"
            });
        }

        // Validar si el rol es el mismo (NUEVA VALIDACIÓN)
        if (user.role === newRole) {
            return res.status(200).json({
                success: true,
                message: `El usuario ya tiene el rol "${newRole}". No se realizaron cambios.`,
                currentRole: newRole,
                userId: targetUserId
            });
        }

        // Registrar cambio previo para notificación
        const previousRole = user.role;

        // actualizar rol
        user.role = newRole;
        await user.save();

        //  Registrar en AdminActivityLog
        await logRoleUpdate({
            userId: currentAdmin.id,
            targetUserId,
            previousRole,
            newRole,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Notificación vía WebSocket
        await createNotification({
            userId: targetUserId,
            title: 'Actualización de rol',
            body: `Tu rol cambió de ${previousRole} a ${newRole}`,
            type: 'role_update',
            metadata: {
                changedByAdmin: currentAdmin.id,
                timestamp: new Date()
            }
        });

        // if (role !== 'driver' && userToUpdate.role === 'driver') {
        //     await Trip.updateMany(
        //         { driverId: id, status: { $in: ['accepted', 'in_progress'] } },
        //         { status: 'cancelled', cancellationReason: 'Driver role changed' }
        //     );
        // }

        // Manejar relaciones (ej: eliminar vehículo si ya no es conductor)
        if (previousRole === 'driver' && newRole !== 'driver') {
            await Vehicle.deleteMany({ driverId: targetUserId });
            // await Trip.updateMany(
            //     { driverId: id, status: { $nin: ['completed', 'cancelled'] }},
            //     { status: 'cancelled', cancellationReason: 'Driver role changed' }
            // );
        }

        // 7. Registrar acción
        Logger.info(`Admin ${currentAdmin.id} cambió rol de usuario ${targetUserId} a ${newRole}`);

        //  Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: "Rol actualizado correctamente",
            data: {
                userId: targetUserId,
                previousRole,
                newRole: newRole,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        Logger.error(`Error updating role: ${error.message}`);

        if (userToUpdate && oldRole) {
            await AdminActivityLog.create({
                adminId: currentAdmin.id,
                action: 'role_update',
                targetType: 'user',
                targetId: targetUserId,
                status: 'failed',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    error: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            });
        }

        const response = {
            success: false,
            error: "Error interno del servidor"
        };

        if (error instanceof mongoose.Error.CastError) {
            response.error = "ID de usuario inválido";
            return res.status(400).json(response);
        }

        if (process.env.NODE_ENV === 'development') {
            response.details = error.message;
            response.stack = error.stack;
        }

        return res.status(500).json(response);
    }
}