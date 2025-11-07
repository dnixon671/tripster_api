import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/profile_pictures');

/**
 * @route POST /api/profile/picture
 * @desc Subir foto de perfil
 * @access Private
 */
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen'
            });
        }

        const userId = req.user.id;
        const filePath = req.file.path;

        // Actualizar usuario con el nombre del archivo
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePhoto: req.file.filename },
            { new: true }
        ).select('-password');

        // Eliminar foto anterior si existe
        const oldPhotos = fs.readdirSync(uploadDir).filter(file =>
            file.startsWith(`${userId}_`) && file !== req.file.filename
        );

        oldPhotos.forEach(photo => {
            const oldPath = path.join(uploadDir, photo);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        });

        res.json({
            success: true,
            message: 'Foto de perfil actualizada correctamente',
            data: {
                user,
                profilePictureUrl: `/api/profile_picture/${userId}`
            }
        });

    } catch (error) {
        console.error('Error al subir foto de perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir la foto de perfil',
            error: error.message
        });
    }
};

/**
 * Genera una imagen de perfil por defecto con las iniciales del usuario
 */
const generateDefaultAvatar = async (username, size) => {
    const initial = username ? username.charAt(0).toUpperCase() : '?';

    // Colores predefinidos
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];

    // Seleccionar color basado en la inicial
    const colorIndex = initial.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    // Crear SVG
    const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${size}" height="${size}" fill="${bgColor}"/>
            <text 
                x="50%" 
                y="50%" 
                font-family="Arial, sans-serif" 
                font-size="${size * 0.5}" 
                font-weight="bold" 
                fill="white" 
                text-anchor="middle" 
                dominant-baseline="central"
            >${initial}</text>
        </svg>
    `;

    // Convertir SVG a imagen PNG
    return await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toBuffer();
};

/**
 * @route GET /api/profile_picture/:userId?s=size
 * @desc Obtener foto de perfil de un usuario con tamaño opcional
 * @access Public
 */
export const getProfilePicture = async (req, res) => {
    try {
        const { userId } = req.params;
        const size = parseInt(req.query.s) || 200; // Tamaño por defecto 200x200

        console.log(`📸 Request for profile picture - UserID: ${userId}, Size: ${size}`);

        // Validar tamaño
        if (size < 10 || size > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El tamaño debe estar entre 10 y 1000 píxeles'
            });
        }

        // Buscar usuario
        const user = await User.findById(userId).select('profilePhoto username phone');

        console.log(`👤 User found:`, user ? 'Yes' : 'No');
        console.log(`📷 Profile photo:`, user?.profilePhoto || 'None');

        // Si no existe el usuario, generar avatar por defecto
        if (!user) {
            console.log('⚠️ User not found, generating default avatar');
            const defaultImage = await generateDefaultAvatar('?', size);
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=3600');
            return res.send(defaultImage);
        }

        // Si no tiene foto, generar avatar con iniciales
        if (!user.profilePhoto) {
            console.log('📝 No profile photo, generating avatar with initials');
            const displayName = user.username || user.phone || '?';
            const defaultImage = await generateDefaultAvatar(displayName, size);
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=3600');
            return res.send(defaultImage);
        }        // Ruta del archivo original
        const filePath = path.join(uploadDir, user.profilePhoto);

        if (!fs.existsSync(filePath)) {
            console.log('⚠️ Photo file not found, generating default avatar');
            const displayName = user.username || user.phone || '?';
            const defaultImage = await generateDefaultAvatar(displayName, size);
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=3600');
            return res.send(defaultImage);
        }

        console.log('✅ Serving user photo from file');

        // Redimensionar imagen con sharp
        const resizedImage = await sharp(filePath)
            .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Enviar imagen
        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
        res.send(resizedImage);

    } catch (error) {
        console.error('Error al obtener foto de perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la foto de perfil',
            error: error.message
        });
    }
};

/**
 * @route DELETE /api/profile/picture
 * @desc Eliminar foto de perfil
 * @access Private
 */
export const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('profilePhoto');

        if (!user || !user.profilePhoto) {
            return res.status(404).json({
                success: false,
                message: 'No hay foto de perfil para eliminar'
            });
        }

        // Eliminar archivo
        const filePath = path.join(uploadDir, user.profilePhoto);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Actualizar usuario
        user.profilePhoto = null;
        await user.save();

        res.json({
            success: true,
            message: 'Foto de perfil eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar foto de perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la foto de perfil',
            error: error.message
        });
    }
};
