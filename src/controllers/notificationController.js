export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Error al obtener notificaciones" 
        });
    }
};