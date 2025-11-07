// routes/notificationRoutes.js
import { Router } from "express";
import { getUserNotifications } from '../controllers/notificationController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/notifications', authenticate, getUserNotifications);

export default router;