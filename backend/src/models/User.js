import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, default: null },
        email: { type: String },
        password: { type: String, required: true },
        role: { type: String, enum: ["client", "driver", "admin"], required: true },
        phone: { type: String, required: true, unique: true },
        profilePhoto: { type: String, default: null }, // URL or base64 of profile photo
        driverStatus: {
            type: String,
            enum: ['busy', 'available', 'offline'],
            default: 'available',
            required: function () { return this.role === 'driver'; }
        },
        isActive: { type: Boolean, default: true },
        rating: { type: Number, default: 5, min: 1, max: 5 },
        isOnline: { type: Boolean, default: false }, // Cambiado de 'online' a 'isOnline'
        isRoot: { type: Boolean, default: false },
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
        },
        fcmToken: String,
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }, // Nuevo campo referencia
        lastActiveAt: { type: Date } // Para tracking de actividad
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, // Para incluir virtuals al convertir a JSON
        toObject: { virtuals: true }
    }
);

// Virtual para población dinámica
UserSchema.virtual('vehicleData', {
    ref: 'Vehicle',
    localField: 'vehicle',
    foreignField: '_id',
    justOne: true
});

// Prevenir modificar usuario Root
UserSchema.pre('save', function (next) {
    if (this.isModified('isRoot') && !this.isNew) {
        throw new Error('No se puede modificar el estado root de un usuario');
    }
    next();
});

// Índice geoespacial para búsquedas por ubicación
UserSchema.index({ location: "2dsphere" });

// Hash de contraseña antes de guardar
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// Paginación
UserSchema.plugin(mongoosePaginate);

export default mongoose.model("User", UserSchema);