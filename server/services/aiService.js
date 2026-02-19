import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Universal AI Analysis Service
 * Supports: Groq (Primary/Fast), Gemini (Fallback), and Mock (failsafe)
 */

const analyzeWithGemini = async (narrative, category) => {
    const key = process.env.GEMINI_API_KEY?.trim().replace(/["']/g, '');
    if (!key) return null;

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analiza esta denuncia criminal (Categoría: ${category}): "${narrative.substring(0, 1000)}"
        Responde SOLO JSON: {"trustScore": 0.0-1.0, "aiAnalysis": "resumen breve", "isSpam": boolean}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text().replace(/```json|```/g, "").trim());
    } catch (e) {
        console.error('[AI] Gemini Error:', e.message);
        return null;
    }
};

const analyzeWithGroq = async (narrative, category) => {
    const key = process.env.GROQ_API_KEY?.trim().replace(/["']/g, '');
    if (!key) return null;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "Eres un experto en análisis criminal. Responde siempre en JSON puro."
                },
                {
                    role: "user",
                    content: `Analiza esta denuncia (Categoría: ${category}): "${narrative.substring(0, 1000)}"
                    Responde en este formato JSON: {"trustScore": 0.8, "aiAnalysis": "resumen", "isSpam": false}`
                }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });

        return JSON.parse(response.data.choices[0].message.content);
    } catch (e) {
        console.error('[AI] Groq Error:', e.message);
        return null;
    }
};

export const analyzeNarrative = async (narrative, category = 'General') => {
    if (!narrative || narrative.trim().length < 10) {
        return { trustScore: 0.1, aiAnalysis: 'Texto demasiado corto.', isSpam: true };
    }

    // 1. Try Groq first (Preferred: Faster, Higher limits)
    let result = await analyzeWithGroq(narrative, category);
    if (result) {
        console.log('[AI] Analysis completed via Groq (Llama 3)');
        return result;
    }

    // 2. Try Gemini as fallback
    result = await analyzeWithGemini(narrative, category);
    if (result) {
        console.log('[AI] Analysis completed via Gemini');
        return result;
    }

    // 3. Failsafe (No keys or all failed)
    console.warn('[AI] All AI providers failed or not configured. Using mock data.');
    return {
        trustScore: 0.85,
        aiAnalysis: 'Análisis pendiente (Servicio de IA agotado o no configurado).',
        isSpam: false
    };
};
