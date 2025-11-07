import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
    {
        rand: { 
            type: String, 
            required: [true, "Rand is required"] 
        },
        model: { 
            type: String, 
            required: [true, "Model is required"] 
        },
        license: { 
            type: String, 
            required: [true, "License plate is required"], 
            // unique: [true, "License plate must be unique"] 
        },
        passengerCapacity: { 
            type: Number, 
            required: [true, "Passenger capacity is required"], 
            min: [1, "Passenger capacity must be at least 1"]
        },
        luggageCapacity: { 
            type: Number, 
            required: [true, "Luggage capacity is required"], 
            min: [0, "Luggage capacity must be at least 0"] 
        },
        type: {
            type: String,
            enum: {
                values: ["motorbike", "tricycle", "bicycle", "light_car", "truck"],
                message: "Invalid car type"
            },
            required: [true, "Car type is required"]
        },
        insurancePhotos: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },  
    },
    {
        timestamps: true
    }
);

// Índices para mejorar el rendimiento
// VehicleSchema.index({ license: 1 }, { unique: true });
VehicleSchema.index({ driver: 1 });

// Método para obtener información resumida del carro
VehicleSchema.methods.getSummary = function () {
    return {
        rand: this.brand,
        model: this.model,
        license: this.license,
        type: this.type,
    };
};

export default mongoose.model("Vehicle", VehicleSchema);
