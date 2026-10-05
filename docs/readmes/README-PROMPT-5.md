# 🧠 Documentación de Módulo 5 (Prompt 5): Inteligencia con Salida Estructurada

**Fecha de implementación:** Octubre 2026  
**Commit asignado:** `git commit -m "M5: inteligencia con salida estructurada"`  
**Objetivo:** Integrar un Consultor Farmacológico inteligente con la API de Google Gemini (`gemini-3.8-flash`) utilizando **salida estrictamente estructurada en JSON (`responseSchema`)**, presentación de datos discretos en la UI, configuración segura por variable de entorno, manejo de fallos y modo Mock sin consumo de llamadas.

---

## 1. Esquema Fijo Estructurado (`responseSchema`)

La IA está configurada mediante el SDK `@google/genai` con `responseMimeType: "application/json"` y el siguiente `responseSchema` TypeScript:

```typescript
import { Type } from '@google/genai';

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
```

---

## 2. Consumo en la App: Datos, No Párrafos

En lugar de renderizar un texto largo o un bloque de Markdown no estructurado, la app consume el objeto JSON y lo proyecta en componentes visuales discretos:

1. **Badges de estado:**
   - `[📂 Categoría]`
   - `[📋 Venta Bajo Receta / ✅ Venta Libre]`
   - `[🚨 Nivel de Urgencia: Baja | Media | Alta]`
2. **Grilla de métricas clave:**
   - Tarjeta de **Principio Activo**.
   - Tarjeta de **Acción Terapéutica**.
3. **Módulo de Posología:** Tarjeta destacada con icono de reloj ⏱️ para la dosis recomendada.
4. **Conservación:** Instrucción específica para el almacenamiento físico en el botiquín 🌡️.
5. **Lista de Advertencias:** Cada elemento del array `advertenciasYContraindicaciones` se desglosa en un chip de advertencia independiente con icono ⚠️.

---

## 3. Configuración de la Llave de API (`GEMINI_API_KEY`)

La API Key **NUNCA** se expone en el navegador ni en el frontend. Se lee exclusivamente en el servidor backend Express (`server.ts`):

```bash
# En tu archivo .env local:
GEMINI_API_KEY="AIzaSyTuClaveDeGoogleGeminiAqui"
PORT=3000
```

### Pasos para configurarla:
1. Obtené tu clave gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Creá un archivo `.env` en la raíz del proyecto (usando `.env.example` como plantilla).
3. Añadí la línea `GEMINI_API_KEY=tu_clave`.
4. El servidor Node/Express cargará la variable automáticamente mediante `dotenv.config()`.

---

## 4. Manejo de Fallos (Timeout, Errores y Esquema Inválido)

El backend y frontend cuentan con defensas ante tres posibles escenarios de falla:

1. **Timeout (La IA responde lento):**  
   Se utiliza una promesa con carrera (`Promise.race`) fijada en **12 segundos**. Si la IA no responde en ese lapso, el servidor devuelve código `HTTP 504 Timeout` junto con el dato estructurado de respaldo (fallback).
2. **La IA no responde o devuelve 500 / Rate Limit:**  
   El modal captura el error, muestra un mensaje descriptivo en rojo y ofrece el botón: *"Cargar datos de prueba de emergencia"*.
3. **La respuesta no cumple el esquema:**  
   Se valida que existan las propiedades obligatorias (`principioActivo` y array `advertenciasYContraindicaciones`). Si la respuesta viene incompleta, se rechaza y se activa el fallback seguro.

---

## 5. Ejemplo de Respuesta de Prueba (Mock para desarrollo sin costo)

Permite probar y diseñar la interfaz sin consumir cuota de llamadas ni requerir una API Key activa:

```json
{
  "nombreComercial": "Ibuprofeno 400 mg",
  "principioActivo": "Ibuprofeno",
  "categoria": "Analgésico y Antiinflamatorio no esteroideo (AINE)",
  "accionTerapeutica": "Alivia el dolor leve a moderado, reduce la inflamación y baja la fiebre.",
  "dosisRecomendadaAdultos": "1 comprimido (400 mg) cada 6 a 8 horas con comida o abundante agua. No superar 1200 mg/día sin supervisión médica.",
  "advertenciasYContraindicaciones": [
    "Tomar siempre con alimentos para proteger la mucosa gástrica",
    "Contraindicado en personas con úlcera péptica activa o hemorragia digestiva",
    "Evitar el uso prolongado sin supervisión en pacientes hipertensos o con insuficiencia renal",
    "No combinar con otros antiinflamatorios (como aspirina o naproxeno)"
  ],
  "recomendacionAlmacenamiento": "Conservar en su envase original a menos de 25°C, en lugar seco y protegido de la luz directa.",
  "requiereReceta": false,
  "nivelUrgencia": "Media"
}
```
*(Podés probarlo haciendo clic en **"⚡ Usar respuesta de prueba (Mock)"** dentro del modal).*
