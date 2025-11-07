import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { authenticate } from "../config/auth.js";


const router = Router();

// registrar nuevos usuarios desde el front-end movil
router.post("/register", registerUser);

// iniciar seccion de usuario desde el front-end movil
router.post("/login", loginUser);

// cerrar seccion
router.post("/logout",authenticate, logoutUser);

// verificar el token de acceso
// router.get("/verify", verifyToken);

// ruta de prueba obtener perfil
// router.get("/profile", authenticate, getProfile);


export default router;