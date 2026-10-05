import React from 'react';
import { Plus, ShieldAlert, AlertTriangle, ShoppingCart, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  expiredCount: number;
  expiringSoonCount: number;
  restockCount: number;
  onOpenNewProduct: () => void;
  activeTab: 'inventory' | 'alerts' | 'restock';
  setActiveTab: (tab: 'inventory' | 'alerts' | 'restock') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  expiredCount,
  expiringSoonCount,
  restockCount,
  onOpenNewProduct,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        {/* Fila superior: Logo con letra gótica y emoji de pastillas 💊, Botón Modo Oscuro y Registrar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-700 flex items-center justify-center text-xl shadow-sm ring-4 ring-teal-50 dark:ring-teal-950/40">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-gothic text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-wide leading-tight">
                  Botiquín al Día 💊
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full">
                  Hogar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Control de vencimientos y lista de farmacia en un solo lugar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Switch Modo Oscuro */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar modo oscuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium text-sm px-3.5 py-2 rounded-xl shadow-xs transition-colors active:scale-95 touch-manipulation cursor-pointer"
              aria-label="Registrar nuevo medicamento"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="font-semibold">Registrar</span>
            </button>
          </div>
        </div>

        {/* Barra de pestañas y contadores rápidos optimizada para móvil */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-medium flex items-center gap-1">
              <span>💊</span> 1. Botiquín
            </span>
            <span className="text-[11px] opacity-80 font-normal">Todo el stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : expiredCount > 0
                ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60'
                : expiringSoonCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
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
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'restock'
                ? 'bg-emerald-700 dark:bg-emerald-800 text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
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

