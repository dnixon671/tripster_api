// routes/notificationRoutes.js
import { Router } from "express";
import { getUserNotifications } from '../controllers/notificationController.js';
import { authenticate } from '../config/auth.js';

const router = Router();

router.get('/notifications', authenticate, getUserNotifications);

export default router;