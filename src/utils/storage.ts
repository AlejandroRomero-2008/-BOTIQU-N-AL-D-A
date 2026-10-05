/**
 * Manejo de persistencia local (localStorage) sin base de datos en servidor.
 * 
 * ⚠️ ADVERTENCIA SOBRE ERRORES FRECUENTES:
 * 1. window.localStorage puede fallar en navegación privada (Safari iOS) o si la cuota está llena.
 *    Siempre envolver getItem y setItem en bloques try/catch.
 * 2. Si el usuario borra datos o si el JSON está corrupto, JSON.parse lanzará una excepción
 *    que rompería la app completa si no se atrapa adecuadamente.
 */

import { Product, RestockItem } from '../types';

const PRODUCTS_STORAGE_KEY = 'botiquin_al_dia_productos_v1';
const RESTOCK_STORAGE_KEY = 'botiquin_al_dia_reposicion_v1';

/**
 * Genera fechas relativas a la fecha real de hoy para que las muestras
 * siempre reflejen los 3 estados (vencido, por vencer en 30 días, y vigentes).
 */
function createRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INITIAL_SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-sample-1',
    name: 'Paracetamol 500 mg',
    quantity: 6,
    unit: 'comprimidos',
    expirationDate: createRelativeDate(-12), // Venció hace 12 días
    category: 'Analgésicos y antifebriles',
    notes: 'Para fiebre leve o dolor de cabeza',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-sample-2',
    name: 'Ibuprofeno 400 mg',
    quantity: 10,
    unit: 'cápsulas',
    expirationDate: createRelativeDate(14), // Vence en 14 días (alerta < 30 días)
    category: 'Analgésicos y antifebriles',
    notes: 'Tomar con alimentos',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-sample-3',
    name: 'Gotas oftálmicas lubricantes',
    quantity: 1,
    unit: 'frasco',
    expirationDate: createRelativeDate(25), // Vence en 25 días
    category: 'Ojos y oídos',
    notes: 'Desechar a los 30 días de abierto',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-sample-4',
    name: 'Alcohol en gel 70%',
    quantity: 1,
    unit: 'frasco 250ml',
    expirationDate: createRelativeDate(320), // Vigente
    category: 'Primeros auxilios',
    notes: 'Desinfección de manos',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-sample-5',
    name: 'Vendas elásticas y gasas',
    quantity: 4,
    unit: 'paquetes',
    expirationDate: createRelativeDate(450), // Vigente
    category: 'Primeros auxilios',
    notes: 'Esterilizadas',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SAMPLE_RESTOCK: RestockItem[] = [
  {
    id: 'restock-sample-1',
    name: 'Paracetamol 500 mg',
    quantityNeeded: '1 caja (16 comprimidos)',
    reason: 'vencido',
    isPurchased: false,
    originalProductId: 'prod-sample-1',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'restock-sample-2',
    name: 'Termómetro digital',
    quantityNeeded: '1 unidad',
    reason: 'manual',
    isPurchased: false,
    addedAt: new Date().toISOString(),
  }
];

export function getSavedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      // Primera vez que entra: cargar datos demostrativos para que vea el valor inmediatamente
      saveProducts(INITIAL_SAMPLE_PRODUCTS);
      return INITIAL_SAMPLE_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_PRODUCTS;
  } catch (error) {
    console.error('Error al leer productos de localStorage:', error);
    return INITIAL_SAMPLE_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error al guardar productos en localStorage:', error);
  }
}

export function getSavedRestockItems(): RestockItem[] {
  try {
    const raw = localStorage.getItem(RESTOCK_STORAGE_KEY);
    if (!raw) {
      saveRestockItems(INITIAL_SAMPLE_RESTOCK);
      return INITIAL_SAMPLE_RESTOCK;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_RESTOCK;
  } catch (error) {
    console.error('Error al leer lista de reposición de localStorage:', error);
    return INITIAL_SAMPLE_RESTOCK;
  }
}

export function saveRestockItems(items: RestockItem[]): void {
  try {
    localStorage.setItem(RESTOCK_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error al guardar lista de reposición en localStorage:', error);
  }
}

export interface BackupData {
  appName: string;
  version: string;
  exportedAt: string;
  products: Product[];
  restockItems: RestockItem[];
}

/**
 * 3. EXPORTAR DATOS A UN ARCHIVO JSON DE RESPALDO
 */
export function exportBackupData(products: Product[], restockItems: RestockItem[]): BackupData {
  return {
    appName: 'Botiquín al Día 💊',
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    products,
    restockItems,
  };
}

/**
 * Descarga el archivo JSON en la computadora o celular del usuario.
 */
export function downloadBackupFile(products: Product[], restockItems: RestockItem[]): void {
  const data = exportBackupData(products, restockItems);
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `botiquin-respaldo-${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * IMPORTAR RESPALDO DESDE ARCHIVO JSON
 * Valida la estructura para evitar inyectar datos corruptos.
 */
export function parseAndValidateBackup(jsonString: string): {
  success: boolean;
  message: string;
  data?: { products: Product[]; restockItems: RestockItem[] };
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'El archivo no contiene un JSON válido.' };
    }

    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.restockItems)) {
      return { success: false, message: 'El archivo no tiene el formato de respaldo de Botiquín al Día.' };
    }

    return {
      success: true,
      message: `Se importaron ${parsed.products.length} medicamentos y ${parsed.restockItems.length} ítems de reposición.`,
      data: {
        products: parsed.products,
        restockItems: parsed.restockItems,
      },
    };
  } catch (error) {
    return { success: false, message: 'Error de sintaxis al leer el archivo JSON.' };
  }
}

/**
 * BORRAR TODOS LOS DATOS (Limpieza de almacenamiento)
 */
export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(RESTOCK_STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
  }
}

