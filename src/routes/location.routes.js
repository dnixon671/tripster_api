import { Router } from "express";

import { authenticate } from "../config/auth.js";
import { getDriverLocation, updateLocation } from "../controllers/location.controller.js";
import { validateCoordinates } from "../middlewares/geo/coordinatesValidation.js";

const router = Router();

router.use(authenticate);
// Actualizar propia ubicación
router.post('/location',  updateLocation);

// Obtener ubicación de conductor (para clientes)
router.get('/drivers/:driverId/location', validateCoordinates, getDriverLocation);

export default router;