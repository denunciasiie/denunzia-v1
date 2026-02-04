
import { query, closePool } from '../config/database.js';
import { decryptData } from '../services/decryptionService.js';
import readline from 'readline';

async function viewReports() {
    try {
        console.log('🔌 Conectando a la base de datos local...');

        const text = 'SELECT id, type, category, created_at, encrypted_data, encrypted_key, iv, algorithm FROM reports ORDER BY created_at DESC LIMIT 10';
        const res = await query(text);

        if (res.rows.length === 0) {
            console.log('📭 No se encontraron reportes en la base de datos.');
            await closePool();
            return;
        }

        console.log(`\n📋 Se encontraron ${res.rows.length} reportes recientes:\n`);

        for (const report of res.rows) {
            console.log('---------------------------------------------------');
            console.log(`🆔 ID: ${report.id}`);
            console.log(`📅 Fecha: ${new Date(report.created_at).toLocaleString()}`);
            console.log(`🏷️  Tipo: ${report.category} - ${report.type}`);

            try {
                if (!report.encrypted_data || !report.encrypted_key || !report.iv) {
                    console.log('⚠️  Datos incompletos para descifrado.');
                    continue;
                }

                console.log('🔓 Intentando descifrar...');
                const decrypted = decryptData({
                    encryptedData: report.encrypted_data,
                    encryptedKey: report.encrypted_key,
                    iv: report.iv,
                    algorithm: report.algorithm
                });

                console.log('\n📝 CONTENIDO DESCIFRADO:');
                console.log('Narrativa:', decrypted.narrative);
                if (decrypted.addressDetails) {
                    console.log('📍 Dirección:',
                        `${decrypted.addressDetails.street || ''}, ${decrypted.addressDetails.colony || ''}, ${decrypted.addressDetails.municipality || ''}, ${decrypted.addressDetails.state || ''}`
                    );
                }
                if (decrypted.entities) {
                    console.log('👥 Entidades:', decrypted.entities);
                }

            } catch (err) {
                console.error('❌ Error al descifrar:', err.message);
                console.error('   (Posible causa: La llave privada local no coincide con la llave pública usada en la web)');
            }
            console.log('---------------------------------------------------\n');
        }

    } catch (err) {
        console.error('Error fatal:', err);
    } finally {
        await closePool();
    }
}

viewReports();
