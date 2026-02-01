# Guía de Contribución y Seguridad para SIIEC / DenunzIA

¡Gracias por tu interés en hacer que DenunzIA sea más seguro! Este proyecto es de Código Abierto (Open Source) y valoramos enormemente la colaboración de la comunidad, especialmente en temas de seguridad y privacidad.

## 🛡️ Política de Seguridad

Nos tomamos la seguridad de nuestros denunciantes muy en serio. Si descubres una vulnerabilidad de seguridad, te pedimos que sigas el protocolo de **Divulgación Responsable**.

### Reporte de Vulnerabilidades

**NO** abras un Issue público en GitHub para reportar vulnerabilidades críticas (ej. fugas de datos, fallos de cifrado, inyecciones SQL/XSS).

1.  **Contacto Privado**: Envía los detalles de la vulnerabilidad inmediatamente a **security@siiec-denunzia.org** (o el contacto designado en el repositorio privado).
2.  **Cifrado**: Si es posible, cifra tu mensaje utilizando nuestra clave PGP pública (disponible en `/security.txt` o keyserver).
3.  **Detalles**: Incluye pasos para reproducir el fallo, impacto estimado y cualquier prueba de concepto (PoC).

Nos comprometemos a confirmar la recepción en 48 horas y a enviar parches de seguridad regularmente.

---

## 💻 Pautas para Contribuidores (Dev)

### Estándares de Código Seguro

1.  **Sanitización de Datos**: Nunca confíes en el input del usuario. Utiliza las librerías de sanitización preinstaladas (`encryptionService.ts`, etc.).
2.  **Secretos**: Jamás subas `.env`, claves privadas (`.pem`) o tokens al repositorio. Utiliza `.env.example`.
3.  **Dependencias**: Evita añadir paquetes npm innecesarios. Revisa `npm audit` antes de hacer commit.

### Flujo de Trabajo

1.  Haz un Fork del repositorio.
2.  Crea una rama (`git checkout -b feature/mejora-auditoria`).
3.  Implementa tus cambios y añade tests si es relevante.
4.  Asegúrate de pasar los tests de seguridad (`npm run test:security` si está disponible).
5.  Abre un Pull Request (PR) describiendo tus cambios.

### Auditoría Automatizada

Este proyecto incluye herramientas para facilitar la auditoría:
- **Docker**: Usa `docker-compose up` para replicar el entorno exacto.
- **Swagger**: Consulta `/api-docs` en el backend para entender la API.
- **Tests**: Scripts en `server/tests/` para verificar sanitización de metadatos.

---

## 📜 Licencia

Al contribuir, aceptas que tu código se publique bajo la licencia MIT del proyecto.
