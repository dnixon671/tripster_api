import { getUserSockets } from "./socketInstance.js";

export const setupClientHandlers = (io) => {
    const userSockets = getUserSockets();
    io.on('connection', (socket) => {
        socket.on('c:cliente_online', (userId) => {
            userSockets.set(userId.toString(), socket.id);
            console.log(`Client ${userId} connected`);
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`Client ${userId} disconnected`);
                    break;
                }
            }
        });
    });
}
