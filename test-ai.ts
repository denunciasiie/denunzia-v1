import dotenv from 'dotenv';
import { analyzeReport } from './services/geminiService.ts';

dotenv.config();

async function testGemini() {
    console.log('--- TEST 1: Narrativa Real ---');
    const narrative1 = 'Presencié un robo a mano armada en la esquina de mi casa. Dos sujetos en una motocicleta roja despojaron de sus pertenencias a una mujer que caminaba por la banqueta. Ocurrió ayer a las 8 PM.';
    try {
        const result1 = await analyzeReport(narrative1, 'ASALTO');
        console.log('Resultado 1:', JSON.stringify(result1, null, 2));
    } catch (e) {
        console.error('Error 1:', e.message);
    }

    console.log('\n--- TEST 2: Spam / Incoherente ---');
    const narrative2 = 'asdfghjkl qwerty 123456 spam test !!! hhh';
    try {
        const result2 = await analyzeReport(narrative2, 'OTRO');
        console.log('Resultado 2:', JSON.stringify(result2, null, 2));
    } catch (e) {
        console.error('Error 2:', e.message);
    }
}

testGemini();
