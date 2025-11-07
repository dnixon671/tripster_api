# 🚗 Sistema de Roles: Cliente y Chofer - Tripster API

## 📋 Resumen de Implementación

Se ha implementado exitosamente el sistema de roles para distinguir entre **clientes** (pasajeros) y **choferes** (conductores) en la aplicación Tripster.

---

## 🎯 Cambios Implementados

### 1. **Modelo de Usuario Actualizado** ✅
**Archivo:** `backend/src/models/User.js`

- **Roles actualizados:** `client`, `driver`, `admin`
- Los usuarios ahora deben seleccionar su rol al registrarse
- Campo `driverStatus` solo requerido para choferes

```javascript
role: { 
    type: String, 
    enum: ["client", "driver", "admin"], 
    required: true 
}
```

---

### 2. **Sistema de Registro Modificado** ✅
**Archivo:** `backend/src/controllers/auth.controller.js`

#### Endpoint: `POST /api/auth/register`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "password": "password123",
  "role": "client"  // o "driver"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "phone": "+1234567890",
    "role": "client",
    "online": true,
    "createdAt": "2025-11-07T..."
  },
  "token": "jwt_token_here"
}
```

**Validaciones:**
- ✅ Teléfono requerido (8-15 dígitos)
- ✅ Contraseña requerida
- ✅ Rol requerido (`client` o `driver`)
- ✅ Verificación de teléfono único

---

### 3. **Sistema de Login Actualizado** ✅
**Archivo:** `backend/src/controllers/auth.controller.js`

#### Endpoint: `POST /api/auth/login`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "phone": "+1234567890",
    "role": "client",  // Rol para determinar dashboard
    "online": true,
    "isActive": true,
    "createdAt": "2025-11-07T..."
  },
  "token": "jwt_token_here"  // Token para autenticación
}
```

---

### 4. **Dashboards Diferenciados** ✅
**Archivos:** 
- `backend/src/controllers/dashboard.controller.js`
- `backend/src/routes/dashboard.routes.js`

#### **Dashboard de Cliente**
**Endpoint:** `GET /api/dashboard/client`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "user": {
      "id": "user_id",
      "phone": "+1234567890",
      "username": "nombre_usuario",
      "role": "client",
      "rating": 5,
      "isOnline": true
    },
    "stats": {
      "totalTrips": 25,
      "activeTrips": 1,
      "completedTrips": 24
    },
    "recentTrips": [...]
  }
}
```

#### **Dashboard de Chofer**
**Endpoint:** `GET /api/dashboard/driver`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "driver": {
      "id": "driver_id",
      "phone": "+1234567890",
      "username": "nombre_chofer",
      "role": "driver",
      "rating": 4.8,
      "isOnline": true,
      "driverStatus": "available",
      "vehicle": {...},
      "location": {
        "type": "Point",
        "coordinates": [-74.0059, 40.7128]
      }
    },
    "stats": {
      "totalTrips": 150,
      "activeTrips": 2,
      "completedTrips": 148,
      "earnings": 3500.50
    },
    "recentTrips": [...]
  }
}
```

#### **Dashboard Automático**
**Endpoint:** `GET /api/dashboard`

Redirige automáticamente al dashboard correspondiente según el rol del usuario autenticado.

---

### 5. **Configuración CORS** ✅
**Archivo:** `backend/src/app.js`

Configurado para aceptar peticiones desde:
- ✅ `http://192.168.0.108:3000` (App móvil)
- ✅ `http://localhost:3000` (Desarrollo local)
- ✅ Cualquier origen (`*`)

```javascript
app.use(cors({
    origin: ['http://192.168.0.108:3000', 'http://localhost:3000', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
```

---

### 6. **Actualización de Rutas de Viajes** ✅
**Archivo:** `backend/src/routes/trip.routes.js`

Todas las rutas que eran `authorizeRole('user')` ahora son `authorizeRole('client')`:

- ✅ `GET /api/trips/drivers/nearby` - Buscar choferes cercanos (solo clientes)
- ✅ `POST /api/trips/request` - Solicitar viaje (solo clientes)
- ✅ `POST /api/trips/reassign` - Reasignar viaje (solo clientes)
- ✅ `POST /api/trips/respond` - Responder solicitud (solo choferes)

---

## 🌐 URLs de la API

