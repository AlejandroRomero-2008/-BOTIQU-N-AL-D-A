/**
 * Utilidades para manejo de fechas y cálculo de vencimientos.
 * 
 * ⚠️ ADVERTENCIA SOBRE ERRORES FRECUENTES EN JAVASCRIPT:
 * 1. 'new Date("YYYY-MM-DD")' se interpreta como fecha UTC medianoche.
 *    En países con huso horario negativo (como Argentina UTC-3 o México UTC-6),
 *    mostrar esa fecha con .toLocaleDateString() resta 1 día (muestra el día anterior).
 * 2. Calcular días restantes sin resetear horas, minutos y segundos de la fecha actual
 *    produce resultados decimales o falsos vencimientos por diferencia horaria.
 * 3. Cambios de hora (DST): Usar Math.round en lugar de Math.floor al dividir por 86400000
 *    evita desfases cuando un día tiene 23 o 25 horas.
 */

import { ProductStatus } from '../types';

/**
 * Convierte un string "YYYY-MM-DD" en un objeto Date en el horario local del usuario,
 * fijando la hora a las 00:00:00 exactas para evitar desfases de huso horario.
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();

  // ERROR FRECUENTE: Hacer `new Date("2026-10-31")` crea la fecha en UTC.
  // Al consultarla en horario local (ej. UTC-3), se convierte en "2026-10-30 21:00", perdiendo un día.
  // SOLUCIÓN: Descomponer año, mes y día de forma explícita.
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return new Date(dateString);
  }

  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1; // En JavaScript los meses van de 0 a 11
  const day = parseInt(parts[2], 10);

  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

/**
 * Devuelve la fecha de hoy normalizada a las 00:00:00 locales.
 */
export function getTodayMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Calcula la cantidad exacta de días calendario que faltan para el vencimiento.
 * - Negativo: ya venció (ej: -5 = venció hace 5 días).
 * - 0: vence hoy.
 * - Positivo: días restantes (ej: 12 = vence en 12 días).
 */
export function getDaysRemaining(expirationDateStr: string): number {
  const expDate = parseLocalDate(expirationDateStr);
  const today = getTodayMidnight();

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = expDate.getTime() - today.getTime();

  // ERROR FRECUENTE: Usar Math.floor() falla en días de cambio de horario (DST)
  // donde un día dura 23 o 25 horas. Math.round() absorbe esa diferencia limpiamente.
  return Math.round(diffTime / msPerDay);
}

/**
 * Determina el estado del producto:
 * - 'expired': Venció hoy o antes (días <= 0).
 * - 'expiring_soon': Vence en 30 días o menos (1 <= días <= 30).
 * - 'good': Vence en más de 30 días.
 */
export function getProductStatus(expirationDateStr: string): ProductStatus {
  const days = getDaysRemaining(expirationDateStr);
  if (days <= 0) {
    return 'expired';
  }
  if (days <= 30) {
    return 'expiring_soon';
  }
  return 'good';
}

/**
 * Formatea una fecha YYYY-MM-DD para mostrarla en español de forma amigable (ej: "15 oct. 2026")
 */
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return 'Sin fecha';
  const date = parseLocalDate(dateString);

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Devuelve un texto explicativo con el estado del vencimiento.
 */
export function getExpirationBadge(expirationDateStr: string): {
  label: string;
  subLabel: string;
  status: ProductStatus;
  urgencyLevel: 'high' | 'medium' | 'low';
} {
  const days = getDaysRemaining(expirationDateStr);

  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      label: 'VENCIDO',
      subLabel: absDays === 1 ? 'Venció ayer' : `Venció hace ${absDays} días`,
      status: 'expired',
      urgencyLevel: 'high',
    };
  }

  if (days === 0) {
    return {
      label: 'VENCE HOY',
      subLabel: 'Desechar o no consumir hoy',
      status: 'expired',
      urgencyLevel: 'high',
    };
  }

  if (days === 1) {
    return {
      label: 'VENCE MAÑANA',
      subLabel: 'Queda solo 1 día',
      status: 'expiring_soon',
      urgencyLevel: 'medium',
    };
  }

  if (days <= 30) {
    return {
      label: `VENCE EN ${days} DÍAS`,
      subLabel: days <= 7 ? 'Próxima semana' : 'Dentro de los 30 días',
      status: 'expiring_soon',
      urgencyLevel: 'medium',
    };
  }

  return {
    label: 'EN BUEN ESTADO',
    subLabel: `Vence en ${days} días`,
    status: 'good',
    urgencyLevel: 'low',
  };
}

/**
 * Obtiene la fecha actual en formato ISO "YYYY-MM-DD" local (útil para el min/default de <input type="date">)
 */
export function getTodayIsoString(): string {
  const today = new Date();
  const year = today.getFullYear();
  // ERROR FRECUENTE: Usar today.toISOString().split('T')[0] retorna la fecha UTC,
  // por lo que si son las 21hs en Argentina ya te da la fecha de mañana.
  // SOLUCIÓN: Usar métodos locales getFullYear(), getMonth() y getDate().
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
