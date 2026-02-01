import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SIIEC / DENUNZIA API',
            version: '2.0.0',
            description: 'API de documentación para el Sistema Integrado de Inteligencia Ética y Criminal. Permite la recepción de denuncias cifradas.',
            contact: {
                name: 'Soporte Técnico SIIEC',
            },
        },
        servers: [
            {
                url: 'http://localhost:3004',
                description: 'Servidor de Desarrollo / Auditoría',
            },
        ],
        components: {
            schemas: {
                Report: {
                    type: 'object',
                    required: ['id', 'category', 'type', 'encryptedData', 'encryptedKey', 'iv'],
                    properties: {
                        id: { type: 'string', description: 'ID único hexadecimal del reporte' },
                        isAnonymous: { type: 'boolean' },
                        role: { type: 'string', enum: ['CITIZEN', 'OFFICER', 'ADMIN'] },
                        category: { type: 'string', enum: ['COMMON', 'FEDERAL', 'HIGH_IMPACT'] },
                        type: { type: 'string', description: 'Tipo específico de delito (Robo, Extorsión, etc.)' },
                        encryptedData: { type: 'string', description: 'Payload cifrado en Base64' },
                        encryptedKey: { type: 'string', description: 'Llave simétrica cifrada con llave pública RSA (Base64)' },
                        iv: { type: 'string', description: 'Vector de inicialización (Base64)' },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./server.js', './routes/*.js'], // Files containing annotations
};

export const specs = swaggerJsdoc(options);
