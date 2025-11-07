import { getDriverSockets, getUserSockets } from "./socketInstance";

export const setupTripHandlers = (io) => {
    io.on('connection', (socket) => {
        socket.on('c:trip_response', (data) => {
            const { tripId, accepted } = data;  
            
            // si accepted es falso buscar driver que no hayan rechazado la solicitud 
        });
    });
};

// Notificar al usuario sobre el estado del viaje
export const notifyUser = (io, userId, message) => {
    const userSockets = getUserSockets(); // Asumiendo que tienes un mapa similar para usuarios
    const socketId = userSockets.get(userId.toString());
    
    if (socketId) {    
        // Si el mensaje tiene un timeoutId, significa que es una actualización de viaje
        clearTimeout(message.timeoutId); // Limpiar el timeout si existe
        io.to(socketId).emit('s:trip_update', message);  
    } else {
        console.warn(`Usuario ${userId} offline - Notificación no enviada`);
        // Aquí podrías implementar notificaciones push como fallback
    }
};

// Notificar al conductor sobre la solicitud de viaje
export const notifyDriver = (io, driverId, message) => {
    const driverSockets = getDriverSockets();
    const socketId = driverSockets.get(driverId.toString());
    
    if (socketId) {
        console.log('conductor notificado');
        io.to(socketId).emit('s:trip_request', message);        
    } else {
        console.warn(`Conductor ${driverId} offline - Notificación no enviada`);        
    }
};