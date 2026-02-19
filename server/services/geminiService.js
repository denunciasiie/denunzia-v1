import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const getModel = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    try {
        const genAI = new GoogleGenerativeAI(key);
        return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (e) {
        console.error('[AI] Failed to initialize GoogleGenerativeAI:', e.message);
        return null;
    }
};

/**
 * Server-Side AI Analysis of Criminal Reports
 * Analyzes narrative, determines trust score, and filters spam.
 * 
 * @param {string} narrative - The user's story
 * @param {string} category - Crime category
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeNarrative = async (narrative, category = 'General') => {
    const model = getModel();

    if (!model) {
        console.warn('[AI] GEMINI_API_KEY not configured or invalid. Skipping analysis.');
        return {
            trustScore: 0.85,
            aiAnalysis: 'Análisis simulado (Servidor sin API Key).',
            isSpam: false
        };
    }

    if (!narrative || narrative.trim().length < 10) {
        console.log('[AI] Narrative too short for analysis.');
        return {
            trustScore: 0.1,
            aiAnalysis: 'Narrativa demasiado corta para análisis.',
            isSpam: true
        };
    }

    try {
        // Sanitize narrative for the prompt
        const cleanNarrative = narrative.replace(/["\\]/g, '').substring(0, 2000);

        const prompt = `Analiza la siguiente denuncia ciudadana para un sistema de inteligencia criminal.
Categoría: ${category}
Narrativa: "${cleanNarrative}"

Evalúa de forma objetiva:
1. Verosimilitud (trustScore): puntuación de 0.0 a 1.0 basada en la coherencia y nivel de detalle.
2. Resumen ejecutivo (aiAnalysis): resumen breve de máximo 200 caracteres enfocándose en hechos.
3. ¿Es spam o texto aleatorio? (isSpam): verdadero si no tiene sentido o es una broma.

Responde ÚNICAMENTE con un JSON válido en este formato exacto:
{"trustScore": 0.8, "aiAnalysis": "Descripción breve...", "isSpam": false}`;

        console.log(`[AI] Calling Gemini API for narrative length: ${cleanNarrative.length}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        try {
            const data = JSON.parse(text);
            console.log(`[AI] Analysis success for category: ${category}`);
            return {
                trustScore: Math.min(Math.max(parseFloat(data.trustScore || 0.5), 0), 1),
                aiAnalysis: data.aiAnalysis || 'Análisis completado.',
                isSpam: !!data.isSpam
            };
        } catch (jsonError) {
            console.error('[AI] Failed to parse Gemini JSON response:', text);
            return { trustScore: 0.5, aiAnalysis: 'Error procesando respuesta técnica de la IA.', isSpam: false };
        }
    } catch (error) {
        console.error('[AI] Gemini Service Error:', error.message);

        // Specific error messages for the UI
        let userMsg = 'Error en servicio de IA.';
        if (error.message.includes('API key')) userMsg = 'Error: Clave de IA inválida.';
        if (error.message.includes('quota')) userMsg = 'Error: Cuota de IA excedida.';

        return { trustScore: 0.5, aiAnalysis: userMsg, isSpam: false };
    }
};
