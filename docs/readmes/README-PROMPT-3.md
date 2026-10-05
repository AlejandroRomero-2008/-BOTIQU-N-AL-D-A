# 📋 Documentación de Prompt 3: Persistencia de Datos, Respaldo JSON y Explicación Técnica

**Fecha de implementación:** Octubre 2026  
**Objetivo del Prompt:** Garantizar que los datos de **Botiquín al Día 💊** no se pierdan al cerrar la app o recargar la página, implementar el sistema de respaldo JSON (exportar/importar/borrar) y documentar detalladamente el comportamiento técnico del almacenamiento.

---

## 🧠 Respuestas Técnicas al Usuario

### 1. ¿Dónde queda guardada la información exactamente?
La información queda almacenada dentro del **`localStorage` del navegador web** en el disco de tu dispositivo (celular o computadora).
- **En Android (Chrome):** Se guarda en `/data/data/com.android.chrome/app_chrome/Default/Local Storage/leveldb/`.
- **En iPhone / iPad (Safari):** Se guarda en el contenedor privado del navegador en el almacenamiento flash de iOS.
- **En Windows / Mac / Linux (Chrome/Edge/Firefox):** En la carpeta de perfil de usuario dentro de `AppData` o `Application Support`.

> 💡 **Claves utilizadas en este proyecto:**
> - `'botiquin_al_dia_productos_v1'`: Array JSON con todos los medicamentos, dosis y fechas de expiración.
> - `'botiquin_al_dia_reposicion_v1'`: Array JSON con los ítems pendientes por comprar en la farmacia.
> - `'botiquin_dark_mode'`: Estado del tema oscuro (`'true'` o `'false'`).

---

### 2. ¿Qué pasa si el usuario borra el caché o cambia de dispositivo?
- **Si solo borra "Archivos e imágenes en caché":**  
  ¡Los datos **NO** se borran! El caché guarda imágenes y scripts para que cargue más rápido. Los datos del botiquín residen en `localStorage` (Storage persistente), por lo que permanecen intactos.
- **Si el usuario presiona "Borrar datos de sitios y cookies":**  
  Ahí **SÍ** se borra el `localStorage`. Por esta razón implementamos la función de **Exportar Respaldo JSON**.
- **Si el usuario cambia de dispositivo (ej. pasa de la PC al celular):**  
  Como no hay base de datos en la nube centralizada todavía, la información reside localmente en cada dispositivo. Para moverla, simplemente presiona **"Exportar datos a JSON"** en la PC y luego presiona **"Restaurar desde archivo"** en el celular.

---

### 3. Cómo exportar e importar datos a un archivo
En la barra superior de la app, haz clic en el nuevo botón con forma de disco/base de datos (**💾**):
1. **Para exportar:** Presiona **"Exportar datos a archivo JSON (.json)"**. Se descargará un archivo como `botiquin-respaldo-2026-10-05.json`.
2. **Para restaurar:** Presiona **"Restaurar desde archivo de respaldo"**, selecciona tu archivo `.json` y el botiquín se repondrá inmediatamente sin recargar.
3. **Para reiniciar:** Si quieres vaciar todo para empezar de cero, tienes el botón **"Borrar todos los datos y reiniciar botiquín"**.

---

## 💻 Código Fuente: Guardar, Leer y Borrar

```typescript
// Clave de almacenamiento
const STORAGE_KEY = 'botiquin_al_dia_productos_v1';

// 1. GUARDAR (Save)
export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error al guardar en disco local:', error);
  }
}

// 2. LEER (Read)
export function getSavedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer de disco local:', error);
    return [];
  }
}

// 3. BORRAR (Clear)
export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar datos:', error);
  }
}
```

---

## 💊 Dato de Ejemplo ya Cargado para Probar

```json
{
  "id": "prod-sample-ibu",
  "name": "Ibuprofeno 400 mg",
  "quantity": 10,
  "unit": "cápsulas",
  "expirationDate": "2026-10-19",
  "category": "Analgésicos y antifebriles",
  "notes": "Tomar con alimentos",
  "createdAt": "2026-10-05T12:00:00.000Z"
}
```
*(Este dato vence en 14 días y activa de inmediato la alerta amarilla de 30 días).*
