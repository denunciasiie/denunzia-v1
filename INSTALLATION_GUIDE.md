# 🚀 Guía de Instalación y Configuración - PostgreSQL Backend

## 📋 Requisitos Previos

### Software Necesario:
- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** o **yarn**
- **Git**

---

## 🔧 Paso 1: Instalar PostgreSQL

### Windows:
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql

# Iniciar servicio
net start postgresql-x64-14
```

### macOS:
```bash
# Usar Homebrew:
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 🗄️ Paso 2: Configurar Base de Datos

### 1. Acceder a PostgreSQL:
```bash
# Windows/Linux
psql -U postgres

# macOS
psql postgres
```

### 2. Crear Base de Datos y Usuario:
```sql
-- Crear base de datos
CREATE DATABASE siiec_db;

-- Crear usuario
CREATE USER siiec_user WITH ENCRYPTED PASSWORD 'tu_contraseña_segura';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE siiec_db TO siiec_user;

-- Conectar a la base de datos
\c siiec_db

-- Otorgar permisos en el schema
GRANT ALL ON SCHEMA public TO siiec_user;

-- Salir
\q
```

### 3. Verificar Conexión:
```bash
psql -U siiec_user -d siiec_db -h localhost
```

---

## 📦 Paso 3: Instalar Dependencias del Backend

```bash
# Navegar a la carpeta del servidor
cd server

# Instalar dependencias
npm install

# O con yarn
yarn install
```

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 1. Copiar archivo de ejemplo:
```bash
cp .env.example .env
```

### 2. Editar `.env` con tus credenciales:
```env
# Database Configuration
DATABASE_URL=postgresql://siiec_user:tu_contraseña_segura@localhost:5432/siiec_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=siiec_db
DB_USER=siiec_user
DB_PASSWORD=tu_contraseña_segura

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=genera_un_secret_aleatorio_de_minimo_32_caracteres_aqui
ADMIN_PASSWORD_HASH=$2b$10$placeholder_hash_here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info
```

### 3. Generar JWT Secret:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# O en línea de comandos
openssl rand -hex 32
```

---

## 🔐 Paso 5: Generar Claves RSA (Para Cifrado)

```bash
# Crear carpeta para claves
mkdir -p server/keys

# Generar clave privada RSA-4096
openssl genrsa -out server/keys/private_key.pem 4096

# Extraer clave pública
openssl rsa -in server/keys/private_key.pem -pubout -out server/keys/public_key.pem

# Proteger clave privada (solo lectura)
chmod 400 server/keys/private_key.pem

# Ver clave pública (copiar para el cliente)
cat server/keys/public_key.pem
```

### Actualizar Clave Pública en el Cliente:

Editar `services/encryptionService.ts`:
```typescript
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
[PEGAR AQUÍ EL CONTENIDO DE public_key.pem]
-----END PUBLIC KEY-----`;
```

---

## 🏗️ Paso 6: Configurar Base de Datos (Crear Tablas)

```bash
# Ejecutar script de setup
cd server
npm run db:setup
```

Esto creará automáticamente:
- ✅ Tabla `reports`
- ✅ Tabla `admin_users`
- ✅ Tabla `audit_logs`
- ✅ Tabla `evidence_files`
- ✅ Índices para performance
- ✅ Triggers para timestamps

---

## 🚀 Paso 7: Iniciar el Servidor Backend

### Modo Desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo Producción:
```bash
npm start
```

Deberías ver:
```
═══════════════════════════════════════════════════════
🚀 SIIEC Backend Server running on port 3001
📊 Environment: development
🔗 API: http://localhost:3001/api
💚 Health: http://localhost:3001/api/health
═══════════════════════════════════════════════════════
```

---

## 🧪 Paso 8: Verificar Instalación

### 1. Health Check:
```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T...",
  "database": "connected",
  "decryption": "available",
  "uptime": 12.345
}
```

### 2. Probar Endpoint de Reportes:
```bash
curl http://localhost:3001/api/reports
```

