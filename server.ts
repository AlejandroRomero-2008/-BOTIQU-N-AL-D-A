import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Inicialización de Gemini SDK en el servidor con User-Agent de telemetría requerido
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * 1. ESQUEMA FIJO ESTRUCTURADO (responseSchema)
 */
export const medicationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    nombreComercial: {
      type: Type.STRING,
      description: 'Nombre del medicamento consultado',
    },
    principioActivo: {
      type: Type.STRING,
      description: 'Principio activo o fármaco base (ej: Paracetamol, Ibuprofeno)',
    },
    categoria: {
      type: Type.STRING,
      description: 'Categoría médica (ej: Analgésico, Antihistamínico, Antibiótico)',
    },
    accionTerapeutica: {
      type: Type.STRING,
      description: 'Qué efecto produce en el organismo y para qué sirve',
    },
    dosisRecomendadaAdultos: {
      type: Type.STRING,
      description: 'Posología orientativa para adultos según prospecto estándar',
    },
    advertenciasYContraindicaciones: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Lista de precauciones, advertencias o contraindicaciones críticas',
    },
    recomendacionAlmacenamiento: {
      type: Type.STRING,
      description: 'Condiciones de conservación en el botiquín del hogar',
    },
    requiereReceta: {
      type: Type.BOOLEAN,
      description: 'True si es venta bajo receta médica obligatoria, false si es de venta libre',
    },
    nivelUrgencia: {
      type: Type.STRING,
      description: 'Nivel de urgencia en caso de síntomas asociados (Baja, Media o Alta)',
    },
  },
  required: [
    'nombreComercial',
    'principioActivo',
    'categoria',
    'accionTerapeutica',
    'dosisRecomendadaAdultos',
    'advertenciasYContraindicaciones',
    'recomendacionAlmacenamiento',
    'requiereReceta',
    'nivelUrgencia',
  ],
};

/**
 * 5. EJEMPLO DE RESPUESTA DE PRUEBA (MOCK)
 * Para desarrollar y probar la interfaz sin gastar llamadas a la API ni requerir API key.
 */
export const MOCK_MEDICATION_DATA = {
  nombreComercial: 'Ibuprofeno 400 mg',
  principioActivo: 'Ibuprofeno',
  categoria: 'Analgésico y Antiinflamatorio no esteroideo (AINE)',
  accionTerapeutica: 'Alivia el dolor leve a moderado, reduce la inflamación y baja la fiebre.',
  dosisRecomendadaAdultos: '1 comprimido (400 mg) cada 6 a 8 horas con comida o abundante agua. No superar 1200 mg/día sin supervisión médica.',
  advertenciasYContraindicaciones: [
    'Tomar siempre con alimentos para proteger la mucosa gástrica',
    'Contraindicado en personas con úlcera péptica activa o hemorragia digestiva',
    'Evitar el uso prolongado sin supervisión en pacientes hipertensos o con insuficiencia renal',
    'No combinar con otros antiinflamatorios (como aspirina o naproxeno)'
  ],
  recomendacionAlmacenamiento: 'Conservar en su envase original a menos de 25°C, en lugar seco y protegido de la luz directa.',
  requiereReceta: false,
  nivelUrgencia: 'Media',
};

// Endpoint API para consultar medicamento con salida estructurada
app.post('/api/ai/medication-info', async (req, res) => {
  const { medicationName, useMock } = req.body;

  if (!medicationName && !useMock) {
    return res.status(400).json({ error: 'Debes proporcionar el nombre de un medicamento.' });
  }

  // Si se solicita mock expresamente o no hay API key configurada, responder con dato estructurado de prueba
  if (useMock || !ai) {
    return res.json({
      success: true,
      source: 'mock',
      data: {
        ...MOCK_MEDICATION_DATA,
        nombreComercial: medicationName || MOCK_MEDICATION_DATA.nombreComercial,
      },
    });
  }

  try {
    // 4. MANEJO DE TIEMPO LÍMITE (TIMEOUT DE 10s PARA RESPUESTAS LENTAS)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 12000)
    );

    const geminiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Proporciona información farmacológica estructurada, fidedigna y orientativa de botiquín del hogar para el medicamento o compuesto: "${medicationName}". Responde estrictamente según el esquema fijado.`,
      config: {
        systemInstruction:
          'Eres un farmacéutico profesional experto en botiquines del hogar. Responde estrictamente con datos verificados y precisos en formato JSON según el esquema especificado.',
        responseMimeType: 'application/json',
        responseSchema: medicationResponseSchema as any,
      },
    });

    const response = (await Promise.race([geminiCall, timeoutPromise])) as any;
    const jsonText = response.text?.trim();

    if (!jsonText) {
      return res.status(502).json({
        error: 'La IA devolvió una respuesta vacía.',
        fallbackData: MOCK_MEDICATION_DATA,
      });
    }

    const structuredData = JSON.parse(jsonText);

    // Validación mínima del esquema para asegurar que no falten campos clave
    if (
      !structuredData.principioActivo ||
      !Array.isArray(structuredData.advertenciasYContraindicaciones)
    ) {
      return res.status(502).json({
        error: 'La respuesta de la IA no cumplió el esquema requerido.',
        fallbackData: MOCK_MEDICATION_DATA,
      });
    }

    return res.json({
      success: true,
      source: 'gemini-api',
      data: structuredData,
    });
  } catch (error: any) {
    console.error('Error en llamada a Gemini API:', error);

    if (error.message === 'TIMEOUT_EXCEEDED') {
      return res.status(504).json({
        error: 'La IA demoró más de 12 segundos en responder (Timeout).',
        fallbackData: MOCK_MEDICATION_DATA,
      });
    }

    return res.status(500).json({
      error: error.message || 'Error al procesar la solicitud con la IA.',
      fallbackData: MOCK_MEDICATION_DATA,
    });
  }
});

// Configuración de Vite dev middlewares en desarrollo o archivos estáticos en producción
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Botiquín al Día ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
