export const validateCoordinates = (req, res, next) => {
    // Verificar existencia de coordinates
    if (!req.body.coordinates) {
      return res.status(400).json({ error: 'Se requieren coordenadas' });
    }
    
    const [lng, lat] = req.body.coordinates;
    
    // Validar rangos
    if (
      isNaN(lat) || isNaN(lng) ||
      Math.abs(lat) > 90 || 
      Math.abs(lng) > 180
    ) {
      return res.status(400).json({ 
        error: 'Coordenadas inválidas',
        requirements: 'Latitud (-90 a 90), Longitud (-180 a 180)',
        received: { lat, lng }
      });
    }
    
    next();
  };