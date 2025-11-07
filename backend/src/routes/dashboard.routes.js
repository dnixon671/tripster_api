import { Router } from "express";
import { authenticate, authorizeRole } from "../config/auth.js";
import { getClientDashboard, getDriverDashboard, getDashboard } from "../controllers/dashboard.controller.js";

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints para dashboards de clientes y choferes
 */

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtener dashboard según el rol del usuario
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboard:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol no válido
 */
router.get('/', getDashboard);

/**
 * @swagger
 * /dashboard/client:
 *   get:
 *     summary: Obtener dashboard de cliente
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard de cliente obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalTrips:
 *                           type: number
 *                         activeTrips:
 *                           type: number
 *                         completedTrips:
 *                           type: number
 *                     recentTrips:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo accesible para clientes
 */
router.get('/client', authorizeRole('client'), getClientDashboard);

/**
 * @swagger
 * /dashboard/driver:
 *   get:
 *     summary: Obtener dashboard de chofer
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard de chofer obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     driver:
 *                       type: object
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalTrips:
 *                           type: number
 *                         activeTrips:
 *                           type: number
 *                         completedTrips:
 *                           type: number
 *                         earnings:
 *                           type: number
 *                     recentTrips:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo accesible para choferes
 */
router.get('/driver', authorizeRole('driver'), getDriverDashboard);

export default router;
