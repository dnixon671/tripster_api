import socketio from 'socket.io';

// import {ALLOWED_ORIGINS} from '../config/config.js';
// import { logger } from '../helpers/logger.js';


let io;
const driverSockets = new Map();
const userSockets = new Map();

/**
 * Inicializa Socket.IO y configura CORS.
 * @param {http.Server} server - Servidor HTTP de Express.
 * @returns {socketio.Server} - Instancia de Socket.IO.
 */
export const initSocket  = (server) => {
    try {
        // Inicializar Socket.IO
        io = socketio(server, {
            cors: {
                origin: "*", // Para pruebas (en producción usa tu dominio)
                methods: ["GET", "POST"]
              }         
        });
        
        console.log("Socket.IO initialized successfully with CORS settings.");
        // logger.info("Socket.IO initialized successfully.");
        return io;
    } catch (error) {
        // logger.error("Error initializing Socket.IO:", error);
        throw error;
    }
};


/**
 * Obtiene la instancia de Socket.IO.
 * @returns {socketio.Server} - Instancia de Socket.IO.
 * @throws {Error} - Si Socket.IO no ha sido inicializado.
 */
 const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
 
 
export const getDriverSockets = () => driverSockets;
export const getUserSockets = () => userSockets;
export default { initSocket ,getIO , getDriverSockets, getUserSockets };
