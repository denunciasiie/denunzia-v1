# 🔐 Security Gateway - Pantalla 1

## Descripción

El **Security Gateway** es la primera pantalla que ven los usuarios al acceder a la aplicación de denuncias anónimas. Su propósito es:

1. **Advertir** sobre la naturaleza segura y anónima de la plataforma
2. **Ofrecer** opciones de acceso (estándar o TOR)
3. **Proteger** al usuario con un botón de pánico
4. **Garantizar** zero-tracking y máxima privacidad

## ✨ Características Implementadas

### 🚨 Botón de Pánico
- **Ubicación:** Esquina superior derecha (fijo)
- **Funcionalidad:** 
  - Click directo → Redirección inmediata a Google
  - Tecla ESC → Redirección inmediata a Google
- **Propósito:** Permitir salida rápida en situaciones de riesgo
- **Implementación:** `window.location.replace()` para no dejar rastro en historial

### 🔒 Zero-Tracking
- ✅ **Sin Google Fonts:** Usa fuentes del sistema
- ✅ **Sin CDNs externos:** Todo el código es local
- ✅ **Sin analíticas:** No hay scripts de tracking
- ✅ **Estilos inline:** No archivos CSS externos
- ✅ **No-cache headers:** Configurados vía meta tags dinámicos

### 🌐 Opción TOR
- **Modal informativo** con instrucciones paso a paso
- **Link seguro** a torproject.org con `rel="noopener noreferrer"`
- **Dirección .onion** en texto plano copiable
- **Botón de copiar** para facilitar el acceso

### 🎨 Diseño
- **Minimalista:** Sin elementos que saturen
- **Profesional:** Paleta de colores de la marca
- **Responsive:** Funciona en desktop y móvil
- **Accesible:** Contraste adecuado, labels ARIA

## 🛠️ Uso

### Integración en App.tsx

```typescript
import { SecurityGateway } from './components/SecurityGateway';

function App() {
  const [hasAcceptedSecurity, setHasAcceptedSecurity] = useState(false);

  if (!hasAcceptedSecurity) {
    return <SecurityGateway onProceed={() => setHasAcceptedSecurity(true)} />;
  }

  // Resto de la aplicación...
}
```

### Props

```typescript
interface SecurityGatewayProps {
  onProceed: () => void; // Callback cuando el usuario acepta continuar
}
```

## 🔧 Configuración

### Actualizar Dirección .onion

Edita el archivo `components/SecurityGateway.tsx`:

```typescript
// Línea 10
const onionAddress = "tu_direccion_real.onion"; // Reemplazar con dirección real
```

### Personalizar Mensajes

Los mensajes de advertencia se pueden personalizar en las líneas 70-80:

```typescript
<p style={styles.warningText}>
  ⚡ Esta plataforma protege tu identidad mediante cifrado de extremo a extremo.
</p>
```

## 🧪 Testing

### Pruebas Manuales

1. **Botón de Pánico (Click)**
   - Abrir aplicación
   - Click en "⚠️ SALIDA RÁPIDA"
   - Verificar redirección a Google
   - Verificar que no queda en historial

2. **Botón de Pánico (ESC)**
   - Abrir aplicación
   - Presionar tecla ESC
   - Verificar redirección a Google

3. **Modal TOR**
   - Click en "Necesito Anonimato Extremo"
   - Verificar que se abre el modal
   - Click en link de TOR → Debe abrir en nueva pestaña
   - Click en "Copiar" → Debe copiar dirección .onion
   - Click fuera del modal → Debe cerrar

4. **Botón Proceder**
   - Click en "Proceder con Seguridad Estándar"
   - Verificar que se muestra la aplicación principal

### Pruebas de Seguridad

```bash
# Verificar que no hay fuentes externas
grep -r "fonts.googleapis" components/SecurityGateway.tsx
# Debe retornar: (sin resultados)

# Verificar que no hay CDNs
grep -r "cdn\." components/SecurityGateway.tsx
# Debe retornar: (sin resultados)

# Verificar rel="noopener noreferrer"
grep "torproject.org" components/SecurityGateway.tsx
# Debe mostrar: rel="noopener noreferrer"
```

## 📱 Responsive Design

El componente es completamente responsive:

- **Desktop:** Layout horizontal, texto grande
- **Tablet:** Layout adaptativo
- **Mobile:** Layout vertical, botones full-width

## ♿ Accesibilidad

- ✅ Labels ARIA en botones
- ✅ Títulos descriptivos
- ✅ Contraste WCAG AA
- ✅ Navegación por teclado
- ✅ Escape key handler

## 🔐 Seguridad

### Headers HTTP (Configurar en servidor)

```
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Ver `SECURITY_CONFIG.md` para configuración completa.

### Consideraciones

1. **No almacenar estado:** El componente no guarda nada en localStorage/sessionStorage
2. **No cookies:** No se usan cookies de tracking
3. **No fingerprinting:** No se recopila información del dispositivo
4. **Redirección segura:** Usa `replace()` en lugar de `href` para no dejar rastro

## 🎨 Personalización de Estilos

Los estilos están inline para evitar dependencias externas. Para personalizar:

```typescript
// Cambiar color primario
const styles = {
  primaryButton: {
    background: 'linear-gradient(135deg, #TU_COLOR 0%, #TU_COLOR2 100%)',
    // ...
  }
}
```

### Paleta de Colores Actual

- **Primario:** `#d946ef` (Fuchsia)
- **Secundario:** `#8b5cf6` (Violet)
- **Acento:** `#3b82f6` (Blue)
- **Fondo:** `#0f172a` → `#1e293b` (Gradient)
- **Texto:** `#f8fafc` (Blanco suave)
- **Peligro:** `#dc2626` (Rojo)

## 📋 Checklist de Implementación

- [x] Componente SecurityGateway creado
- [x] Botón de pánico implementado
- [x] Listener ESC implementado
- [x] Modal TOR implementado
- [x] Zero-tracking verificado
- [x] Estilos inline
- [x] No-cache headers (meta tags)
- [x] Integrado en App.tsx
- [ ] Actualizar dirección .onion real
- [ ] Configurar headers HTTP en servidor
- [ ] Configurar TOR Hidden Service
- [ ] Pruebas de seguridad en producción

## 🆘 Soporte

Para problemas o preguntas sobre el Security Gateway:

1. Revisar `SECURITY_CONFIG.md`
2. Verificar configuración del servidor
3. Probar en modo incógnito
4. Verificar consola del navegador

---

**Versión:** 1.0  
**Última actualización:** 2026-01-28  
**Mantenedor:** Equipo SIIEC
