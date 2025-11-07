import mongoose from "mongoose";

export const LocationSchema = new mongoose.Schema({
    address: { type: String, default: "null" },
    location: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
    },
});