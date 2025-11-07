// Tarifa de viaje
export const calculatePrice = (distance) => {
    const base = 5;
    const kmRate = 1.2;
    return base + (distance * kmRate);
  };