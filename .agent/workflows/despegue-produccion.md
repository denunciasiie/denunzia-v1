---
description: Guía de despliegue a producción de SIIEC con Docker y Seguridad Hardened
---

# 🚀 Flujo de Despliegue SIIEC (Producción)

Este flujo asegura que el sistema se despliegue con todas las protecciones contra spam y reportes falsos habilitadas.

## 1. Preparación de Secretos (PASO CRÍTICO)
Antes de desplegar, debes preparar el archivo de ambiente en tu servidor de producción o en tu gestor de secretos (Render, VPS, etc.).

**Requisitos:**
- **DATABASE_URL:** Tu URL de Supabase (con el password real instalado).
- **GEMINI_API_KEY:** Clave de Google AI Studio para el filtro de spam.
- **PINATA_JWT:** Token de Admin de Pinata para evidencias.
- **PRIVATE_KEY_PEM:** Tu llave privada RSA-4096 (puedes generarla con `npm run generate-keys` en local y copiar el contenido del archivo `.pem`).
- **ENCRYPTION_SECRET:** Tu clave fija generada anteriormente.

## 2. Comandos de Despliegue (VPS con Docker)
Si usas un servidor propio (VPS), sigue estos pasos:

```powershell
# 1. Clonar o subir los cambios
git pull origin feature/fake-report-filtering

# 2. Crear el archivo .env a partir de la plantilla
cp server/.env.production.example server/.env
# Edita server/.env con tus credenciales reales

# 3. Construir y levantar
docker-compose up --build -d
```

## 3. Despliegue en Plataformas Cloud (Render / Vercel)
Si usas Render para el Backend:
1. En **Environment Variables**, añade todas las variables listadas en el paso 1.
2. Render detectará el `Dockerfile` en `/server` y expondrá el puerto 3001.

## 4. Verificación de Post-Despliegue
Accede a las siguientes rutas para confirmar que todo está blindado:
- **Salud del Sistema:** `https://tu-dominio.com/api/health` 
  - Respuesta esperada: `{"database": "connected", "decryption": "available"}`
- **Mapa:** Verifica que al mover el pin, la dirección aparezca (esto confirma que el proxy de geocodificación funciona).
- **Envío:** Realiza un reporte de prueba. Si el botón dice "PROCESANDO..." y te da un ID, el sistema PoW y el Cifrado están activos.

## 5. Mantenimiento
- **Logs:** Revisa los logs para ver intentos de ataque bloqueados: `docker logs siiec_backend`
- **Limpieza:** Si deseas resetear la base de datos de pruebas: `npm run cleanup` (¡Cuidado, esto borra todo!).