---

## 🎯 Paso 9: Configurar el Cliente (Frontend)

### 1. Crear archivo `.env.local` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3001
```

### 2. Reiniciar el servidor de desarrollo:
```bash
npm run dev
```

---

## 📊 Estructura de Archivos del Backend

```
server/
├── package.json              # Dependencias
├── .env                      # Variables de entorno (NO COMMITEAR)
├── .env.example              # Ejemplo de configuración
├── server.js                 # Servidor principal
├── config/
│   └── database.js           # Configuración de PostgreSQL
├── services/
│   └── decryptionService.js  # Servicio de descifrado
├── scripts/
│   └── setup-database.js     # Script de creación de tablas
└── keys/
    ├── private_key.pem       # Clave privada RSA (NO COMMITEAR)
    └── public_key.pem        # Clave pública RSA
```

---

## 🔍 Comandos Útiles de PostgreSQL

### Ver todas las bases de datos:
```sql
\l
```

### Conectar a una base de datos:
```sql
\c siiec_db
```

### Ver todas las tablas:
```sql
\dt
```

### Ver estructura de una tabla:
```sql
\d reports
```

### Ver datos de una tabla:
```sql
SELECT * FROM reports LIMIT 10;
```

### Contar registros:
```sql
SELECT COUNT(*) FROM reports;
```

### Ver últimos reportes:
```sql
SELECT id, category, type, timestamp, status 
FROM reports 
ORDER BY timestamp DESC 
LIMIT 5;
```

---

## 🐛 Solución de Problemas

### Error: "Connection refused"
```bash
# Verificar que PostgreSQL esté corriendo
# Windows:
net start postgresql-x64-14

# Linux/macOS:
sudo systemctl status postgresql
```

### Error: "password authentication failed"
```bash
# Verificar credenciales en .env
# Resetear contraseña:
psql -U postgres
ALTER USER siiec_user WITH PASSWORD 'nueva_contraseña';
```

### Error: "relation does not exist"
```bash
# Ejecutar setup de base de datos
npm run db:setup
```

### Error: "Port 3001 already in use"
```bash
# Cambiar puerto en .env
PORT=3002

# O matar el proceso:
# Windows:
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Linux/macOS:
lsof -ti:3001 | xargs kill -9
```

---

## 🔒 Seguridad en Producción

### 1. Usar HTTPS:
```javascript
// Configurar SSL en server.js
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### 2. Configurar Firewall:
```bash
# Solo permitir conexiones desde IPs específicas
sudo ufw allow from 192.168.1.0/24 to any port 5432
```

### 3. Usar Variables de Entorno Seguras:
- Nunca commitear `.env`
- Usar servicios como AWS Secrets Manager
- Rotar credenciales regularmente

### 4. Backups Automáticos:
```bash
# Crear script de backup
pg_dump -U siiec_user siiec_db > backup_$(date +%Y%m%d).sql

# Programar con cron (diario a las 2 AM)
0 2 * * * /path/to/backup_script.sh
```

---

## 📚 Recursos Adicionales

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Security](https://owasp.org/www-project-top-ten/)

---

## ✅ Checklist de Instalación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `siiec_db` creada
- [ ] Usuario `siiec_user` creado con permisos
- [ ] Dependencias del backend instaladas (`npm install`)
- [ ] Archivo `.env` configurado con credenciales
- [ ] Claves RSA generadas (private_key.pem y public_key.pem)
- [ ] Clave pública actualizada en `encryptionService.ts`
- [ ] Tablas creadas (`npm run db:setup`)
- [ ] Servidor backend corriendo (`npm run dev`)
- [ ] Health check exitoso (http://localhost:3001/api/health)
- [ ] Variable `VITE_API_URL` configurada en cliente
- [ ] Cliente conectado al backend

---

**¡Listo!** Tu sistema ahora usa PostgreSQL como base de datos en lugar de localStorage. 🎉
