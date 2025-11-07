// Helper: Validar coordenadas
export const isValidCoordinate = (longitude, latitude) =>{
    return Math.abs(longitude) <= 180 && 
           Math.abs(latitude) <= 90 &&
           !isNaN(longitude) && 
           !isNaN(latitude);
}


// Helper: Calcular tiempo estimado de llegada (en minutos)
export const calculateETA = (distanceInMeters) => {
    const AVERAGE_SPEED_KMH = 30;
    const speedMs = AVERAGE_SPEED_KMH / 3.6;
    return Math.round((distanceInMeters / speedMs) / 60);
}

// Helper: Retry para operaciones fallidas
export const retryOperation = async(operation, maxRetries) => {
    let attempts = 0;
    while (attempts <= maxRetries) {
        try {
            return await operation();
        } catch (error) {
            if (attempts === maxRetries) throw error;
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
    }
}