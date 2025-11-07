import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { authenticate } from "../config/auth.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y gestión de usuarios
 */

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario (cliente o chofer)
 *     description: Endpoint para registrar un nuevo usuario. El usuario debe seleccionar su rol (client o driver) al registrarse.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *               - role
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del usuario (8-15 dígitos)
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [client, driver]
 *                 description: Rol del usuario (client para pasajeros, driver para choferes)
 *                 example: "client"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                     role:
 *                       type: string
 *                       enum: [client, driver]
 *                     online:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *       400:
 *         description: Error de validación (campos faltantes o rol inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       409:
 *         description: El teléfono ya está registrado
 */
// registrar nuevos usuarios desde el front-end movil
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Endpoint para iniciar sesión. Devuelve el rol del usuario para determinar qué dashboard mostrar.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del usuario
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                     role:
 *                       type: string
 *                       enum: [client, driver, admin]
 *                       description: Rol del usuario para determinar el dashboard
 *                     online:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *         headers:
 *           Set-Cookie:
 *             description: Token JWT en cookie
 *             schema:
 *               type: string
 *       401:
 *         description: Contraseña incorrecta
 *       403:
 *         description: Cuenta desactivada
 *       404:
 *         description: Usuario no encontrado
 */
// iniciar seccion de usuario desde el front-end movil
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             description: Cookie eliminada
 *             schema:
 *               type: string
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// cerrar seccion
router.post("/logout", authenticate, logoutUser);

// verificar el token de acceso
// router.get("/verify", verifyToken);

// ruta de prueba obtener perfil
// router.get("/profile", authenticate, getProfile);


export default router;