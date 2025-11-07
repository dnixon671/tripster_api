import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    type: {
        type: String,
        default: "Point"
    },
    coordinates: [Number],  // [longitud, latitud]
    address: String
});

const TripSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },        
        pickup: LocationSchema,
        destination: LocationSchema,
        price: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'waiting_reassign'],
            default: 'pending'
        },
        // Nuevos campos para manejar rechazos
        rejectedDrivers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        reassignmentAttempts: { type: Number, default: 0, max: 3 },
        polyline: { type: String, default: "" },
        distance: {
            type: Number,
            default: 0,
            min: 0
        },
        duration: {
            type: Number,
            default: 0,
            min: 0
        },        
        cancellationDetails: {
            by: {
                type: String,
                enum: ['user', 'driver', 'system', 'timeout'],
                default: null
            },
            reason: String,
            timestamp: Date
        },
        // Campos existentes con ajustes
        rating: {
            type: Number,
            min: 1,
            max: 5,
            validate: {
                validator: function (value) {
                    return this.status === 'completed';
                },
                message: 'Rating can only be assigned to completed trips.'
            }
        }, 
        // Campos optimizados
        timeout: {
            type: Boolean,
            default: false
        },
        timeoutId: {
            type: Number,
            default: null
        },
        currentTimeoutId: {
            type: Number,
            default: null
        },
        
    },
    { timestamps: true }
);


// Índices optimizados
TripSchema.index({ user: 1 });
TripSchema.index({ driver: 1 });
TripSchema.index({ status: 1 });
TripSchema.index({ 'pickup.coordinates': '2dsphere' });
TripSchema.index({ 'destination.coordinates': '2dsphere' });
TripSchema.index({ rejectedDrivers: 1 });
TripSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("Trip", TripSchema);