import express from 'express';
import { authenticate } from '../config/auth.js';
import { upload } from '../middlewares/upload.js';
import {
    uploadProfilePicture,
    getProfilePicture,
    deleteProfilePicture
} from '../controllers/profilePicture.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/profile/picture:
 *   post:
 *     summary: Subir foto de perfil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (jpeg, jpg, png, gif, webp)
 *     responses:
 *       200:
 *         description: Foto subida correctamente
 *       400:
 *         description: No se proporcionó imagen
 *       401:
 *         description: No autorizado
 */
router.post('/profile/picture', authenticate, upload.single('photo'), uploadProfilePicture);

/**
 * @swagger
 * /api/profile_picture/{userId}:
 *   get:
 *     summary: Obtener foto de perfil de un usuario
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: s
 *         schema:
 *           type: integer
 *           default: 200
 *         description: Tamaño de la imagen en píxeles (10-1000)
 *     responses:
 *       200:
 *         description: Imagen de perfil
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Foto no encontrada
 */
router.get('/profile_picture/:userId', getProfilePicture);

/**
 * @swagger
 * /api/profile/picture:
 *   delete:
 *     summary: Eliminar foto de perfil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto eliminada correctamente
 *       404:
 *         description: No hay foto para eliminar
 *       401:
 *         description: No autorizado
 */
router.delete('/profile/picture', authenticate, deleteProfilePicture);

export default router;
