import { getLiveLocation, updateUserLocation } from "../services/location.service";

export const updateLocation = async (req, res) => {
    const { coordinates } = req.body;
    const userId = req.user.id; // ID del usuario autenticado
    
    try {
        const result = await updateUserLocation(userId, { coordinates });
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const getDriverLocation = async (req, res) => {
    const { driverId } = req.params;
    const location = getLiveLocation(driverId);

    res.json({
        success: true,
        location,
        isRealTime: !!location
    });
};