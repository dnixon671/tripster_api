import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato personalizado
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Logger principal
const logger = winston.createLogger({
  level: 'debug', // Nivel mínimo de logs
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Muestra stack traces
    logFormat
  ),
  transports: [
    // Consola (con colores)
    new winston.transports.Console({
      format: combine(colorize(), logFormat)
    }),
    // Archivo de logs (errores)
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Archivo de logs combinado
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
    
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});


// Agrega esto a los transports del logger
// Nivel	Uso recomendado
// error	Errores críticos
// warn	Advertencias
// info	Información general
// http	Requests HTTP
// debug	Depuración
// silly	Logs detallados


module.exports = logger;