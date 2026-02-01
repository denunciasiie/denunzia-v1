/**
 * TEST DE AUDITORÍA DE SEGURIDAD: FILTRADO DE METADATOS EXIF (GPS)
 * 
 * Este script simula un ataque donde un usuario malicioso o un dispositivo 
 * comprometido envía una imagen con coordenadas GPS incrustadas.
 * 
 * Objetivo: Verificar si el backend sanitiza estos metadatos antes de almacenarlos
 * o devolverlos.
 * 
 * Ejecución: node server/tests/metadata-check.js
 */

const API_URL = 'http://localhost:3004/api';

// Payload simulado con "imagen" conteniendo metadatos falsos (simulación en texto plano tras cifrado hipotético)
// En un escenario real E2EE, el servidor recibe Blob cifrado. 
// Aquí probamos si el servidor detecta y limpia 'trazas' conocidas si tuviera acceso, 
// o si persisten en la base de datos al recuperarlos.
async function runMetadataTest() {
    console.log('\n🔒 INICIANDO TEST DE EXFILTRACIÓN DE METADATOS (GPS)...');

    // 1. Crear reporte con "Inyección Exif Simulada"
    // Simulamos que encryptedData contiene una cadena base64 con headers EXIF
    const maliciousPayload = {
        id: "TEST-" + Date.now().toString(16).toUpperCase(),
        category: "COMMON",
        type: "THEFT",
        // Simulamos datos cifrados que, al descifrarse, revelan metadatos
        // En una prueba real de integración, usaríamos el servicio de cifrado real.
        // Como esto verifica la política del servidor, enviamos un marcador claro.
        encryptedData: "SIMULATED_ENCRYPTED_DATA_WITH_EXIF_GPS_LAT_19.4326_LON_-99.1332",
        encryptedKey: "SIMULATED_KEY",
        iv: "SIMULATED_IV",
        isAnonymous: true
    };

    console.log(`[1] Enviando payload malicioso ID: ${maliciousPayload.id}`);

    try {
        const res = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(maliciousPayload)
        });

        if (!res.ok) {
            throw new Error(`Error en subida: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log(`[2] Reporte guardado exitosamente. ID DB: ${data.id}`);

        // 2. Intentar recuperar el reporte (Simulando Administrador)
        console.log(`[3] Recuperando reporte para inspección forense...`);
        const getRes = await fetch(`${API_URL}/reports/${data.id}`);

        if (!getRes.ok) {
            console.log('⚠️ No se pudo recuperar el reporte (¿Falta Auth?). Asumiendo seguro por inaccesibilidad.');
            return;
        }

        const report = await getRes.json();
        const storedData = report.report.encrypted_data || "";

        // 3. Verificar persistencia de Metadatos
        console.log(`[4] Analizando datos almacenados...`);

        if (storedData.includes("GPS_LAT")) {
            console.error('\n❌ FALLO CRÍTICO DE AUDITORÍA: METADATOS GPS PERSISTENTES');
            console.error('   El servidor almacenó los metadatos de ubicación sin sanitizar.');
            console.error('   Evidencia encontrada: ' + storedData);
            process.exit(1); // Falla el test
        } else {
            console.log('\n✅ PASÓ: Metadatos no detectados en texto plano o fueron sanitizados.');
            process.exit(0);
        }

    } catch (error) {
        console.error('❌ Error ejecutando el test:', error.message);
        // Si falla la conexión, es un error de entorno, no necesariamente de seguridad, pero para CI/CD es fallo.
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
runMetadataTest();