### Servidor Local
- **Base:** `http://localhost:3000`
- **Documentación:** `http://localhost:3000/api-docs`
- **Info API:** `http://localhost:3000/api`

### Servidor en Red Local
- **Base:** `http://192.168.0.108:3000`
- **Documentación:** `http://192.168.0.108:3000/api-docs`
- **Info API:** `http://192.168.0.108:3000/api`

---

## 📱 Flujo de la Aplicación Móvil

### 1. **Primera Vez - Selección de Rol**
```
Usuario abre app por primera vez
    ↓
Pantalla: "¿Eres cliente o chofer?"
    ↓
Usuario selecciona → [Cliente] o [Chofer]
    ↓
Guardar rol seleccionado
```

### 2. **Registro**
```
POST /api/auth/register
{
  "phone": "+1234567890",
  "password": "password123",
  "role": "client"  // según selección
}
    ↓
Recibir token JWT
    ↓
Guardar token localmente
```

### 3. **Login**
```
POST /api/auth/login
{
  "phone": "+1234567890",
  "password": "password123"
}
    ↓
Recibir respuesta con user.role
    ↓
Si role === "client" → Dashboard de Cliente
Si role === "driver" → Dashboard de Chofer
```

### 4. **Obtener Dashboard**
```
GET /api/dashboard
Headers: { Authorization: "Bearer <token>" }
    ↓
Backend detecta rol automáticamente
    ↓
Devuelve dashboard correspondiente
```

---

## 🔑 Autenticación

### Métodos Soportados:
1. **Bearer Token** (Recomendado para app móvil)
   ```
   Headers: {
     "Authorization": "Bearer <token>"
   }
   ```

2. **Cookie** (Para web)
   ```
   Cookie: token=<jwt_token>
   ```

---

## 📊 Endpoints Principales

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/api/auth/register` | Registrar usuario | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/logout` | Cerrar sesión | Autenticado |
| GET | `/api/dashboard` | Dashboard automático | Autenticado |
| GET | `/api/dashboard/client` | Dashboard de cliente | Client |
| GET | `/api/dashboard/driver` | Dashboard de chofer | Driver |
| GET | `/api/trips/drivers/nearby` | Buscar choferes | Client |
| POST | `/api/trips/request` | Solicitar viaje | Client |
| POST | `/api/trips/respond` | Responder solicitud | Driver |
| POST | `/api/map/location` | Actualizar ubicación | Autenticado |

---

## 🛠️ Variables de Entorno

**Archivo:** `backend/.env`

```env
MONGODB_URI=mongodb+srv://yasseralvarezferrer:PqKVxqfGhq1aHfjT@cluster0.cvj6p.mongodb.net/tripster_db
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.0.108:3000
```

---

## 🧪 Pruebas con Swagger

1. Acceder a: `http://localhost:3000/api-docs`
2. Registrar un usuario (seleccionar rol)
3. Hacer login y copiar el token
4. Hacer clic en "Authorize" y pegar el token
5. Probar los endpoints de dashboard

---

## 📝 Notas Importantes

### Para el Frontend (App Móvil):

1. **Almacenar el token JWT** después del login
2. **Incluir el token en todas las peticiones** autenticadas
3. **Usar el campo `user.role`** para determinar qué pantallas mostrar
4. **Conectarse a**: `http://192.168.0.108:3000/api`

### Próximos Pasos Sugeridos:

- [ ] Implementar pantalla de selección de rol en la app
- [ ] Implementar pantallas de registro y login
- [ ] Crear dashboard de cliente con mapa
- [ ] Crear dashboard de chofer con solicitudes
- [ ] Implementar WebSocket para notificaciones en tiempo real
- [ ] Agregar validación de vehículo para choferes

---

## 🎨 Estructura de Dashboards

### Cliente:
- Ver viajes activos
- Buscar choferes cercanos
- Solicitar nuevo viaje
- Historial de viajes
- Calificación promedio

### Chofer:
- Ver solicitudes de viajes
- Aceptar/rechazar solicitudes
- Ver viajes en curso
- Ver ganancias totales
- Estado de disponibilidad
- Información del vehículo
- Ubicación actual

---

## 📞 Soporte

Para cualquier duda o problema:
- Revisar la documentación Swagger: `/api-docs`
- Verificar logs del servidor
- Verificar conexión a MongoDB

---

**Última actualización:** 7 de noviembre de 2025
**Versión:** 1.0.0
