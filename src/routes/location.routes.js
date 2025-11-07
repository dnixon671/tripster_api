import { Router } from "express";

import { authenticate } from "../config/auth.js";
import { getDriverLocation, updateLocation } from "../controllers/location.controller.js";
import { validateCoordinates } from "../middlewares/geo/coordinatesValidation.js";

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Gestión de ubicaciones y seguimiento en tiempo real
 */

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /map/location:
 *   post:
 *     summary: Actualizar ubicación del usuario
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coordinates
 *             properties:
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *                 minItems: 2
 *                 maxItems: 2
 *                 description: Coordenadas [longitud, latitud]
 *                 example: [-74.0059, 40.7128]
 *               address:
 *                 type: string
 *                 description: Dirección legible (opcional)
 *               heading:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 360
 *                 description: Dirección en grados (opcional)
 *               speed:
 *                 type: number
 *                 minimum: 0
 *                 description: Velocidad en km/h (opcional)
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 location:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Coordenadas inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 */
// Actualizar propia ubicación
router.post('/location', updateLocation);

/**
 * @swagger
 * /map/drivers/{driverId}/location:
 *   get:
 *     summary: Obtener ubicación de un conductor específico
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Ubicación del conductor obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 driver:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     location:
 *                       $ref: '#/components/schemas/Location'
 *                     lastUpdate:
 *                       type: string
 *                       format: date-time
 *                     isOnline:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Conductor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener ubicación de conductor (para clientes)
router.get('/drivers/:driverId/location', validateCoordinates, getDriverLocation);

export default router;