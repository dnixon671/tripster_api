import express from "express";
import { updateProfile, getProfile } from "../controllers/profile.controller.js";
import { authenticate } from "../config/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profilePhoto:
 *                       type: string
 *                     role:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/", authenticate, getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               profilePhoto:
 *                 type: string
 *                 description: Imagen en base64 o URL
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/", authenticate, updateProfile);

export default router;
