import { generateToken } from "../config/auth.js";
import User from "../models/User.js";
import { createUser, changeIsOnline } from "../services/user.service.js";
import { logAdminActivity } from "../services/logAdminActivity.js";

import { NODE_ENV, TOKEN_HOURS } from "../config/config.js";
import Logger from "../utils/logger.js";

// Regustrar usuario desde el front-end movil
export const registerUser = async (req, res) => {
    const { phone, password } = req.body;
    const role = "user"; // Asignar rol por defecto a "user"
    // crear variable limpio para almacenar el usuario 

    try {
        // verificar que los campos no esten vacios
        if (!phone || !password || !role) {
            return res.status(400).json({
                success: false,
                error: "Campos requeridos: phone, password, role"
            });
        }

        if (!/^\+?\d{8,15}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                error: "Formato de teléfono inválido. Ejemplo: +1234567890 (8-15 dígitos)"
            });
        }

        // verificar que el role sea uno de los permitidos
        if (!["user", "driver", "admin"].includes(role)) {
            return res.status(400).json(
                {
                    success: false,
                    error: "Rol de usuario no es valido, permitidos ['user', 'driver'"
                });
        }

        // verificar si el usuario ya existe atraves del telefono
        const userFound = await User.findOne({ phone })
        if (userFound) {
            return res.status(400).json({
                success: false,
                error: `El teléfono ${phone} ya está registrado`
            });
        }

        const userData = {
            phone,
            password,
            role,
        };

        // crear nuevo usuario
        const user = await createUser(userData);
        console.log("Usuario creado:", user);  // Log para debugging
        // Verificar si el usuario fue creado correctamente


        // General token de autenticacion para 2 horas
        const _token = await generateToken({ id: user._id, role: user.role });
        // Establecer cookie con opciones de seguridad (opcional)
        res.cookie("token", _token, {
            httpOnly: true,  // Recomendado: true para evitar XSS
            secure: NODE_ENV === 'production',
            maxAge: TOKEN_HOURS,  // 12 horas (coherente con el token)
            sameSite: 'strict',
            path: '/',  // Asegura que la cookie esté disponible en todas las rutas
        });

      
        // Cambiar el estado de conexión del usuario a true
        // Actualizar estado de conexión
        await changeIsOnline(user, user._id); // Cambiar el estado de conexión a true

        // crear registro de actividad cuando se crea un nuevo usuario
        const activityLog = {
            userId: user._id,
            action: 'user_create',
            targetType: 'user',
            targetId: user._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata: {
                system: 'user-management',
                actionSource: 'mobile-app'                
            },
            changes: [{
                field: 'user',
                oldValue: null,
                newValue: {
                    id: user._id,
                    phone: user.phone,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }]
        };
        // Guardar registro de actividad
        await logAdminActivity(activityLog);  

        // NOtificar al admin de la creacion de un nuevo usuario
        // implementar notificacion al admin aqui atraves de websocket o socket.io
        // console.log("Notificando al admin de la creacion de un nuevo usuario:", user);  // Log para debugging

        // Enviar respuesta al cliente
        res.status(201).json({
                    success: true,
                    user: {
                        id: user._id,
                        phone: user.phone,
                        role: user.role,
                        online: user.isOnline,
                        createdAt: user.createdAt
                    },
                    token: _token  // Opcional: Enviar token también en la respuesta (aparte de la cookie)
                });

            } catch(error) {
                Logger.error("Error en registerUser:", error);  // Log para debugging
                console.error("Error en registerUser:", error);  // Log para debugging
                res.status(500).json({  // Usa 500 para errores de servidor inesperados
                    success: false,
                    error: "Error al registrar el usuario. Contacte al soporte",
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }


        // Iniciar seccion de usuario desde el front-end movil
        export const loginUser = async (req, res) => {
            const { phone, password } = req.body;

            try {
                // verificar que los campos no esten vacios
                if (!phone || !password) {
                    return res.status(400).json({
                        success: false,
                        error: "Campos requeridos: phone, password"
                    });
                }

                // verificar que el formato del telefono sea correcto
                if (!/^\+?\d{8,15}$/.test(phone)) {
                    return res.status(400).json({
                        success: false,
                        error: "Formato de teléfono inválido. Ejemplo: +1234567890 (8-15 dígitos)"
                    });
                }


                // Buscar usuario
                const user = await User.findOne({ phone }).select("+password +isActive");
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: `El teléfono ${phone} no está registrado`
                    });
                }

                // Verificar si el usuario está activo
                if (user.isActive === false) {
                    return res.status(403).json({
                        success: false,
                        error: "Cuenta desactivada. Contacte al soporte"
                    });
                }

                // verificar la contraseña
                const isMatch = await user.matchPassword(password);
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        error: "Contraseña incorrecta"
                    });
                }

                // General token de autenticacion para 2 horas
                const _token = await generateToken({ id: user._id, role: user.role });

                // Establecer cookie con opciones de seguridad (opcional)
                res.cookie("token", _token, {
                    httpOnly: true,  // Recomendado: true para evitar XSS
                    secure: NODE_ENV === 'production',
                    maxAge: TOKEN_HOURS,  // 12 horas (coherente con el token)
                    sameSite: 'strict',
                });

                // Actualizar estado de conexión
                await changeIsOnline(user._id);

                
                // Respuesta
                res.status(200).json({
                    success: true,
                    user: {
                        id: user._id,
                        phone: user.phone,
                        role: user.role,
                        online: user.online,
                        isActive: user.isActive,
                        createdAt: user.createdAt
                    }
                    // Omitir token si ya se envía por cookie
                });

            } catch (error) {
                Logger.error("Error en loginUser:", error);  // Log para debugging
                console.error("Error en loginUser:", error);  // Log para debugging
                res.status(500).json({
                    success: false,
                    error: "Error al iniciar sesión. Contacte al soporte",
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }

        // Cerrar seccion de usuario desde el front-end movil
        export const logoutUser = async (req, res) => {
            // console.log("Logout user:", req.user);  // Log para debugging
            try {
                // Verificar si el usuario esta autenticado
                if (!req.user) {
                    return res.status(401).json({ message: "No autorizado" });
                }

                // Cambiar el estado de conexión del usuario a false
                await isOnline(req.user.id);

                // Eliminar la cookie de autenticación
                res.clearCookie("token", {
                    httpOnly: true,
                    secure: NODE_ENV === 'production',
                    sameSite: 'strict',
                });

                res.status(200).json({
                    success: true,
                    message: "Sesión cerrada"
                });
            } catch (error) {
                Logger.error("Error en logoutUser:", error);  // Log para debugging
                console.error("Error en logoutUser:", error);  // Log para debugging
                res.status(500).json({
                    success: false,
                    error: "Error al cerrar sesión. Contacte al soporte",
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }
