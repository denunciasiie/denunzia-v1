# 🔐 SIIEC Backend API

Backend API para el Sistema Integrado de Inteligencia Ética y Criminal (SIIEC).

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Configurar base de datos
npm run db:setup

# Iniciar servidor
npm run dev
```

## 📡 Endpoints API

### Health Check
```
GET /api/health
```
Verifica el estado del servidor y la base de datos.

### Reportes

#### Crear Reporte
```
POST /api/reports
Content-Type: application/json

{
  "id": "ABC123",
  "category": "Delito Común",
  "type": "Robo / Asalto",
  "encryptedData": "base64_encrypted_data",
  "encryptedKey": "base64_encrypted_key",
  "iv": "base64_iv",
  "location": {
    "lat": 19.4326,
    "lng": -99.1332
  },
  ...
}
```

#### Obtener Reportes
```
GET /api/reports?limit=100&offset=0&status=pending&category=Delito%20Común
```

#### Obtener Reporte Específico
```
GET /api/reports/:id
```

#### Actualizar Reporte
```
PATCH /api/reports/:id
Content-Type: application/json

{
  "status": "in_progress",
  "assignedTo": "admin_user",
  "trustScore": 0.85
}
```

## 🗄️ Esquema de Base de Datos

### Tabla: reports
- `id` (VARCHAR) - ID único del reporte
- `is_anonymous` (BOOLEAN) - Si es anónimo
- `role` (VARCHAR) - Rol del reportante
- `category` (VARCHAR) - Categoría del delito
- `type` (VARCHAR) - Tipo de delito
- `custom_crime_type` (VARCHAR) - Tipo personalizado
- `encrypted_data` (TEXT) - Datos cifrados
- `encrypted_key` (TEXT) - Clave AES cifrada
- `iv` (TEXT) - Vector de inicialización
- `latitude` (DECIMAL) - Latitud
- `longitude` (DECIMAL) - Longitud
- `timestamp` (TIMESTAMP) - Fecha del incidente
- `trust_score` (DECIMAL) - Puntuación de confianza
- `status` (VARCHAR) - Estado del reporte
- `created_at` (TIMESTAMP) - Fecha de creación
- `updated_at` (TIMESTAMP) - Última actualización

## 🔐 Seguridad

- **Cifrado E2EE**: RSA-4096 + AES-256-GCM
- **Rate Limiting**: 100 requests por 15 minutos
- **CORS**: Configurado para orígenes permitidos
- **Helmet**: Headers de seguridad HTTP
- **Validación**: Tamaño máximo de payload 2MB

## 🛠️ Scripts

```bash
npm start        # Iniciar servidor (producción)
npm run dev      # Iniciar con nodemon (desarrollo)
npm run db:setup # Configurar base de datos
```

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 📚 Documentación Completa

Ver `INSTALLATION_GUIDE.md` para instrucciones detalladas de instalación y configuración.

## 🐛 Troubleshooting

Ver sección de "Solución de Problemas" en `INSTALLATION_GUIDE.md`.

## 📄 Licencia

MIT
