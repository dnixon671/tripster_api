import express from 'express';
import morgan from 'morgan';
// Importart cookieParser
import cookieParser from 'cookie-parser';
//Importar cors
import cors from 'cors';
// Importar Swagger
import { specs, swaggerUi } from './config/swagger.js';
// importar rutas
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import tripRoutes from './routes/trip.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import profileRoutes from './routes/profile.routes.js';
import profilePictureRoutes from './routes/profilePicture.routes.js';
// Importar rutas

import locationRoutes from './routes/location.routes.js';

// Create Express server
const app = express();

// Configurar CORS para permitir peticiones desde la app móvil
app.use(cors({
    origin: ['http://192.168.0.108:3000', 'http://localhost:3000', '*'], // Permitir la IP específica, localhost y cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true // Permitir cookies
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Configurar Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Tripster API Documentation'
}));

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: '🚗 Bienvenido a la API de Tripster',
        version: '1.0.0',
        status: 'online',
        documentation: '/api-docs',
        api_info: '/api',
        timestamp: new Date().toISOString()
    });
});

// Ruta de información de la API
app.get('/api', (req, res) => {
    res.json({
        message: 'Bienvenido a la API de Tripster',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            auth: '/api/auth',
            admin: '/api/admin',
            dashboard: '/api/dashboard',
            map: '/api/map',
            trips: '/api/trips'
        }
    });
});

// Rutas del sistema
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/map', locationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', profilePictureRoutes); // Rutas de fotos de perfil
// Configurar CORS




export default app;
