import React from 'react';
import { Plus, ShieldAlert, AlertTriangle, ShoppingCart, Cross } from 'lucide-react';

interface HeaderProps {
  expiredCount: number;
  expiringSoonCount: number;
  restockCount: number;
  onOpenNewProduct: () => void;
  activeTab: 'inventory' | 'alerts' | 'restock';
  setActiveTab: (tab: 'inventory' | 'alerts' | 'restock') => void;
}

export const Header: React.FC<HeaderProps> = ({
  expiredCount,
  expiringSoonCount,
  restockCount,
  onOpenNewProduct,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        {/* Fila superior: Logo y Botón de Acción Principal */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm ring-4 ring-teal-50">
              <Cross className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                  Botiquín al Día
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  Hogar
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Control de vencimientos y lista de farmacia en un solo lugar
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm px-3.5 py-2.5 rounded-xl shadow-xs transition-colors active:scale-95 touch-manipulation cursor-pointer"
            aria-label="Registrar nuevo medicamento"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="font-semibold">Registrar</span>
          </button>
        </div>

        {/* Barra de pestañas y contadores rápidos optimizada para móvil */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all text-center ${
              activeTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs font-medium">1. Botiquín</span>
            <span className="text-[11px] opacity-80 font-normal">Todo el stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative ${
              activeTab === 'alerts'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : expiredCount > 0
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                : expiringSoonCount > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1 text-xs">
              {expiredCount > 0 ? (
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>2. Alertas</span>
            </div>
            <span className="text-[11px] font-bold">
              {expiredCount > 0 && `${expiredCount} vencido${expiredCount > 1 ? 's' : ''}`}
              {expiredCount > 0 && expiringSoonCount > 0 && ' · '}
              {expiringSoonCount > 0 && `${expiringSoonCount} en 30d`}
              {expiredCount === 0 && expiringSoonCount === 0 && 'Al día'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restock')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'restock'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1 text-xs">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>3. Reposición</span>
            </div>
            <span className="text-[11px] font-semibold">
              {restockCount > 0 ? `${restockCount} por comprar` : 'Lista vacía'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
