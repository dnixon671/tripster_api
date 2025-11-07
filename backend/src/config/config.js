import { config } from "dotenv";

config();

export const MONGODB_URI = process.env.MONGODB_URI;

export const JWT_SECRET = process.env.JWT_SECRET;

export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [];

export const PORT = process.env.PORT || 3000;
export const HOST = '0.0.0.0';

export const HTTP_STATUS_FORBIDDEN = 403;

export const NODE_ENV = process.env.NODE_ENV || 'production';

const HOUR_IN_MS = 60 * 60 * 1000;
export const TOKEN_HOURS = 12 * HOUR_IN_MS;
