import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Universal AI Analysis Service
 * Supports: Groq (Primary/Fast), Gemini (Fallback), and Mock (failsafe)
 */

const analyzeWithGemini = async (narrative, category) => {
    let key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    key = key.trim().replace(/["']/g, '');

    try {
        console.log('[AI] Attempting Gemini analysis...');
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analiza esta denuncia criminal (Categoría: ${category}). 
        Narrativa: "${narrative.substring(0, 1000)}"
        
        Responde ÚNICAMENTE con un JSON válido: 
        {"trustScore": 0.8, "aiAnalysis": "resumen técnico", "isSpam": false}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(text);
    } catch (e) {
        console.error('[AI] Gemini Error:', e.message);
        return null;
    }
};

const analyzeWithGroq = async (narrative, category) => {
    let key = process.env.GROQ_API_KEY;
    if (!key) {
        console.log('[AI] No GROQ_API_KEY found in environment');
        return null;
    }
    key = key.trim().replace(/["']/g, '');

    try {
        console.log('[AI] Attempting Groq analysis (Llama 3)...');
        // Using llama3-8b-8192 which is very stable for free tier
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-8b-8192",
            messages: [
                {
                    role: "system",
                    content: "Analista de inteligencia criminal. Responde siempre en JSON limpio."
                },
                {
                    role: "user",
                    content: `Analiza esta denuncia (Categoría: ${category}): "${narrative.substring(0, 1000)}"
                    Formato JSON: {"trustScore": 0.8, "aiAnalysis": "resumen", "isSpam": false}`
                }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        const data = response.data.choices[0].message.content;
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
        const errorMsg = e.response?.data?.error?.message || e.message;
        console.error('[AI] Groq Error:', errorMsg);
        return null;
    }
};

export const analyzeNarrative = async (narrative, category = 'General') => {
    if (!narrative || narrative.trim().length < 10) {
        return { trustScore: 0.1, aiAnalysis: 'Texto demasiado corto para análisis.', isSpam: true };
    }

    // 1. Try Groq (Fastest)
    const groqResult = await analyzeWithGroq(narrative, category);
    if (groqResult && groqResult.aiAnalysis) {
        console.log('[AI] Success: Analyzed via Groq');
        return groqResult;
    }

    // 2. Try Gemini (Fallback)
    const geminiResult = await analyzeWithGemini(narrative, category);
    if (geminiResult && geminiResult.aiAnalysis) {
        console.log('[AI] Success: Analyzed via Gemini');
        return geminiResult;
    }

    // 3. Last Resort
    console.warn('[AI] CRITICAL: Both Groq and Gemini failed. Returning pending status.');
    return {
        trustScore: 0.85,
        aiAnalysis: 'Análisis pendiente (Servicios de IA no disponibles temporalmente).',
        isSpam: false
    };
};
