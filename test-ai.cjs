const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "server/.env") });

async function analyzeReport(narrative, crimeType) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not found in server/.env");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analiza la siguiente denuncia ciudadana y determina su veracidad y viabilidad.
    Tipo de delito reportado: ${crimeType}
    Narrativa: "${narrative}"
    
    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "trustScore": (número entre 0.0 y 1.0),
      "summary": (resumen corto de 1 párrafo),
      "isSpam": (boolean),
      "viabilityReason": (explicación breve)
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
}

async function run() {
    console.log("Iniciando prueba de AI...");
    try {
        const res = await analyzeReport("Presencié un robo en la esquina. Eran dos hombres en moto.", "ROBO");
        console.log("Resultado real:", JSON.stringify(res, null, 2));

        const res2 = await analyzeReport("asdfghjkl spam test 123", "OTRO");
        console.log("Resultado spam:", JSON.stringify(res2, null, 2));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

run();
