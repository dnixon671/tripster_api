import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tripster API',
            version: '1.0.0',
            description: 'API para la aplicación de viajes Tripster - Sistema de gestión de viajes compartidos',
            contact: {
                name: 'Tripster Team',
                email: 'support@tripster.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Servidor de desarrollo',
            },
            {
                url: 'https://api.tripster.com/api',
                description: 'Servidor de producción',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID único del usuario'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del usuario'
                        },
                        phone: {
                            type: 'string',
                            description: 'Teléfono del usuario'
                        },
                        role: {
                            type: 'string',
                            enum: ['client', 'driver', 'admin'],
                            description: 'Rol del usuario'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Estado activo del usuario'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación'
                        }
                    }
                },
                Trip: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID único del viaje'
                        },
                        origin: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                coordinates: {
                                    type: 'array',
                                    items: { type: 'number' },
                                    minItems: 2,
                                    maxItems: 2
                                }
                            }
                        },
                        destination: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                coordinates: {
                                    type: 'array',
                                    items: { type: 'number' },
                                    minItems: 2,
                                    maxItems: 2
                                }
                            }
                        },
                        driver: {
                            type: 'string',
                            description: 'ID del conductor'
                        },
                        passengers: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array de IDs de pasajeros'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
                            description: 'Estado del viaje'
                        },
                        price: {
                            type: 'number',
                            description: 'Precio del viaje'
                        },
                        departureTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Hora de salida programada'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación'
                        }
                    }
                },
                Location: {
                    type: 'object',
                    properties: {
                        address: {
                            type: 'string',
                            description: 'Dirección legible'
                        },
                        coordinates: {
                            type: 'array',
                            items: { type: 'number' },
                            minItems: 2,
                            maxItems: 2,
                            description: 'Coordenadas [longitud, latitud]'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Mensaje de error'
                        },
                        status: {
                            type: 'integer',
                            description: 'Código de estado HTTP'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js',
        './src/models/*.js'
    ],
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };