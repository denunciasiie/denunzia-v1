
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

// NOTE: In a production environment, API calls should proxy through a secure backend 
// to avoid exposing keys and to perform server-side sanitization. 

export interface AnalysisResult {
  trustScore: number;
  spamProbability: number;
  extractedEntities: string[];
  summary: string;
}

export const analyzeReport = async (narrative: string, crimeType: string): Promise<AnalysisResult> => {
  // We initialize here to prevent top-level crashes if process.env is accessed prematurely in some environments
  let apiKey = '';
  try {
    apiKey = process.env.API_KEY || '';
  } catch (e) {
    console.warn("Cannot access process.env.API_KEY");
  }

  if (!apiKey) {
    console.warn("No API Key found for Gemini. Returning mock data.");
    return {
      trustScore: 0.85,
      spamProbability: 0.05,
      extractedEntities: ["Entidad No Identificada"],
      summary: "Análisis simulado (sin API Key)."
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Actúa como un analista de inteligencia criminal. Analiza la siguiente denuncia ciudadana para el sistema SIIEC.
      
      Tipo de Delito: ${crimeType}
      Narrativa: "${narrative}"

      Debes evaluar:
      1. Verosimilitud (trustScore): 0 a 1. Basado en coherencia y detalles.
      2. Probabilidad de Spam/Falso (spamProbability): 0 a 1.
      3. Entidades (nombres, empresas, lugares) mencionadas.
      4. Un breve resumen neutral.

      Devuelve JSON puro.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trustScore: { type: Type.NUMBER, description: "Puntuación de credibilidad de 0 a 1" },
            spamProbability: { type: Type.NUMBER, description: "Probabilidad de que sea spam o falso" },
            extractedEntities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de personas u organizaciones mencionadas"
            },
            summary: { type: Type.STRING, description: "Resumen ejecutivo de 1 o 2 oraciones" }
          },
          required: ["trustScore", "spamProbability", "extractedEntities", "summary"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");
    
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing report with Gemini:", error);
    // Fallback
    return {
      trustScore: 0.5,
      spamProbability: 0.0,
      extractedEntities: [],
      summary: "Error en análisis automatizado."
    };
  }
};
