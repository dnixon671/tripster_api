import { Router } from "express";

import { authenticate, authorizeRole } from "../config/auth.js";
import { handleDriverResponse, reassignUserTrip, requestUserTrip, searchNearbyDrivers } from "../controllers/trip.controller.js";

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Gestión de viajes y solicitudes de transporte
 */

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /trips/drivers/nearby:
 *   get:
 *     summary: Buscar conductores cercanos
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud de la ubicación actual
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud de la ubicación actual
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Radio de búsqueda en metros
 *     responses:
 *       200:
 *         description: Lista de conductores cercanos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 drivers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       location:
 *                         $ref: '#/components/schemas/Location'
 *                       distance:
 *                         type: number
 *                       isAvailable:
 *                         type: boolean
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 */
// localizar conductores cercanos a una ubicacion
router.get('/drivers/nearby', authorizeRole('client'), searchNearbyDrivers);

/**
 * @swagger
 * /trips/request:
 *   post:
 *     summary: Solicitar un viaje
 *     tags: [Trips]
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
 *               - origin
 *               - destination
 *             properties:
 *               origin:
 *                 $ref: '#/components/schemas/Location'
 *               destination:
 *                 $ref: '#/components/schemas/Location'
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de salida deseada
 *               maxPrice:
 *                 type: number
 *                 description: Precio máximo a pagar
 *               notes:
 *                 type: string
 *                 description: Notas adicionales para el conductor
 *     responses:
 *       201:
 *         description: Solicitud de viaje creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trip:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo usuarios pueden solicitar viajes
 */
// Solicitar un viaje
router.post("/request", authorizeRole('client'), requestUserTrip);

/**
 * @swagger
 * /trips/reassign:
 *   post:
 *     summary: Reasignar un viaje a otro conductor
 *     tags: [Trips]
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
 *               - tripId
 *             properties:
 *               tripId:
 *                 type: string
 *                 description: ID del viaje a reasignar
 *               reason:
 *                 type: string
 *                 description: Razón de la reasignación
 *     responses:
 *       200:
 *         description: Viaje reasignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trip:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Viaje no encontrado
 */
// Reasignar un viaje a un conductor
router.post("/reassign", authorizeRole('client'), reassignUserTrip);

/**
 * @swagger
 * /trips/respond:
 *   post:
 *     summary: Responder a una solicitud de viaje (conductores)
 *     tags: [Trips]
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
 *               - tripId
 *               - response
 *             properties:
 *               tripId:
 *                 type: string
 *                 description: ID del viaje
 *               response:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Respuesta del conductor
 *               estimatedArrival:
 *                 type: number
 *                 description: Tiempo estimado de llegada en minutos (si acepta)
 *               price:
 *                 type: number
 *                 description: Precio propuesto para el viaje
 *     responses:
 *       200:
 *         description: Respuesta procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trip:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo conductores pueden responder
 *       404:
 *         description: Viaje no encontrado
 */
// Respuestas del conductor a la solicitud de viaje
router.post('/respond', authorizeRole('driver'), handleDriverResponse);

export default router;