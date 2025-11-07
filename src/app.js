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
            map: '/api/map',
            trips: '/api/trips'
        }
    });
});

// Rutas del sistema
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', locationRoutes);
app.use('/api/trips', tripRoutes);
// Configurar CORS




export default app;
