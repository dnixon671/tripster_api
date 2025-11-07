import User from "../models/User.js";
import Logger from "../utils/logger.js";

// Actualizar perfil de usuario
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        console.log('📝 Actualizando perfil para userId:', userId);
        console.log('📝 Datos recibidos:', { username, email });

        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        console.log('👤 Usuario encontrado:', user.phone);

        // Actualizar campos (profilePhoto se maneja en profilePicture.controller.js)
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;

        await user.save();

        console.log('✅ Perfil actualizado:', { username: user.username, email: user.email });

        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            user: {
                id: user._id,
                phone: user.phone,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto,
                role: user.role
            }
        });

    } catch (error) {
        Logger.error("Error en updateProfile:", error);
        res.status(500).json({
            success: false,
            error: "Error al actualizar perfil",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener perfil de usuario
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                phone: user.phone,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto,
                role: user.role,
                rating: user.rating,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        Logger.error("Error en getProfile:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener perfil",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
