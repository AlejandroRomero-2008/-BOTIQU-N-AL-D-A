/**
 * Definiciones de tipos para Botiquín al Día
 */

export type ProductStatus = 'expired' | 'expiring_soon' | 'good';

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string; // ej: comprimidos, ml, unidades, sobres
  expirationDate: string; // Formato estricto YYYY-MM-DD
  category: string; // ej: Analgésicos, Primeros Auxilios, etc.
  notes?: string;
  createdAt: string;
}

export type RestockReason = 'vencido' | 'agotado' | 'por_vencer' | 'manual';

export interface RestockItem {
  id: string;
  name: string;
  quantityNeeded: string; // ej: "1 caja", "20 comprimidos"
  reason: RestockReason;
  isPurchased: boolean;
  originalProductId?: string; // Si proviene de un producto ya registrado
  addedAt: string;
}
