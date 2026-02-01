# 📱 Guía para Visualizar en Dispositivos Móviles

## 🖥️ **Opción 1: DevTools del Navegador (RECOMENDADO)**

### **Google Chrome / Microsoft Edge:**

1. **Abrir la aplicación:**
   - Ve a: http://localhost:3003

2. **Abrir DevTools:**
   - Presiona `F12` o `Ctrl + Shift + I`
   - O click derecho → "Inspeccionar"

3. **Activar modo móvil:**
   - Click en el ícono de **dispositivo móvil** (📱) en la barra superior
   - O presiona `Ctrl + Shift + M`

4. **Seleccionar dispositivo:**
   - En el menú desplegable superior, selecciona:
     - **iPhone 14 Pro Max** (430 x 932)
     - **iPhone 12/13 Pro** (390 x 844)
     - **Samsung Galaxy S20 Ultra** (412 x 915)
     - **Pixel 5** (393 x 851)
     - **iPad Air** (820 x 1180) - Para tablet
   
5. **Opciones adicionales:**
   - Rotar dispositivo: Click en el ícono de rotación 🔄
   - Zoom: Ajustar el zoom en el menú superior
   - Throttling: Simular conexión 3G/4G lenta

### **Mozilla Firefox:**

1. Abrir http://localhost:3003
2. Presiona `F12`
3. Click en el ícono **Diseño Adaptable** (📱)
4. Selecciona el dispositivo del menú

### **Safari (macOS):**

1. Abrir http://localhost:3003
2. Menú → Desarrollador → Entrar en modo de diseño adaptable
3. Seleccionar dispositivo iOS

---

## 📱 **Opción 2: Ver en tu Celular Real**

### **Requisitos:**
- Tu PC y celular deben estar en la **misma red WiFi**
- El servidor debe estar corriendo (`npm run dev`)

### **Paso 1: Obtener tu IP local**

**En Windows (PowerShell):**
```powershell
ipconfig
```

Busca la línea que dice:
```
Adaptador de LAN inalámbrica Wi-Fi:
   Dirección IPv4. . . . . . . . . : 192.168.1.XXX
```

Anota esa IP (ejemplo: `192.168.1.100`)

**En macOS/Linux:**
```bash
ifconfig | grep "inet "
```

### **Paso 2: Reiniciar el servidor**

El servidor ya está configurado para aceptar conexiones de red.

**Verifica que el servidor muestre:**
```
➜  Local:   http://localhost:3003/
➜  Network: http://192.168.1.XXX:3003/
```

Si no aparece la dirección Network, reinicia el servidor:
```bash
# Detener el servidor actual (Ctrl + C)
# Iniciar de nuevo
npm run dev
```

### **Paso 3: Abrir en tu celular**

1. **En tu celular, abre el navegador** (Chrome, Safari, etc.)
2. **Escribe en la barra de direcciones:**
   ```
   http://192.168.1.XXX:3003
   ```
   (Reemplaza XXX con tu IP real)

3. **¡Listo!** Deberías ver la aplicación funcionando

---

## 🎨 **Opción 3: Responsive Design Mode (Dimensiones Personalizadas)**

### **Dimensiones Comunes:**

| Dispositivo | Ancho | Alto | Orientación |
|-------------|-------|------|-------------|
| iPhone SE | 375px | 667px | Portrait |
| iPhone 12/13 | 390px | 844px | Portrait |
| iPhone 14 Pro Max | 430px | 932px | Portrait |
| Samsung Galaxy S21 | 360px | 800px | Portrait |
| Google Pixel 5 | 393px | 851px | Portrait |
| iPad Mini | 768px | 1024px | Portrait |
| iPad Pro 11" | 834px | 1194px | Portrait |

### **Cómo usar dimensiones personalizadas:**

1. En DevTools modo móvil
2. Selecciona "Responsive" o "Edit..."
3. Ingresa ancho y alto manualmente
4. Prueba diferentes orientaciones

---

## 🔍 **Qué Revisar en Modo Móvil**

### **✅ Checklist de Validación:**

- [ ] **Navegación:**
  - ¿Los botones son fáciles de tocar? (mínimo 44x44px)
  - ¿El menú hamburguesa funciona?
  
- [ ] **Formularios:**
  - ¿Los campos de texto son accesibles?
  - ¿El teclado virtual no tapa los campos?
  - ¿Los botones de envío son visibles?

- [ ] **Mapa:**
  - ¿Se puede hacer zoom y pan?
  - ¿Los controles son accesibles?

- [ ] **Texto:**
  - ¿El texto es legible? (mínimo 16px)
  - ¿No hay texto cortado?

- [ ] **Imágenes:**
  - ¿Las imágenes se adaptan al ancho?
  - ¿No se pixelan?

- [ ] **Performance:**
  - ¿La app carga rápido?
  - ¿Las animaciones son fluidas?

- [ ] **Orientación:**
  - ¿Funciona en vertical (portrait)?
  - ¿Funciona en horizontal (landscape)?

---

## 🛠️ **Herramientas Adicionales**

### **1. Lighthouse (Auditoría Móvil)**

1. En Chrome DevTools (F12)
2. Tab "Lighthouse"
3. Seleccionar "Mobile"
4. Click "Generate report"
5. Revisar puntuación de Performance, Accessibility, SEO

### **2. Simulador de Throttling**

1. En DevTools → Network tab
2. Seleccionar "Slow 3G" o "Fast 3G"
3. Probar cómo se comporta con conexión lenta

### **3. Touch Simulation**

1. En DevTools móvil
2. Activar "Show rulers"
3. Activar "Show device frame"
4. Usar el mouse como si fuera un dedo

---

## 📊 **Breakpoints del Sistema**

Tu aplicación usa Tailwind CSS con estos breakpoints:

```css
/* Mobile First */
default: 0px - 639px    /* Móvil pequeño */
sm: 640px               /* Móvil grande */
md: 768px               /* Tablet */
lg: 1024px              /* Laptop */
xl: 1280px              /* Desktop */
2xl: 1536px             /* Desktop grande */
```

**Prueba en estos anchos clave:**
- 375px (iPhone SE)
- 390px (iPhone 12/13)
- 768px (iPad)
- 1024px (Desktop pequeño)

---

## 🚀 **Acceso Rápido**

### **URLs para Probar:**

**En PC:**
- Frontend: http://localhost:3003
- Backend Health: http://localhost:3004/api/health

**En Celular (misma red WiFi):**
- Frontend: http://TU_IP:3003
- Backend Health: http://TU_IP:3004/api/health

### **Comandos Útiles:**

```powershell
# Ver tu IP
ipconfig

# Reiniciar frontend
npm run dev

# Reiniciar backend
cd server
npm run dev
```

---

## ⚡ **Tips Pro**

1. **DevTools siempre abierto:** Presiona `F12` antes de cargar la página
2. **Cache limpio:** `Ctrl + Shift + R` para forzar recarga
3. **Múltiples dispositivos:** Abre varias ventanas de DevTools
4. **Screenshots:** Click derecho en DevTools → "Capture screenshot"
5. **Modo oscuro:** Prueba en ambos modos (claro/oscuro)

---

## 🎯 **Recomendación**

**Para desarrollo rápido:** Usa DevTools del navegador (Opción 1)
**Para testing real:** Usa tu celular en la misma WiFi (Opción 2)

---

¡Listo para probar! 🚀📱
