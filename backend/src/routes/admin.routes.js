import { Router } from "express";
import { authenticate, authorizeRole } from "../config/auth.js";
import { deleteUser, getUserById, registerUser, updateRole, updateUser } from "../controllers/admin.controller.js";



const router = Router();

router.use(authenticate, authorizeRole('admin'));

// gestionar usuarios
// registart nuevo usuario conductor
router.post("/users", registerUser);

// Obtener usuario por id
router.get("/users/:id", getUserById);

// actualizar usuario por id 
router.put("/users/:id", updateUser);

// PUT /api/users/:id/role → Requiere autenticación y rol admin
router.put("/users/:id/role", updateRole);

// eliminar usuario por id
router.delete("/users/:id", deleteUser);

export default router;