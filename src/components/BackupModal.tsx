import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2, Database, AlertTriangle, CheckCircle2, ShieldCheck, HardDrive } from 'lucide-react';
import { Product, RestockItem } from '../types';
import { downloadBackupFile, parseAndValidateBackup } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  restockItems: RestockItem[];
  onRestore: (products: Product[], restockItems: RestockItem[]) => void;
  onClearAll: () => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  products,
  restockItems,
  onRestore,
  onClearAll,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    downloadBackupFile(products, restockItems);
    onShowToast('¡Archivo de respaldo .json descargado con éxito! 💾', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseAndValidateBackup(content);
      if (result.success && result.data) {
        onRestore(result.data.products, result.data.restockItems);
        onShowToast(result.message, 'success');
        onClose();
      } else {
        onShowToast(result.message, 'warning');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-1.5">
                <span>Respaldo y Datos Locales</span>
                <span>💾</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guardado seguro sin servidores ni conexión externa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {/* Tarjeta de estado de datos guardados */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100 font-bold">
              <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Estado actual del almacenamiento local</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block">Medicamentos:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  💊 {products.length} productos
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block">Lista reposición:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  🛒 {restockItems.length} ítems
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción principales */}
          <div className="space-y-2.5">
            {/* 1. Exportar a JSON */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm">Exportar datos a archivo JSON (.json)</div>
                  <div className="text-[11px] opacity-80 font-normal">Descarga un respaldo en tu dispositivo</div>
                </div>
              </div>
              <span className="text-xs bg-teal-800 px-2 py-1 rounded-md">Descargar</span>
            </button>

            {/* 2. Importar desde JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm">Restaurar desde archivo de respaldo</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Cargar un JSON previamente exportado</div>
                </div>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">Subir archivo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Sección de Borrado de Datos */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!isConfirmingClear ? (
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="w-full py-2.5 px-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar todos los datos y reiniciar botiquín</span>
              </button>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-2">
                <p className="text-xs text-red-700 dark:text-red-400 font-bold">
                  ¿Seguro que querés vaciar todo el botiquín y la lista de reposición?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearAll();
                      setIsConfirmingClear(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Sí, borrar todo
                  </button>
                  <button
                    onClick={() => setIsConfirmingClear(false)}
                    className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
