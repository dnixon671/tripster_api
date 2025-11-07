import jwt from 'jsonwebtoken';
import { HTTP_STATUS_FORBIDDEN, JWT_SECRET } from '../config/config.js';


// generar token
export function generateToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' },
            (err, token) => {
                if (err) return reject(err);
                resolve(token);
            });
    }
    );
}

// Verifiacion de autenitcacion
export const authenticate = (req, res, next) => {

    // Obtener el token del encabezado "Authorization" o de las cookies
    let token = req.cookies.token;

    // Si no hay token en cookies, buscar en el header Authorization
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        // Extraer el token del formato "Bearer token"
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remover "Bearer "
        } else {
            token = authHeader;
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    // Verificar el token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Manejar diferentes tipos de errores
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: "Token expirado" });
            }
            return res.status(403).json({ message: "Token inválido" });
        }

        // Adjuntar la información del usuario a la solicitud
        req.user = user;
        next(); // Continuar con la siguiente función (controlador)
    });

};

// Roles y permisos
export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res
                .status(HTTP_STATUS_FORBIDDEN)
                .json({ message: `Acceso denegado. El rol (${req.user ? req.user.role : 'undefined'}) no está autorizado para acceder a este recurso.` });
        }
        next();
    };
};