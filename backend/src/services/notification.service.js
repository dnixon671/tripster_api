import Notification from "../models/Notification.js";


export const createNotification = async ({
  userId,
  title,
  body,
  type = 'system',
  metadata = {}
}) => {
  try {
    // 1. Guardar en base de datos
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      metadata
    });

    //   // 2. Enviar via WebSocket
    //   const io = socketInstance.getIO();

    // if (userId) {
    //   io.to(userId).emit('new_notification', {
    //     _id: notification._id,
    //     title,
    //     body,
    //     type,
    //     createdAt: notification.createdAt,
    //     metadata
    //   });
    // }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

