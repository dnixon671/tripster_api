import { Router } from "express";

import { authenticate, authorizeRole } from "../config/auth.js";
import { handleDriverResponse, reassignUserTrip, requestUserTrip, searchNearbyDrivers } from "../controllers/trip.controller.js";

const router = Router();

router.use(authenticate);



// localizar conductores cercanos a una ubicacion
router.get('/drivers/nearby', authorizeRole('user'), searchNearbyDrivers);
// Solicitar un viaje
router.post("/request", authorizeRole('user'), requestUserTrip);
// Reasignar un viaje a un conductor
router.post("/reassign", authorizeRole('user'), reassignUserTrip);
// Respuestas del conductor a la solicitud de viaje
router.post('/respond', authorizeRole('driver'), handleDriverResponse);

export default router;