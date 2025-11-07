import rateLimit from "express-rate-limit";

// Configuración general para todas las rutas
export  const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: {
    success: false,
    message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde"
  },
  standardHeaders: true, // Retorna info de límites en headers
  legacyHeaders: false, // Desactiva headers antiguos
});


// Límite más estricto para registro de usuarios
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Máximo 5 registros por hora desde una IP
    message: {
      success: false,
      message: "Demasiados intentos de registro desde esta IP, por favor intenta más tarde"
    }
  });