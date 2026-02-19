import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const analyzeWithGemini = async (narrative, category) => {
    let key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    key = key.trim().replace(/["']/g, '');

    try {
        console.log('[AI] Provando Gemini fallback...');
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analiza esta denuncia (Cat: ${category}): "${narrative.substring(0, 1000)}"
        Devuelve SOLO JSON: {"trustScore": 0.8, "aiAnalysis": "resumen", "isSpam": false}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text().replace(/```json|```/g, "").trim());
    } catch (e) {
        console.error('[AI] Gemini Fallo:', e.message);
        return null;
    }
};

const analyzeWithGroq = async (narrative, category) => {
    let key = process.env.GROQ_API_KEY;
    if (!key) {
        console.warn('[AI] GROQ_API_KEY no detectada en process.env');
        return null;
    }
    key = key.trim().replace(/["']/g, '');

    // Intentaremos con dos modelos por si uno está caído
    const models = ["llama-3.3-70b-versatile", "llama3-8b-8192"];

    for (const modelName of models) {
        try {
            console.log(`[AI] Intentando Groq con modelo: ${modelName}`);
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: modelName,
                messages: [
                    { role: "system", content: "Responde siempre en JSON puro." },
                    { role: "user", content: `Analiza esta denuncia (Cat: ${category}): "${narrative.substring(0, 500)}". Formato: {"trustScore": 0.5, "aiAnalysis": "resumen", "isSpam": false}` }
                ],
                response_format: { type: "json_object" }
            }, {
                headers: { 'Authorization': `Bearer ${key}` },
                timeout: 4000
            });

            const data = response.data.choices[0].message.content;
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
            console.error(`[AI] Groq Error con ${modelName}:`, e.response?.data?.error?.message || e.message);
            // Intentar con el siguiente modelo del bucle...
        }
    }
    return null;
};

export const analyzeNarrative = async (narrative, category = 'General') => {
    if (!narrative || narrative.trim().length < 10) {
        return { trustScore: 0.1, aiAnalysis: 'Texto muy corto.', isSpam: true };
    }

    const groqResult = await analyzeWithGroq(narrative, category);
    if (groqResult) return groqResult;

    const geminiResult = await analyzeWithGemini(narrative, category);
    if (geminiResult) return geminiResult;

    // Diagnóstico mejorado para la base de datos
    const keysDetected = Object.keys(process.env).filter(k => k.includes('KEY')).join(', ');
    console.error(`[AI] FALLO TOTAL. Claves en sistema: ${keysDetected || 'Ninguna'}`);

    return {
        trustScore: 0.5,
        aiAnalysis: `IA no disponible. (Claves vistas: ${keysDetected || 'N/A'}). Verifica variables en Render.`,
        isSpam: false
    };
};
