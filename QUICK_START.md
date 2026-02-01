# 🚀 Guía Rápida de Inicio - SIIEC

## ✅ Estado Actual
**El proyecto está completamente funcional y listo para usar.**

---

## 📦 Instalación (Ya Completada)

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

---

## 🎯 Iniciar el Servidor

El servidor ya está corriendo en: **http://localhost:3000/**

Si necesitas reiniciarlo:

```bash
npm run dev
```

---

## 🔐 Acceso al Sistema

### Panel Principal
- **URL:** http://localhost:3000/
- **Acceso:** Público (no requiere autenticación)

### Panel de Administración
- **Botón:** Icono de candado (🔒) en la barra de navegación
- **Password:** `admin` o `admin123`

---

## 🧭 Navegación

### 1. **Mapa** (Vista Principal)
- Visualización de denuncias en mapa de calor
- Gráficos estadísticos
- Control de nivel de confianza

### 2. **Denuncia** (Botón Rojo)
- Formulario para crear nueva denuncia
- Selección de ubicación en mapa
- CAPTCHA de seguridad
- Análisis automático con IA

### 3. **Admin** (Icono de Candado)
- Visualización de todas las denuncias
- Detalles completos de cada reporte
- Gestión de puntuación de confianza

---

## 📝 Crear una Denuncia de Prueba

1. Haz clic en el botón **"Denuncia"** (rojo)
2. Selecciona tu rol: **Testigo**, **Víctima**, o **Anónimo**
3. Elige una categoría: **Delito Común**, **Corrupción**, o **Alto Impacto**
4. Selecciona el tipo específico de delito
5. Haz clic en el mapa para marcar la ubicación
6. Completa los detalles de ubicación (colonia, código postal, etc.)
7. Escribe la narrativa de la denuncia
8. Resuelve el CAPTCHA
9. Haz clic en **"Enviar Denuncia Encriptada"**

---

## 👀 Ver las Denuncias

1. Haz clic en el icono de **candado** (🔒)
2. Ingresa el password: `admin`
3. Verás la lista de denuncias en el panel izquierdo
4. Haz clic en cualquier denuncia para ver sus detalles completos

---

## 🔑 Configurar Gemini AI (Opcional)

Para habilitar el análisis real con IA:

1. Obtén una API Key en: https://aistudio.google.com/apikey
2. Edita el archivo `.env.local`:
   ```
   GEMINI_API_KEY=tu_api_key_real_aqui
   ```
3. Reinicia el servidor:
   ```bash
   # Presiona Ctrl+C para detener el servidor
   npm run dev
   ```

**Nota:** Sin API Key válida, el sistema usa análisis simulado.

---

## 🎨 Características Principales

✅ **Denuncia Anónima Segura**
- Protección de identidad
- Encriptación de datos
- CAPTCHA anti-spam

✅ **Mapa de Inteligencia**
- Visualización K-Anonimato
- Mapa de calor interactivo
- Estadísticas en tiempo real

✅ **Análisis con IA**
- Detección de spam
- Evaluación de verosimilitud
- Extracción de entidades
- Resúmenes automáticos

✅ **Panel de Administración**
- Gestión de denuncias
- Sistema de confianza
- Vista detallada de reportes

---

## 🛠️ Solución de Problemas

### El servidor no inicia
```bash
# Reinstalar dependencias
npm install

# Iniciar servidor
npm run dev
```

### Error de puerto ocupado
El servidor usa el puerto 3000. Si está ocupado, edita `vite.config.ts`:
```typescript
server: {
  port: 3001, // Cambiar a otro puerto
  host: '0.0.0.0',
}
```

### Las denuncias no se guardan
- Verifica que localStorage esté habilitado en tu navegador
- Abre la consola del navegador (F12) para ver errores

---

## 📱 Acceso desde Otros Dispositivos

El servidor está disponible en tu red local:

- **Local:** http://localhost:3000/
- **Red Local:** http://192.168.1.9:3000/
- **Red Local 2:** http://100.127.232.48:3000/

Puedes acceder desde tu teléfono o tablet usando las IPs de red local.

---

## 🎓 Datos de Prueba

El sistema incluye datos de ejemplo:

**Ubicaciones de Muestra:**
- Ciudad de México (19.4326, -99.1332)
- Guadalajara (20.6597, -103.3496)
- Monterrey (25.6866, -100.3161)
- Puebla (19.0414, -98.2063)
- Cancún (21.1619, -86.8515)

**Categorías Disponibles:**
- Delito Común
- Corrupción / Cuello Blanco
- Alto Impacto

---

## 📊 Tecnologías Utilizadas

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Mapas:** Leaflet + React-Leaflet
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **IA:** Google Gemini AI
- **Estilos:** Tailwind CSS

---

## 🔒 Seguridad

- ✅ Encriptación de datos
- ✅ K-Anonimato espacial
- ✅ CAPTCHA anti-spam
- ✅ Protección de identidad
- ✅ Almacenamiento local seguro

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador (F12)
2. Revisa la terminal donde corre el servidor
3. Consulta el archivo `TESTING_REPORT.md` para más detalles

---

## ✨ ¡Listo para Usar!

El sistema está completamente funcional. Puedes:

1. ✅ Crear denuncias
2. ✅ Ver el mapa de calor
3. ✅ Acceder al panel de admin
4. ✅ Revisar estadísticas
5. ✅ Gestionar reportes

**¡Disfruta usando SIIEC!** 🎉

---

**Última actualización:** 27 de enero de 2026  
**Versión:** 0.0.0  
**Estado:** 🟢 Operativo
