import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Server-Side AI Analysis of Criminal Reports
 * Analyzes narrative, determines trust score, and filters spam.
 * 
 * @param {string} narrative - The user's story
 * @param {string} category - Crime category
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeNarrative = async (narrative, category = 'General') => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not configured. AI analysis skipped.');
        return {
            trustScore: 0.85,
            aiAnalysis: 'Análisis no disponible (Falta configuración).',
            isSpam: false
        };
    }

    if (!narrative || narrative.trim().length < 10) {
        return {
            trustScore: 0.1,
            aiAnalysis: 'Narrativa demasiado corta para análisis.',
            isSpam: true
        };
    }

    try {
        const prompt = `Analiza la siguiente denuncia ciudadana para un sistema de inteligencia criminal.
        Categoría: ${category}
        Narrativa: "${narrative}"
        
        Evalúa:
        1. Verosimilitud (trustScore): de 0.0 a 1.0.
        2. Resumen ejecutivo (aiAnalysis): breve y técnico.
        3. ¿Es spam o texto aleatorio? (isSpam): boolean.
        
        Responde ÚNICAMENTE con un JSON válido:
        {"trustScore": 0.0-1.0, "aiAnalysis": "...", "isSpam": boolean}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        try {
            const data = JSON.parse(text);
            return {
                trustScore: Math.min(Math.max(parseFloat(data.trustScore || 0.5), 0), 1),
                aiAnalysis: data.aiAnalysis || 'Análisis completado.',
                isSpam: !!data.isSpam
            };
        } catch (jsonError) {
            console.error('Failed to parse Gemini JSON:', text);
            return { trustScore: 0.5, aiAnalysis: 'Error procesando respuesta de IA.', isSpam: false };
        }
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        return { trustScore: 0.5, aiAnalysis: 'Error en servicio de IA.', isSpam: false };
    }
};
