# 📚 Documentación API con Swagger

## 🎯 Acceso a la documentación

La documentación completa de la API está disponible en:
- **Desarrollo**: http://localhost:3000/api-docs
- **Producción**: https://api.tripster.com/api-docs

## 🔧 Características implementadas

### ✅ Configuración básica
- Interfaz Swagger UI personalizada
- Esquemas de datos definidos (User, Trip, Location, Error)
- Configuración de seguridad (Bearer Token y Cookies)
- Múltiples servidores (desarrollo y producción)

### ✅ Endpoints documentados

#### 🔐 Autenticación (`/api/auth`)
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cerrar sesión

#### 🚗 Viajes (`/api/trips`)
- `GET /trips/drivers/nearby` - Buscar conductores cercanos
- `POST /trips/request` - Solicitar viaje
- `POST /trips/reassign` - Reasignar viaje
- `POST /trips/respond` - Responder a solicitud (conductores)

#### 📍 Ubicaciones (`/api/map`)
- `POST /map/location` - Actualizar ubicación
- `GET /map/drivers/{driverId}/location` - Obtener ubicación de conductor

## 🛡️ Autenticación en Swagger

Para probar endpoints protegidos:

1. **Hacer login** usando `/auth/login`
2. **Copiar el token** de la respuesta
3. **Autorizar** en Swagger:
   - Hacer clic en el botón "Authorize" 🔓
   - Pegar el token en el campo "bearerAuth"
   - Hacer clic en "Authorize"

## 📝 Esquemas de datos

### User
```json
{
  "_id": "string",
  "email": "user@example.com",
  "name": "Nombre Usuario",
  "phone": "+1234567890",
  "role": "user|driver|admin",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Trip
```json
{
  "_id": "string",
  "origin": {
    "address": "Calle de origen",
    "coordinates": [-74.0059, 40.7128]
  },
  "destination": {
    "address": "Calle de destino", 
    "coordinates": [-74.0060, 40.7129]
  },
  "driver": "driver_id",
  "passengers": ["passenger_id"],
  "status": "pending|accepted|in_progress|completed|cancelled",
  "price": 25.50,
  "departureTime": "2024-01-01T10:00:00.000Z"
}
```

### Location
```json
{
  "address": "123 Main Street, New York",
  "coordinates": [-74.0059, 40.7128]
}
```

## 🔧 Personalización

### Agregar nuevos endpoints

1. **Agregar comentarios JSDoc** en las rutas:
```javascript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Descripción del endpoint
 *     tags: [TagName]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

2. **Actualizar esquemas** en `src/config/swagger.js` si es necesario

### Personalizar la interfaz

Editar el archivo `src/config/swagger.js`:
- Cambiar información de la API
- Agregar nuevos esquemas
- Modificar configuración de seguridad
- Actualizar servidores

## 🚀 Próximas mejoras

- [ ] Documentar rutas de administración (`/api/admin`)
- [ ] Agregar ejemplos de respuesta más detallados  
- [ ] Implementar documentación de WebSockets
- [ ] Agregar validación de esquemas automática
- [ ] Exportar documentación en OpenAPI 3.0

## 📖 Recursos útiles

- [Swagger OpenAPI 3.0](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)