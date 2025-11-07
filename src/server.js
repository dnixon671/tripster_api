import app from "./app.js";
// instancia WebSocket
import { initSocket, setIO } from "./sockets/socketInstance.js";
// Importar conecion base de datos
import { connectDB } from "./config/db.js";

import http from "http";
import { PORT, HOST } from "./config/config.js";
import { setupDriverHandlers } from "./sockets/driver.handlers.js";
import { setupTripHandlers } from "./sockets/trip.handlers.js";
import { setupClientHandlers } from "./sockets/cliente.handlers.js";

// levantar servidor base de datos
connectDB()

// Crear servidor HTTP a partir de la aplicación Express
const server = http.createServer(app);

// Inicializar Socket.IO 
const io = initSocket(server);

// Configurar la instancia de Socket.IO en el módulo de sockets
// Configurar manejadores
setupClientHandlers(io);
setupDriverHandlers(io);
setupTripHandlers(io); 

// iniciar servidor en el puerto especificado
server.listen(8080, HOST, () => {

    console.log('=== BACKEND NODE KS + MONGODB ===');
    console.log(` Acceso local: http://localhost:${PORT}`);
    console.log(` Acceso desde la red: http://[TU-IP]:${PORT}`);
    console.log(` Puerto:${PORT}`);
    console.log(` Servidor listo para pruebas externas}`);
}).on('error', (error) => {
    console.error("Error al iniciar el servidor", error);
});

// Exportar io para usarlo en otros módulos
export { io };