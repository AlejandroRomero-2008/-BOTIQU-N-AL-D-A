import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ShieldAlert, CheckCircle2, Pill, Clock, Thermometer, Info, RefreshCw } from 'lucide-react';

export interface MedicationInfoData {
  nombreComercial: string;
  principioActivo: string;
  categoria: string;
  accionTerapeutica: string;
  dosisRecomendadaAdultos: string;
  advertenciasYContraindicaciones: string[];
  recomendacionAlmacenamiento: string;
  requiereReceta: boolean;
  nivelUrgencia: string;
}

interface AiConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMedicationName?: string;
}

export const AiConsultModal: React.FC<AiConsultModalProps> = ({
  isOpen,
  onClose,
  defaultMedicationName = '',
}) => {
  const [query, setQuery] = useState(defaultMedicationName || 'Ibuprofeno 400 mg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MedicationInfoData | null>(null);
  const [dataSource, setDataSource] = useState<'gemini-api' | 'mock' | null>(null);

  if (!isOpen) return null;

  const fetchMedicationInfo = async (useMock = false) => {
    if (!query.trim() && !useMock) {
      setError('Por favor ingresá el nombre de un medicamento.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/medication-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationName: query.trim(),
          useMock,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fallo en la respuesta de la IA.');
      }

      if (result.data) {
        setData(result.data);
        setDataSource(result.source || 'gemini-api');
      } else {
        throw new Error('El formato JSON devuelto por la IA está incompleto.');
      }
    } catch (err: any) {
      console.error('Error al consultar IA:', err);
      setError(err.message || 'Error de conexión con el servicio de IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-1.5">
                <span>Consultor Farmacológico IA</span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                  Salida Estructurada
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Información médica oficial parseada en datos individuales
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

        {/* Buscador y opciones */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Paracetamol, Ibuprofeno, Amoxicilina..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
            <button
              onClick={() => fetchMedicationInfo(false)}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Consultar IA</span>
                </>
              )}
            </button>
          </div>

          {/* Botón de prueba sin gastar llamadas (Mock data) */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              ¿Sin cuota o probando en local?
            </span>
            <button
              type="button"
              onClick={() => fetchMedicationInfo(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              ⚡ Usar respuesta de prueba (Mock)
            </button>
          </div>
        </div>

        {/* Contenido / Datos Estructurados */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Estado de error / fallo */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Error en el servicio de IA</span>
              </div>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => fetchMedicationInfo(true)}
                className="mt-1 inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 text-red-800 dark:text-red-300 px-3 py-1.5 rounded-lg font-semibold"
              >
                Cargar datos de prueba de emergencia
              </button>
            </div>
          )}

          {/* Estado vacío inicial */}
          {!data && !loading && !error && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-2xl">
                💊
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Consultá cualquier medicamento
              </p>
              <p className="text-xs max-w-sm mx-auto mt-1">
                La IA devolverá campos discretos validados por esquema (principio activo, dosis,
                advertencias y conservación).
              </p>
            </div>
          )}

          {/* 2. RENDERIZACIÓN COMO DATOS DISCRETOS (NO COMO PÁRRAFO) */}
          {data && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Badges de Estado Rápido */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  📂 {data.categoria}
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    data.requiereReceta
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                  }`}
                >
                  {data.requiereReceta ? '📋 Venta Bajo Receta' : '✅ Venta Libre'}
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    data.nivelUrgencia === 'Alta'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/60'
                      : data.nivelUrgencia === 'Media'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                      : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/60'
                  }`}
                >
                  🚨 Urgencia: {data.nivelUrgencia}
                </span>

                {dataSource === 'mock' && (
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ml-auto">
                    Modo Mock (Sin API Key)
                  </span>
                )}
              </div>

              {/* Grilla de Métricas y Datos Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Principio Activo
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {data.principioActivo}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Acción Terapéutica
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {data.accionTerapeutica}
                  </span>
                </div>
              </div>

              {/* Dosis recomendada en tarjeta dedicada */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Dosis Habitual Orientativa (Adultos)</span>
                </div>
                <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium leading-relaxed">
                  {data.dosisRecomendadaAdultos}
                </p>
              </div>

              {/* Almacenamiento en botiquín */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Conservación en el Botiquín</span>
                </span>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {data.recomendacionAlmacenamiento}
                </p>
              </div>

              {/* Lista estructurada de Advertencias (array) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Advertencias y Contraindicaciones ({data.advertenciasYContraindicaciones.length})</span>
                </span>

                <div className="space-y-1.5">
                  {data.advertenciasYContraindicaciones.map((adv, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 p-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2"
                    >
                      <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">⚠️</span>
                      <span className="leading-snug">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer de seguridad */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
                * Información orientativa generada por IA. No reemplaza la consulta con un médico o farmacéutico matriculado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
