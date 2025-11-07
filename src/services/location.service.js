import User from "../models/User.js";
import socketInstance from "../sockets/socketInstance.js";
// Cache para reducir carga en MongoDB
const locationCache = new Map();

export const updateUserLocation = async (userId, location) => {
    const { coordinates, type = 'Point' } = location;

    // Validación básica
    if (!coordinates || coordinates.length !== 2) {
        throw new Error('Coordenadas inválidas');
    }

    // Actualizar cache primero (para respuesta rápida)
    locationCache.set(userId, {
        coordinates,
        updatedAt: new Date()
    });

    // Actualización diferida en MongoDB (optimizado para escritura)
    setImmediate(async () => {
        try {
            await User.findByIdAndUpdate(userId, {
                location: {
                    type,
                    coordinates
                },
                lastLocationUpdate: new Date()
            }, { new: true });
        } catch (error) {
            console.error('Error persistiendo ubicación:', error);
        }
    });

    const io = socketInstance.getIO();
    // Emitir a WebSocket (tiempo real)
    io.emit('location_updated', { userId, coordinates });
    return { success: true };
}

export const getUserLocation = async (userId) => {
    try {
        const user = await User.findById(userId).select('location');
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user.location;
    } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        throw new Error('Error al obtener ubicación: ' + error.message);
    }
}

// Para obtener ubicaciones (usa cache si es reciente)
export const getLiveLocation = (userId) => {
    return locationCache.get(userId) || null;
};