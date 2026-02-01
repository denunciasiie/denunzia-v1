/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_GEMINI_API_KEY?: string;
    // Agregar más variables de entorno según sea necesario
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
