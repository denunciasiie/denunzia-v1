# 🛡️ DENUNZIA_SIIEC - Sistema Integrado de Inteligencia Ética y Criminal

<div align="center">

**Plataforma de Denuncia Anónima Segura con Análisis de Inteligencia Artificial**

[![Status](https://img.shields.io/badge/status-operational-success)](http://localhost:3000)
[![Version](https://img.shields.io/badge/version-0.0.0-blue)](package.json)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff)](https://vitejs.dev/)

</div>

---

## 📋 Descripción

DENUNZIA_SIIEC es una plataforma web diseñada para la recolección segura y anónima de denuncias ciudadanas, con análisis automatizado mediante inteligencia artificial y visualización geoespacial de datos.

### ✨ Características Principales

- 🔒 **Denuncia Anónima Segura** - Protección de identidad con encriptación E2EE
- 🗺️ **Mapa de Inteligencia** - Visualización K-Anonimato espacial (k=5)
- 🤖 **Análisis con IA** - Validación automática con Google Gemini AI
- 📊 **Dashboard Interactivo** - Estadísticas y gráficos en tiempo real
- 🛡️ **Sistema Anti-Spam** - CAPTCHA y validación cruzada algorítmica
- 👮 **Panel de Administración** - Gestión y revisión de denuncias

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar API Key de Gemini (opcional)
# Editar .env.local y agregar tu API key
GEMINI_API_KEY=tu_api_key_aqui

# 3. Iniciar servidor de desarrollo
npm run dev
```

### Acceso

- **Aplicación:** http://localhost:3000/
- **Panel Admin:** Clic en icono de candado → Password: `admin`

---

## 📚 Documentación

- 📖 **[Guía Rápida](QUICK_START.md)** - Instrucciones paso a paso
- 🧪 **[Reporte de Pruebas](TESTING_REPORT.md)** - Documentación técnica completa

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 19 + TypeScript
- Vite 6 (Build Tool)
- Tailwind CSS (Estilos)

**Visualización:**
- Leaflet + React-Leaflet (Mapas)
- Recharts (Gráficos)
- Lucide React (Iconos)

**IA & Servicios:**
- Google Gemini AI (Análisis)
- LocalStorage (Persistencia)
- Web Crypto API (Encriptación)

### Estructura del Proyecto

```
siiec/
├── components/          # Componentes React
│   ├── AdminPanel.tsx   # Panel de administración
│   ├── Dashboard.tsx    # Mapa y estadísticas
│   ├── LeafletMap.tsx   # Componente de mapa
│   ├── ReportForm.tsx   # Formulario de denuncia
│   └── SecurityBanner.tsx
├── services/            # Servicios
│   ├── cryptoService.ts # Encriptación
│   ├── geminiService.ts # IA Gemini
│   └── storageService.ts# Almacenamiento
├── App.tsx             # Componente principal
├── types.ts            # Tipos TypeScript
└── vite.config.ts      # Configuración Vite
```

---

## 🎯 Funcionalidades

### 1. Sistema de Denuncias

- **Roles:** Víctima, Testigo, Anónimo
- **Categorías:** Delito Común, Corrupción, Alto Impacto
- **Ubicación:** Selección interactiva en mapa
- **Seguridad:** CAPTCHA y encriptación

### 2. Análisis con IA

- Evaluación de verosimilitud (Trust Score)
- Detección de spam
- Extracción de entidades
- Resúmenes automáticos

### 3. Visualización

- Mapa de calor geoespacial
- K-Anonimato para protección de víctimas
- Gráficos estadísticos
- Filtros de confianza

### 4. Administración

- Vista de todas las denuncias
- Detalles completos de reportes
- Gestión de puntuación de confianza
- Análisis de IA visible

---

## 🔐 Seguridad

### Medidas Implementadas

- ✅ Encriptación de extremo a extremo (E2EE)
- ✅ K-Anonimato espacial (k=5)
- ✅ CAPTCHA anti-spam
- ✅ Validación cruzada algorítmica
- ✅ Protección de identidad
- ✅ Almacenamiento local seguro

### Arquitectura de Privacidad

El sistema implementa técnicas inspiradas en Tor y sistemas de denuncia anónima:

- **Anonimización:** No se recopila información identificable
- **K-Anonimato:** Agrupación espacial para proteger ubicaciones exactas
- **Cifrado:** Datos sensibles encriptados en reposo y tránsito

---

## 🧪 Testing

### Estado Actual

✅ **Todos los componentes funcionando correctamente**

- Servidor de desarrollo: Operativo
- Navegación: Funcional
- Formulario de denuncia: Completo
- Mapa interactivo: Operativo
- Panel de admin: Funcional
- Integración IA: Lista (requiere API Key)

### Pruebas Manuales

Ver [TESTING_REPORT.md](TESTING_REPORT.md) para guía detallada de pruebas.

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm run preview      # Vista previa de build de producción
```

---

## 🔑 Configuración de API Key

Para habilitar el análisis completo con Gemini AI:

1. Obtén una API Key en: https://aistudio.google.com/apikey
2. Edita `.env.local`:
   ```env
   GEMINI_API_KEY=tu_api_key_real
   ```
3. Reinicia el servidor

**Nota:** Sin API Key, el sistema usa análisis simulado.

---

## 🌐 Acceso en Red Local

El servidor está disponible en:

- **Local:** http://localhost:3000/
- **Red Local:** http://192.168.1.9:3000/
- **Red Local 2:** http://100.127.232.48:3000/

Accede desde cualquier dispositivo en tu red local.

---

## 📊 Datos de Ejemplo

El sistema incluye datos de muestra para demostración:

**Ubicaciones:**
- CDMX, Guadalajara, Monterrey, Puebla, Cancún

**Estadísticas:**
- Corrupción: 120 reportes
- Alto Impacto: 85 reportes
- Común: 230 reportes

---

## 🛠️ Solución de Problemas

### Error: "vite is not recognized"
```bash
npm install
```

### Puerto ocupado
Edita `vite.config.ts` y cambia el puerto:
```typescript
server: { port: 3001 }
```

### Denuncias no se guardan
- Verifica que localStorage esté habilitado
- Revisa la consola del navegador (F12)

---

## 🚧 Roadmap

### Implementado ✅
- [x] Sistema de denuncias anónimas
- [x] Mapa interactivo con Leaflet
- [x] Integración con Gemini AI
- [x] Panel de administración
- [x] Sistema de validación
- [x] CAPTCHA de seguridad

### Próximos Pasos 🔄
- [ ] Backend con base de datos real
- [ ] Autenticación robusta
- [ ] API REST
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Dashboard analítico avanzado

---

## 👥 Contribuir

Este es un proyecto de demostración. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 🙏 Agradecimientos

- **Google Gemini AI** - Análisis inteligente
- **Leaflet** - Mapas interactivos
- **React** - Framework UI
- **Vite** - Build tool ultrarrápido

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la [Guía Rápida](QUICK_START.md)
2. Consulta el [Reporte de Pruebas](TESTING_REPORT.md)
3. Abre un issue en el repositorio

---

<div align="center">

**Desarrollado con ❤️ para la seguridad ciudadana**

[![Status](https://img.shields.io/badge/status-operational-success)](http://localhost:3000)

**[Ver Aplicación](http://localhost:3000)** | **[Documentación](TESTING_REPORT.md)** | **[Guía Rápida](QUICK_START.md)**

</div>
