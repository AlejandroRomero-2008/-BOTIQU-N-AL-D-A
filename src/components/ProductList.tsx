import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Pill, ShoppingCart, Edit3, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { getDaysRemaining, formatDisplayDate, getExpirationBadge } from '../utils/dateUtils';

interface ProductListProps {
  products: Product[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddToRestock: (product: Product, reason: 'vencido' | 'por_vencer' | 'agotado') => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onAddToRestock,
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
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre (ej: Paracetamol, Gasas...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50 focus:bg-white placeholder:text-slate-400"
          />
        </div>

        {/* Chips de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todos ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
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
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            ⚠️ En ≤ 30 días ({counts.expiringSoon})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('good')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'good'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            ✅ Vigentes ({counts.good})
          </button>
        </div>

        {/* Selector de ordenamiento */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>{filteredProducts.length} productos listados</span>
          <div className="flex items-center gap-1.5">
            <span>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="expiration">Vencimiento más próximo</option>
              <option value="name">Nombre (A-Z)</option>
              <option value="quantity">Mayor cantidad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tarjetas de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No se encontraron medicamentos</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Probá cambiando los filtros o la palabra buscada.'
              : 'Todavía no registraste productos en tu botiquín.'}
          </p>
          <button
            type="button"
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar primer medicamento</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const badge = getExpirationBadge(product.expirationDate);
            const days = getDaysRemaining(product.expirationDate);

            // Colores y bordes según urgencia
            let cardBorder = 'border-slate-200 hover:border-slate-300';
            let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-200';

            if (badge.status === 'expired') {
              cardBorder = 'border-red-300 bg-red-50/20';
              badgeStyle = 'bg-red-600 text-white';
            } else if (badge.status === 'expiring_soon') {
              cardBorder = 'border-amber-300 bg-amber-50/20';
              badgeStyle = 'bg-amber-500 text-white';
            } else {
              badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            }

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl p-4 border ${cardBorder} shadow-xs transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  {/* Información Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${badgeStyle}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDisplayDate(product.expirationDate)}
                      </span>
                      {product.category && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {product.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {product.name}
                    </h3>

                    {/* Cantidad y Notas */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        Cantidad: {product.quantity} {product.unit}
                      </span>
                      {product.notes && (
                        <span className="text-slate-500 italic truncate max-w-xs">
                          {product.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de la tarjeta */}
                  <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Botón rápido para sumar a reposición */}
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
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200"
                      title="Sumar a la lista de reposición para farmacia"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reponer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Editar medicamento"
                      aria-label="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
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
