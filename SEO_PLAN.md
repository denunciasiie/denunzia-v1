# Plan de Implementación SEO para DENUNZIA

Para asegurar que DENUNZIA aparezca primero en los resultados de búsqueda, debemos transformar la aplicación de una simple "Single Page Application" (SPA) cerrada a una estructura amigable para los motores de búsqueda (Google, Bing, etc.).

## 1. Arquitectura Técnica (Router)
**Problema actual:** La app usa un "estado" (`view`) para cambiar de pantallas. Para Google, todo es una sola página (`/`) y no puede indexar "Reportar" o "Información" por separado.
**Solución:** Implementar `react-router-dom`.
- Transformar las vistas en rutas reales:
  - `/` -> Dashboard
  - `/denunciar` -> Formulario de reporte (ReportForm)
  - `/informacion` -> "About" (Información del sistema)
  - `/admin` -> Panel de control

## 2. Metadatos Dinámicos (Helmet)
**Problema actual:** El título y la descripción son estáticos en `index.html`.
**Solución:** Instalar `react-helmet-async`.
- **Home:** `<title>DenunZIA - Sistema de Inteligencia Ética</title>`
- **Denunciar:** `<title>Realizar Denuncia Anónima | DenunZIA</title>`
- **Descripción:** Cada página tendrá una `<meta name="description">` única optimizada con palabras clave como "denuncia anónima", "inteligencia criminal", "seguridad", etc.

## 3. Datos Estructurados (Schema.org)
Implementar JSON-LD para que Google entienda qué es la aplicación.
- Tipo: `SoftwareApplication` o `GovernmentService` (si aplica).
- Definir nombre, logo, y propósito de la aplicación en un formato legible por máquinas.

## 4. Archivos Técnicos
- **sitemap.xml**: Listar todas las rutas públicas (`/`, `/denunciar`, `/informacion`) para facilitar el rastreo.
- **robots.txt**: Indicar a los buscadores qué pueden y no pueden rastrear (ej. bloquear `/admin`).

## 5. Performance y Accesibilidad
- Agregar atributos `alt` descriptivos a todas las imágenes (logo).
- Asegurar que los encabezados (`h1`, `h2`, `h3`) sigan una jerarquía lógica.
- Mejorar el tiempo de carga (Lazy loading de componentes pesados).

---

### Pasos Inmediatos para Ejecutar:
1. Instalar dependencias: `npm install react-router-dom react-helmet-async`
2. Crear archivo `src/routes.tsx` o modificar `App.tsx` para configurar el Router.
3. Crear componentes envoltorios para SEO (`SeoHead.tsx`).
4. Generar `public/sitemap.xml` y `public/robots.txt`.
