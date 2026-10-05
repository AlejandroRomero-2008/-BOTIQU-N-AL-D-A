# 🧪 Documentación de Prompt 4: Casos de Prueba y QA de Resiliencia en UI

**Rol:** Tester de Software (QA Engineer)  
**Fecha de implementación:** Octubre 2026  
**Objetivo:** Auditar y blindar la aplicación frente a 10 escenarios reales de rotura desde la interfaz de usuario, garantizando estabilidad sin modificar el diseño original ni agregar dependencias innecesarias.

---

## 📋 Matriz de los 10 Casos de Prueba (Edge Cases)

| # | Caso de Prueba | Riesgo | Estado de Mitigación |
| :--- | :--- | :--- | :--- |
| **1** | Nombre con solo espacios (`"   "`) | Registro fantasma sin texto legible | ✅ Bloqueado con `.trim()` |
| **2** | Texto o notación científica en cantidad (`"1e10"`, `"--"`) | `NaN` o valores infinitos en stock | ✅ Filtrado por `onKeyDown` y `isNaN()` |
| **3** | Cantidades negativas o cero (`-5`, `0`) | Medicamento con stock ilógico | ✅ `qty > 0` y `min="0.1"` |
| **4** | Fechas imposibles (Año `0001`, `9999`) | Rompe cálculos de días de vencimiento | ✅ Regex `YYYY-MM-DD` y rango 1990-2099 |
| **5** | Texto de 500+ caracteres continuos | Desborde horizontal de tarjetas | ✅ `maxLength` y `truncate` / `break-words` |
| **6** | Doble clic rápido en "Registrar" | Creación de registros duplicados | ✅ Flag `isSubmitting` y botón deshabilitado |
| **7** | Importar JSON corrupto o con formato inválido | Caída en `JSON.parse` pantalla blanca | ✅ Validación con `try/catch` y chequeo de array |
| **8** | Inyección HTML / XSS (`<script>`) | Intento de ejecución de scripts | ✅ React JSX escapa texto nativamente |
| **9** | Memoria local llena (`QuotaExceededError`) | Crash al intentar guardar en `localStorage` | ✅ Manejo con `try/catch` defensivo |
| **10** | Pérdida de conexión a mitad de una acción | Suposición de fallo de red | ✅ La app es 100% offline-first y local |

---

## 🔍 Detalle Técnico de los 10 Casos

Cada caso incluye:
1. **Qué pasaría:** Comportamiento previo o riesgo en producción.
2. **Qué debería pasar:** Comportamiento esperado según las mejores prácticas de QA.
3. **Código mínimo:** Fragmento preciso aplicado en la solución.
