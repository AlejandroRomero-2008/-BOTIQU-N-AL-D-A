import React, { useState, useEffect } from 'react';
import { X, Calendar, Pill, Tag, FileText, Check } from 'lucide-react';
import { Product } from '../types';
import { getTodayIsoString } from '../utils/dateUtils';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => void;
  initialProduct?: Product | null;
}

const COMMON_UNITS = [
  'comprimidos',
  'cápsulas',
  'sobres',
  'ml',
  'frasco',
  'gotas',
  'tubo / crema',
  'unidades',
  'parches',
];

const COMMON_CATEGORIES = [
  'Analgésicos y antifebriles',
  'Primeros auxilios',
  'Gastrointestinal y digestivo',
  'Antialérgico y respiratorio',
  'Cremas y antisépticos',
  'Ojos y oídos',
  'Uso crónico / Diario',
  'Otros',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | string>(10);
  const [unit, setUnit] = useState('comprimidos');
  const [expirationDate, setExpirationDate] = useState('');
  const [category, setCategory] = useState(COMMON_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sincronizar campos cuando se abre en modo edición o creación
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setQuantity(initialProduct.quantity);
      setUnit(initialProduct.unit || 'comprimidos');
      setExpirationDate(initialProduct.expirationDate);
      setCategory(initialProduct.category || COMMON_CATEGORIES[0]);
      setNotes(initialProduct.notes || '');
    } else {
      setName('');
      setQuantity(10);
      setUnit('comprimidos');
      setExpirationDate('');
      setCategory(COMMON_CATEGORIES[0]);
      setNotes('');
    }
    setError(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  /**
   * ⚠️ ATENCIÓN: Helper para calcular fechas rápidas (+6 meses, +1 año, etc.)
   * ERROR FRECUENTE: Usar d.setMonth(d.getMonth() + 6) sin formatear en horario local
   * puede generar fechas en días inexistentes (ej. 31 de abril pasa a mayo) o alterar
   * la fecha por desfase UTC.
   */
  const handleQuickDateAdd = (monthsToAdd: number) => {
    const target = new Date();
    // Normalizamos al día 1 antes de cambiar el mes para evitar desbordamiento en meses de 28/30 días
    const currentDay = target.getDate();
    target.setMonth(target.getMonth() + monthsToAdd);
    // Si el mes destino no tiene tantos días, se ajusta al último día del mes
    if (target.getDate() < currentDay) {
      target.setDate(0);
    }
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    setExpirationDate(`${year}-${month}-${day}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación de nombre
    if (!name.trim()) {
      setError('Por favor ingresá el nombre del medicamento o producto.');
      return;
    }

    // ⚠️ ATENCIÓN: Parseo de cantidad numérica
    // ERROR FRECUENTE: Tratar el input como string o aceptar 0/negativos sin validar
    const parsedQty = typeof quantity === 'number' ? quantity : parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('La cantidad debe ser un número mayor a cero.');
      return;
    }

    // ⚠️ ATENCIÓN: Validación estricta de fecha YYYY-MM-DD
    // ERROR FRECUENTE: Guardar un string vacío o mal formado provoca que
    // los cálculos de días restantes devuelvan NaN y rompan la interfaz.
    if (!expirationDate || !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
      setError('Por favor seleccioná una fecha de vencimiento válida (Año, Mes y Día).');
      return;
    }

    onSave({
      id: initialProduct?.id,
      name: name.trim(),
      quantity: parsedQty,
      unit: unit.trim() || 'unidades',
      expirationDate,
      category,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center text-lg">
              💊
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-1.5">
                <span>{initialProduct ? 'Editar Medicamento' : 'Registrar en Botiquín'}</span>
                <span>💊</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guardá la cantidad y el vencimiento para recibir alertas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Campo 1: Nombre del producto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del medicamento o elemento 💊 *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ibuprofeno 400 mg, Gasas, Paracetamol..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Campo 2: Cantidad y Unidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cantidad disponible *
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unidad de medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} className="dark:bg-slate-800">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campo 3: Fecha de Vencimiento */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Fecha de Vencimiento (Expira) *
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Mirar dorso del blíster 💊
              </span>
            </div>

            <input
              type="date"
              required
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
            />

            {/* Accesos rápidos para sumar meses comunes de vencimiento */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block mb-1">
                Atajos rápidos desde hoy:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDateAdd(1)}
                  className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                >
                  +1 mes (30d)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDateAdd(6)}
                  className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                >
                  +6 meses
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDateAdd(12)}
                  className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                >
                  +1 año
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDateAdd(24)}
                  className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                >
                  +2 años
                </button>
              </div>
            </div>
          </div>

          {/* Campo 4: Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Campo 5: Notas u observaciones (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observaciones (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Dosis de los niños, abierto en cocina, etc."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialProduct ? 'Guardar Cambios' : 'Registrar en Botiquín 💊'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
