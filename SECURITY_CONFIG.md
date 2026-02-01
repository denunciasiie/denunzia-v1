# Configuración de Seguridad para Producción

## 🔒 Security Gateway - Requisitos de Implementación

### 1. Cabeceras HTTP del Servidor

Para garantizar que la pantalla de Security Gateway no se almacene en caché ni en el historial del navegador, configura las siguientes cabeceras en tu servidor web:

#### Nginx
```nginx
location / {
    # No-cache headers
    add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Content Security Policy (ajustar según necesidades)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;
}
```

#### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
    # No-cache headers
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires "0"
    
    # Security headers
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "no-referrer"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # Content Security Policy
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
</IfModule>
```

### 2. Configuración de Servicio TOR Hidden Service

Para configurar el acceso .onion, sigue estos pasos:

#### Instalación de TOR
```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install tor

# CentOS/RHEL
sudo yum install tor
```

#### Configuración del Hidden Service
Edita `/etc/tor/torrc`:

```
HiddenServiceDir /var/lib/tor/siiec_hidden_service/
HiddenServicePort 80 127.0.0.1:3000
```

Reinicia TOR:
```bash
sudo systemctl restart tor
```

Obtén tu dirección .onion:
```bash
sudo cat /var/lib/tor/siiec_hidden_service/hostname
```

**Actualiza la dirección .onion en el componente:**
- Archivo: `components/SecurityGateway.tsx`
- Línea 10: Reemplaza `"siiecxxxxxxxxxxxxxxxx.onion"` con tu dirección real

### 3. Zero-Tracking Checklist

✅ **Implementado:**
- ✓ Sin Google Fonts (usa fuentes del sistema)
- ✓ Sin scripts de analíticas externos
- ✓ Sin CDNs externos en SecurityGateway
- ✓ Estilos inline (no archivos CSS externos)
- ✓ Botón de pánico con redirección a Google
- ✓ Listener de tecla ESC
- ✓ Meta tags no-cache dinámicos
- ✓ Links TOR con `rel="noopener noreferrer"`
- ✓ Dirección .onion en texto plano (no seleccionable por trackers)

⚠️ **Pendiente de configurar en producción:**
- [ ] Cabeceras HTTP del servidor
- [ ] Servicio TOR Hidden Service
- [ ] Actualizar dirección .onion real
- [ ] Certificado SSL/TLS (Let's Encrypt recomendado)
- [ ] Configurar CSP (Content Security Policy)

### 4. Pruebas de Seguridad

#### Verificar No-Cache
```bash
curl -I https://tu-dominio.com | grep -i cache
# Debe mostrar: Cache-Control: no-store, no-cache, must-revalidate, max-age=0
```

#### Verificar Botón de Pánico
1. Abrir la aplicación
2. Presionar ESC
3. Verificar redirección inmediata a Google
4. Verificar que no quede registro en historial

#### Verificar TOR Access
1. Abrir TOR Browser
2. Navegar a tu dirección .onion
3. Verificar que la aplicación carga correctamente
4. Verificar que no hay fugas de DNS/IP

### 5. Consideraciones Adicionales

#### Logging
- **NO** registrar IPs de usuarios
- **NO** registrar User-Agents
- **NO** registrar timestamps precisos (usar rangos de tiempo)
- Usar logging anónimo solo para errores críticos

#### Base de Datos
- Usar UUIDs aleatorios (no secuenciales)
- Encriptar datos sensibles en reposo
- No almacenar información que pueda identificar al denunciante

#### Monitoreo
- Implementar alertas de seguridad sin tracking de usuarios
- Usar métricas agregadas (no individuales)
- Auditorías de seguridad periódicas

### 6. Actualización de Dirección .onion

Cuando tengas tu dirección .onion real:

```typescript
// components/SecurityGateway.tsx - Línea 10
const onionAddress = "tu_direccion_real_aqui.onion";
```

### 7. Backup y Recuperación

- Hacer backup de `/var/lib/tor/siiec_hidden_service/` (contiene las claves privadas)
- Guardar las claves en un lugar seguro offline
- Documentar el proceso de recuperación

---

## 📋 Checklist de Deployment

- [ ] Configurar cabeceras HTTP en servidor web
- [ ] Instalar y configurar TOR Hidden Service
- [ ] Obtener y actualizar dirección .onion
- [ ] Configurar SSL/TLS
- [ ] Implementar CSP
- [ ] Deshabilitar logging de IPs
- [ ] Probar botón de pánico
- [ ] Probar acceso vía TOR
- [ ] Auditoría de seguridad
- [ ] Documentar procedimientos de emergencia

---

## 🆘 Procedimiento de Emergencia

Si se detecta una brecha de seguridad:

1. **Inmediato:** Activar modo mantenimiento
2. Rotar claves TOR (generar nueva dirección .onion)
3. Auditar logs de acceso
4. Notificar a usuarios vía canal seguro
5. Implementar parches de seguridad
6. Realizar pruebas exhaustivas
7. Restaurar servicio con nueva configuración

---

**Última actualización:** 2026-01-28
**Versión:** 1.0
