import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ShoppingCart, Trash2, Edit3, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { getDaysRemaining, formatDisplayDate, getExpirationBadge } from '../utils/dateUtils';

interface AlertSectionProps {
  products: Product[];
  onAddToRestock: (product: Product, reason: 'vencido' | 'por_vencer') => void;
  onDeleteProduct: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  onGoToRestock: () => void;
}

export const AlertSection: React.FC<AlertSectionProps> = ({
  products,
  onAddToRestock,
  onDeleteProduct,
  onEditProduct,
  onGoToRestock,
}) => {
  // Separamos y ordenamos por urgencia (los más vencidos primero)
  const expiredProducts = products
    .filter((p) => getDaysRemaining(p.expirationDate) <= 0)
    .sort((a, b) => getDaysRemaining(a.expirationDate) - getDaysRemaining(b.expirationDate));

  const expiringSoonProducts = products
    .filter((p) => {
      const days = getDaysRemaining(p.expirationDate);
      return days > 0 && days <= 30;
    })
    .sort((a, b) => getDaysRemaining(a.expirationDate) - getDaysRemaining(b.expirationDate));

  const totalAlerts = expiredProducts.length + expiringSoonProducts.length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Resumen Superior */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Panel de Alertas (30 días y vencidos)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisá periódicamente para que nadie en casa tome medicamentos vencidos o ineficaces.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                expiredProducts.length > 0
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              🚨 {expiredProducts.length} Vencidos
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                expiringSoonProducts.length > 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              ⚠️ {expiringSoonProducts.length} en ≤ 30 días
            </span>
          </div>
        </div>
      </div>

      {/* CASO: BOTIQUÍN 100% AL DÍA */}
      {totalAlerts === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-900">
            ¡Felicitaciones! Tu botiquín está completamente al día
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto mt-1">
            Ningún medicamento está vencido ni vence en los próximos 30 días. Todo tu stock está
            en regla para emergencias del hogar.
          </p>
        </div>
      )}

      {/* SECCIÓN 1: MEDICAMENTOS YA VENCIDOS (URGENCIA CRÍTICA) */}
      {expiredProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-sm sm:text-base text-red-950">
                🚨 Vencidos ({expiredProducts.length}) - Retirar del botiquín
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
              Riesgo para la salud
            </span>
          </div>

          <div className="space-y-2.5">
            {expiredProducts.map((prod) => {
              const badge = getExpirationBadge(prod.expirationDate);
              const days = getDaysRemaining(prod.expirationDate);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl p-3.5 sm:p-4 border-2 border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide">
                        {badge.label}
                      </span>
                      <span className="text-xs text-red-700 font-semibold">
                        {badge.subLabel} (expiró el {formatDisplayDate(prod.expirationDate)})
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 truncate">{prod.name}</h4>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        Stock restante: <strong>{prod.quantity} {prod.unit}</strong>
                      </span>
                      {prod.category && (
                        <span className="text-slate-500 hidden sm:inline">
                          Categoría: {prod.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones para vencidos */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => onAddToRestock(prod, 'vencido')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                      title="Agregar a lista de compras para reponer en farmacia"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Reponer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditProduct(prod)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Editar medicamento"
                      aria-label="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(prod.id)}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 sm:px-3 rounded-xl transition-colors cursor-pointer font-medium"
                      title="Desechar del botiquín"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desechar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: VENCEN EN LOS PRÓXIMOS 30 DÍAS */}
      {expiringSoonProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm sm:text-base text-amber-950">
                ⚠️ Vencen en los próximos 30 días ({expiringSoonProducts.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Pronto a vencer
            </span>
          </div>

          <div className="space-y-2.5">
            {expiringSoonProducts.map((prod) => {
              const badge = getExpirationBadge(prod.expirationDate);
              const days = getDaysRemaining(prod.expirationDate);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl p-3.5 sm:p-4 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide">
                        {badge.label}
                      </span>
                      <span className="text-xs text-amber-800 font-medium">
                        Vence el {formatDisplayDate(prod.expirationDate)} ({days === 1 ? 'mañana' : `en ${days} días`})
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 truncate">{prod.name}</h4>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        Stock: <strong>{prod.quantity} {prod.unit}</strong>
                      </span>
                      {prod.category && (
                        <span className="text-slate-500 hidden sm:inline">
                          Categoría: {prod.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones para por vencer */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => onAddToRestock(prod, 'por_vencer')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                      title="Agregar a lista de reposición"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Sumar a reposición</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditProduct(prod)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Editar"
                      aria-label="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Acceso directo a la lista de reposición */}
      {totalAlerts > 0 && (
        <div className="pt-2 text-center">
          <button
            onClick={onGoToRestock}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <span>Ver lista de reposición para farmacia</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
