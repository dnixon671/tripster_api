import { getDriverSockets } from "./socketInstance";


export const setupDriverHandlers = (io) => {
  const driverSockets = getDriverSockets();

  io.on('connection', (socket) => {    
    socket.on('driver_online', (driverId) => {
      driverSockets.set(driverId.toString(), socket.id);
      console.log(`Driver ${driverId} connected`);
    });
    
    socket.on('disconnect', () => {
      for (const [driverId, socketId] of driverSockets.entries()) {
        if (socketId === socket.id) {
          driverSockets.delete(driverId);
          console.log(`Driver ${driverId} disconnected`);
          break;
        }
      }
    });
  });
};