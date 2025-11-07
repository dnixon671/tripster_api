import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "bank_transfer"],
            default: "cash"
        },
        platform: {
            type: String,
            enum: ["transfer", "enzona", null], // Especifica las plataformas de transferencia
            default: null,
            required: function () {
                return this.paymentMethod === "bank_transfer";
            },
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending"
        },
        transactionId: {
            type: String,
            unique: true,
            required: true
        },
        transactionDate: {
            type: Date,
            default: Date.now
        },
        // Campos adicionales para manejar la lógica de pagos
    },
    { timestamps: true }
);
// indice para mejorar busquedas

export default mongoose.model("Payment", PaymentSchema);