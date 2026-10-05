# 📋 Documentación de Prompt 1: Primera Versión Funcional (MVP)

**Fecha de implementación:** Octubre 2026  
**Objetivo del Prompt:** Crear la primera versión funcional de **Botiquín al Día** para el responsable del hogar, resolviendo el problema: *"La mitad del botiquín de la casa está vencido"*.

---

## 🎯 Alcance del Prompt 1 (3 Funciones Estrictas)

1. **Registrar producto con cantidad y fecha de vencimiento:**
   - Formulario modal touch-first adaptado a móviles.
   - Atajos rápidos de vencimiento (+1 mes/30 días, +6 meses, +1 año, +2 años).
   - Selector de unidades (comprimidos, ml, gotas, sobres, frascos, etc.).
   - Validación estricta numérica y de formato de fecha.

2. **Alerta de lo que vence en 30 días:**
   - Cálculo en días calendario exactos mitigando errores de huso horario UTC vs local y cambios de horario de verano (DST).
   - Categorización con urgencia visual:
     - 🚨 **Vencidos:** Fondo rojo y aviso de riesgo para la salud.
     - ⚠️ **Vence en ≤ 30 días:** Fondo ámbar y conteo regresivo ("vence en 8 días", "vence mañana").
     - ✅ **En buen estado:** > 30 días de vigencia.
   - Acción rápida con un solo toque: "Sumar a lista de reposición" o "Desechar".

3. **Lista de reposición (Farmacia):**
   - Agregado automático desde productos vencidos o agotados.
   - Agregado manual de elementos faltantes (ej: termómetro, alcohol, curitas).
   - Casillas de verificación para marcar lo comprado en la farmacia.
   - Botón directo para copiar la lista formateada lista para enviar por WhatsApp.
   - Opción de recargar al botiquín el producto recién comprado con su nueva fecha.

---

## 🛠️ Restricciones Cumplidas en este Prompt

- **Idioma:** 100% en español.
- **Sin librerías de pago:** Tecnologías open source nativas.
- **Sin login:** Acceso instantáneo sin fricción.
- **Sin base de datos remota:** Persistencia en `localStorage` con captura de excepciones.
- **Mobile-first:** Botones grandes, touch targets accesibles, navegación inferior/superior responsive.
- **Código comentado:** Puntos críticos de cálculo de fechas y horas documentados en `src/utils/dateUtils.ts` y `src/utils/storage.ts`.

---

## 📸 Evidencias de este Prompt

| Función | Captura de Referencia |
| :--- | :--- |
| **1. Registro de Producto** | `evidencias/01-registro-producto.png` |
| **2. Alerta 30 Días** | `evidencias/02-panel-alertas.png` |
| **3. Lista de Reposición** | `evidencias/03-lista-reposicion.png` |
