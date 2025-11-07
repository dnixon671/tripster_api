import express from 'express';
import morgan from 'morgan';
// Importart cookieParser
import cookieParser from 'cookie-parser';
//Importar cors
import cors from 'cors';
// importar rutas
import authRoutes  from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import tripRoutes from './routes/trip.routes.js';
// Importar rutas

import locationRoutes from './routes/location.routes.js';

// Create Express server
const app = express();

app.use(cors({
    origin: '*', // Permitir todas las solicitudes de origen (ajustar según sea necesario)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Rutas del sistema
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', locationRoutes);
app.use('/api/trips', tripRoutes);
// Configurar CORS




export default app;
