import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Pill, ShoppingCart, Edit3, Trash2, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { getDaysRemaining, formatDisplayDate, getExpirationBadge } from '../utils/dateUtils';

interface ProductListProps {
  products: Product[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddToRestock: (product: Product, reason: 'vencido' | 'por_vencer' | 'agotado') => void;
  onConsultAi?: (medicationName: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onAddToRestock,
  onConsultAi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [sortBy, setSortBy] = useState<'expiration' | 'name' | 'quantity'>('expiration');

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Filtro por término de búsqueda (nombre, categoría o notas)
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term) ||
          product.notes?.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        // Filtro por estado
        if (statusFilter === 'all') return true;

        const days = getDaysRemaining(product.expirationDate);
        if (statusFilter === 'expired') return days <= 0;
        if (statusFilter === 'expiring_soon') return days > 0 && days <= 30;
        if (statusFilter === 'good') return days > 30;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiration') {
          // ⚠️ ATENCIÓN: Ordenar por días restantes reales
          return getDaysRemaining(a.expirationDate) - getDaysRemaining(b.expirationDate);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        }
        if (sortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        return 0;
      });
  }, [products, searchTerm, statusFilter, sortBy]);

  // Contadores para las pestañas de filtro
  const counts = useMemo(() => {
    let expired = 0;
    let expiringSoon = 0;
    let good = 0;

    products.forEach((p) => {
      const days = getDaysRemaining(p.expirationDate);
      if (days <= 0) expired++;
      else if (days <= 30) expiringSoon++;
      else good++;
    });

    return { all: products.length, expired, expiringSoon, good };
  }, [products]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o pastilla 💊 (ej: Paracetamol, Ibuprofeno...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Chips de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            💊 Todos ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60'
            }`}
          >
            🚨 Vencidos ({counts.expired})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expiring_soon')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'expiring_soon'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
            }`}
          >
            ⚠️ En ≤ 30 días ({counts.expiringSoon})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('good')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'good'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            ✅ Vigentes ({counts.good})
          </button>
        </div>

        {/* Selector de ordenamiento */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{filteredProducts.length} medicamentos listados</span>
          <div className="flex items-center gap-1.5">
            <span>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="expiration" className="dark:bg-slate-800">Vencimiento más próximo</option>
              <option value="name" className="dark:bg-slate-800">Nombre (A-Z)</option>
              <option value="quantity" className="dark:bg-slate-800">Mayor cantidad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tarjetas de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
            💊
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">No se encontraron medicamentos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Probá cambiando los filtros o la palabra buscada.'
              : 'Todavía no registraste medicamentos en tu botiquín.'}
          </p>
          <button
            type="button"
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar primer medicamento 💊</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const badge = getExpirationBadge(product.expirationDate);

            let cardBorder = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';
            let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';

            if (badge.status === 'expired') {
              cardBorder = 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20';
              badgeStyle = 'bg-red-600 text-white';
            } else if (badge.status === 'expiring_soon') {
              cardBorder = 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20';
              badgeStyle = 'bg-amber-500 text-white';
            } else {
              badgeStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60';
            }

            return (
              <div
                key={product.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border ${cardBorder} shadow-xs transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${badgeStyle}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDisplayDate(product.expirationDate)}
                      </span>
                      {product.category && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {product.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug flex items-center gap-1.5">
                      <span>💊</span>
                      <span className="truncate">{product.name}</span>
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Cantidad: {product.quantity} {product.unit}
                      </span>
                      {product.notes && (
                        <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-xs">
                          {product.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    {onConsultAi && (
                      <button
                        type="button"
                        onClick={() => onConsultAi(product.name)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        title="Consultar ficha farmacológica estructurada con IA"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="hidden sm:inline">Info IA</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onAddToRestock(
                          product,
                          badge.status === 'expired'
                            ? 'vencido'
                            : badge.status === 'expiring_soon'
                            ? 'por_vencer'
                            : 'agotado'
                        )
                      }
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      title="Sumar a la lista de reposición para farmacia"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Reponer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Editar medicamento"
                      aria-label="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar del botiquín"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
