import mongoose from "mongoose";

import { MONGODB_URI } from "./config.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`${conn.connection.host}:DB is Connected`);

        console.log('Mongoose version:', mongoose.version);
        console.log('Connection state:', mongoose.connection.readyState);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};