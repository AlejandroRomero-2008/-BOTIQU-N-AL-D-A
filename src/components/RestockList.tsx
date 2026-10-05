import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Trash2, Copy, CheckCheck, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { RestockItem } from '../types';

interface RestockListProps {
  items: RestockItem[];
  onTogglePurchased: (id: string) => void;
  onAddItem: (name: string, quantityNeeded: string, reason: 'manual') => void;
  onDeleteItem: (id: string) => void;
  onClearPurchased: () => void;
  onReenterToInventory: (item: RestockItem) => void;
}

export const RestockList: React.FC<RestockListProps> = ({
  items,
  onTogglePurchased,
  onAddItem,
  onDeleteItem,
  onClearPurchased,
  onReenterToInventory,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1 caja');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setError('Por favor escribí el nombre del producto (no puede estar vacío).');
      return;
    }
    if (trimmed.length > 100) {
      setError('El nombre no puede superar los 100 caracteres.');
      return;
    }
    onAddItem(trimmed, newItemQty.trim().slice(0, 30) || '1 unidad', 'manual');
    setNewItemName('');
    setNewItemQty('1 caja');
    setError(null);
  };

  /**
   * Copia la lista de compras formateada lista para enviar por WhatsApp o SMS
   */
  const handleCopyForWhatsApp = () => {
    const pendingItems = items.filter((i) => !i.isPurchased);
    if (pendingItems.length === 0) return;

    const lines = [
      '🏥 *BOTIQUÍN AL DÍA - Lista de Farmacia:*',
      '',
      ...pendingItems.map((item, idx) => {
        const reasonTag = item.reason === 'vencido' ? ' (está vencido)' : item.reason === 'por_vencer' ? ' (vence pronto)' : '';
        return `${idx + 1}. ${item.name} - Cant: ${item.quantityNeeded}${reasonTag}`;
      }),
      '',
      'Generado con Botiquín al Día'
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback si el navegador restringe clipboard
      alert('Copia no soportada en este entorno');
    });
  };

  const pending = items.filter((i) => !i.isPurchased);
  const purchased = items.filter((i) => i.isPurchased);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Encabezado y Acción de Copiar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>💊</span> Lista de Reposición (Farmacia)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lo que necesitás comprar para tener el botiquín completo y seguro.
            </p>
          </div>

          {pending.length > 0 && (
            <button
              type="button"
              onClick={handleCopyForWhatsApp}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado para WhatsApp!' : 'Copiar para WhatsApp'}</span>
            </button>
          )}
        </div>

        {/* Input rápido para agregar producto manual */}
        <form onSubmit={handleManualAdd} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              maxLength={100}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="¿Qué necesitás reponer? Ej: Alcohol, Gasas, Paracetamol 💊..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <input
              type="text"
              maxLength={30}
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder="Cant: 1 caja"
              className="w-full sm:w-32 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{error}</p>}
        </form>
      </div>

      {/* LISTADO DE PENDIENTES POR COMPRAR */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Por comprar ({pending.length})
          </h3>
          {pending.length > 0 && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Tildá los que ya compraste
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
              🛒
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No hay medicamentos pendientes por reponer
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Podés sumar medicamentos 💊 manualmente o desde las alertas de vencimiento.
            </p>
          </div>
        ) : (
          pending.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onTogglePurchased(item.id)}
                  className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-600 dark:hover:border-emerald-400 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Marcar como comprado"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                      <span>💊</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">
                      {item.quantityNeeded}
                    </span>
                    {item.reason === 'vencido' && (
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 px-1.5 py-0.5 rounded-md">
                        Reemplazo por vencido
                      </span>
                    )}
                    {item.reason === 'por_vencer' && (
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 px-1.5 py-0.5 rounded-md">
                        Vence pronto
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Quitar de la lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* LISTADO DE COMPRADOS */}
      {purchased.length > 0 && (
        <div className="space-y-2.5 pt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ya comprados ({purchased.length})
            </h3>
            <button
              type="button"
              onClick={onClearPurchased}
              className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer font-medium"
            >
              Limpiar comprados
            </button>
          </div>

          {purchased.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onTogglePurchased(item.id)}
                  className="w-6 h-6 rounded-lg bg-emerald-600 border-2 border-emerald-600 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Desmarcar comprado"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="min-w-0 flex-1">
                  <span className="line-through font-medium text-sm text-slate-600 dark:text-slate-400 block truncate">
                    💊 {item.name} ({item.quantityNeeded})
                  </span>
                </div>
              </div>

              {/* Botón rápido para reingresar al botiquín con nueva fecha */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onReenterToInventory(item)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-950/80 border border-teal-200 dark:border-teal-800/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Cargar al botiquín con nueva fecha de vencimiento"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Cargar al botiquín</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
