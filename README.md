# 🏥 Botiquín al Día

> **"La mitad del botiquín de la casa está vencido."**  
> *Botiquín al Día* es una aplicación web responsive diseñada para que el responsable del hogar mantenga el botiquín seguro, libre de medicamentos vencidos y con una lista de reposición lista para la farmacia.

---

## 📱 Funcionalidades Principales

1. **📦 Registro de Productos y Medicamentos**
   - Nombre, cantidad, unidad (comprimidos, ml, sobres, etc.) y fecha exacta de vencimiento.
   - Atajos rápidos de fecha (+1 mes, +6 meses, +1 año, +2 años).
   - Categorías y notas de uso familiar.

2. **⚠️ Sistema de Alertas (30 días y vencidos)**
   - Identificación visual inmediata con conteo de días calendario exactos.
   - 🚨 **Vencidos:** Alerta crítica para no consumir y retirar del botiquín.
   - ⚠️ **Vencen en ≤ 30 días:** Notificación preventiva para planificar la reposición.
   - ✅ **Vigentes:** Stock seguro para emergencias.

3. **🛒 Lista de Reposición (Farmacia)**
   - Agregado con 1 toque desde productos vencidos o con stock bajo.
   - Carga manual de insumos (termómetro, gasas, alcohol).
   - Tildar ítems comprados y reingresarlos al botiquín con nueva fecha.
   - Botón para copiar la lista formateada y enviarla por **WhatsApp**.

---

## 📸 Evidencias y Capturas de Pantalla

Podés colocar las capturas de la app dentro de la carpeta [`/evidencias`](./evidencias):

| 1. Registro de Producto | 2. Alertas 30 Días | 3. Lista de Farmacia |
| :---: | :---: | :---: |
| ![Registro](./evidencias/01-registro-producto.png) | ![Alertas](./evidencias/02-panel-alertas.png) | ![Reposición](./evidencias/03-lista-reposicion.png) |

*(Si aún no subiste tus imágenes, mirá la guía en [`evidencias/README.md`](./evidencias/README.md))*

---

## 🗂️ Estructura del Proyecto

```text
├── evidencias/                  # Carpeta para tus imágenes y capturas de prueba
│   ├── .gitkeep
│   └── README.md                # Guía de nombres y formato de imágenes
├── docs/
│   └── readmes/
│       └── README-PROMPT-1.md   # Documentación específica del Prompt 1
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Pestañas táctiles y badges de conteo
│   │   ├── ProductFormModal.tsx # Registro con atajos de fecha y validación
│   │   ├── AlertSection.tsx     # Alertas de vencidos y ≤ 30 días
│   │   ├── RestockList.tsx      # Lista de compras para farmacia y WhatsApp
│   │   ├── ProductList.tsx      # Inventario general con filtros y búsqueda
│   │   └── Toast.tsx            # Notificaciones flotantes no invasivas
│   ├── utils/
│   │   ├── dateUtils.ts         # Cálculo exacto de fechas (evitando desfase UTC y DST)
│   │   └── storage.ts           # Persistencia en localStorage sin servidor
│   ├── types.ts                 # Definición de interfaces TypeScript
│   ├── App.tsx                  # Coordinador de estados y vistas
│   └── index.css                # Estilos globales con Tailwind CSS
├── README.md                    # Este archivo
└── package.json
```

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

1. Clonar el repositorio:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd <NOMBRE_DEL_REPOSITORIO>
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador en `http://localhost:3000`.

---

## 📜 Historial de Prompts y Versiones

- [Prompt 1: Versión Funcional (Registro + Alerta 30d + Lista de Reposición)](./docs/readmes/README-PROMPT-1.md)
- [Prompt 2: Identidad Gótica, Emoji de Pastillas 💊 y Modo Oscuro](./docs/readmes/README-PROMPT-2.md)
