import User from "../models/User";
import { Error } from "mongoose";

export const createUser = async (userData) => {
    try {
        const user = new User(userData);
        await user.save();
        return user;
    } catch (error) {
        // Manejo específico de errores de validación de Mongoose
        if (error instanceof Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => err.message);
            throw new Error(`Error de validación: ${errors.join(", ")}`);
        }
        // Manejo de errores generales (ej: duplicados)
        throw new Error("Error al crear el usuario: " + error.message);
    }
};

// cambiar de connet true : false
export const changeIsOnline = async (user, Id) => {  
    try {
        // cambiar estado de coneccion
        return await User.findByIdAndUpdate(Id, { isOnline: !user.isOnline }, { new: true });
    } catch (error) {
        // Manejo de errores específicos de Mongoose
        if (error instanceof Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => err.message);
            throw new Error(`Error de validación: ${errors.join(", ")}`);
        }
        // Manejo de errores generales (ej: duplicados)
        throw new Error("Error al cambiar el estado de conexión: " + error.message);        
    }   
    
}