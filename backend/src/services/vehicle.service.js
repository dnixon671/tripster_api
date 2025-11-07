import { Error } from "mongoose";

import Vehicle from "../models/Vehicle.js";

export const createVehicle = async (vehicleData) => {
    try {
        const vehicle = new Vehicle(vehicleData);
        await vehicle.save();
        return vehicle;
    } catch (error) {
        // Manejo específico de errores de validación de Mongoose
        console.log(error);
        if (error instanceof Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => err.message);
            throw new Error(`Error de validación: ${errors.join(", ")}`);
        }
        // Manejo de errores generales (ej: duplicados)
        throw new Error("Error al crear el usuario: " + error.message);
    }
};

// validar licence plate
export const validateVehicles = async (license) => {
    return await Vehicle.findOne({ license });
};

// Obtener vehículo por ID
export const getVehicleByDriverId = async (driverId) => {
    try {
        const vehicle = await Vehicle.findOne({ driver: driverId });
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        return vehicle;
    } catch (error) {        
        console.error("Error fetching vehicle by driver ID:", error);
        throw new Error("Error fetching vehicle: " + error.message);
    }
}