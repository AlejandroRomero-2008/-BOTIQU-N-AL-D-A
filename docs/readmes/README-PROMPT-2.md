# 📋 Documentación de Prompt 2: Estilo Gótico, Emojis de Pastillas 💊 y Modo Oscuro

**Fecha de implementación:** Octubre 2026  
**Objetivo del Prompt:** Incorporar mejoras visuales solicitadas por el usuario sin alterar la lógica de negocio ni romper funcionalidades previas:
1. **Letra gótica** para la identidad de marca de la aplicación.
2. **Emoji de pastillas 💊** en cabecera, pestañas, modales y listas.
3. **Modo oscuro (Dark Mode)** con switch interactivo (Sol ☀️ / Luna 🌙) y persistencia en `localStorage`.

---

## 🎨 Cambios Implementados

### 1. Tipografía Gótica (`font-gothic`)
- Se incluyó la fuente `MedievalSharp` y `UnifrakturMaguntia` desde Google Fonts en `index.html`.
- Se definió la clase de utilidad `.font-gothic` en `src/index.css`.
- Se aplicó al título principal del botiquín en la barra superior.

### 2. Emoji de Pastillas 💊
- Presente en el isotipo de la cabecera, junto al título `Botiquín al Día 💊`.
- En la pestaña táctil `💊 1. Botiquín`.
- En el título y botón del modal de registro de medicamentos.
- En las tarjetas del listado de medicamentos y de compras para farmacia.

### 3. Modo Oscuro (Dark Mode)
- **Persistencia:** Almacenado en `localStorage.getItem('botiquin_dark_mode')`, con detección automática del tema del sistema (`prefers-color-scheme: dark`) si no hay preferencia previa.
- **Botón Switch:** Ubicado en la cabecera al lado del botón "Registrar", alternando entre iconos de Sol ☀️ y Luna 🌙.
- **Paleta oscura:** Uso de tonalidades `slate-900` y `slate-950` con contrastes accesibles y bordes sutiles en `slate-800` para evitar fatiga visual nocturna.

---

## 📸 Evidencias de este Prompt

| Función | Captura de Referencia |
| :--- | :--- |
| **Modo Oscuro con Letra Gótica y 💊** | `evidencias/05-modo-oscuro-gotico.png` |
| **Modal en Modo Oscuro** | `evidencias/06-modal-modo-oscuro.png` |
