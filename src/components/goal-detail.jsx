import { useRef, useEffect } from 'react';
import { PartyPopper, Check, ClipboardList } from 'lucide-react';
import { COUNT, formatCOP } from '../utils.js';

export default function GoalDetail({ goal, burst, onToggleCell, onReset }) {
  const { cells, log, target } = goal;
  const logRef = useRef(null);

  const savedAmount = cells.filter(c => c.checked).reduce((s, c) => s + c.value, 0);
  const pct = Math.min((savedAmount / target) * 100, 100);
  const done = savedAmount >= target;
  const checkedCount = cells.filter(c => c.checked).length;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  return (
    <>
      {/* Progress card */}
      <div className="mb-[22px]">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
          <div>
            <div className="flex items-baseline flex-wrap gap-1 mb-1">
              <span className="text-[clamp(22px,4.5vw,34px)] font-bold text-[var(--color-gold)]">{formatCOP(savedAmount)}</span>
              <span className="text-[var(--color-slash)] text-[20px]"> / </span>
              <span className="text-[16px] text-[var(--color-goal)] font-semibold">{formatCOP(target)}</span>
            </div>
            <div className="text-[14px] text-[var(--color-text-dim)] font-medium flex items-center gap-1">
              {done ? <><PartyPopper size={16} />¡Felicitaciones, meta alcanzada!</> : `Faltan ${formatCOP(target - savedAmount)}`}
            </div>
          </div>
          <div className="flex gap-[10px]">
            <div className="flex flex-col items-center p-[12px_18px] min-w-[62px]">
              <span className="text-[clamp(18px,4vw,24px)] font-bold text-[var(--color-violet)] leading-none">{checkedCount}</span>
              <span className="text-[12px] text-[var(--color-text-muted)] mt-[3px] tracking-[0.07em] uppercase font-bold">marcadas</span>
            </div>
            <div className="flex flex-col items-center p-[12px_18px] min-w-[62px]">
              <span className="text-[clamp(18px,4vw,24px)] font-bold text-[var(--color-violet)] leading-none">{COUNT - checkedCount}</span>
              <span className="text-[12px] text-[var(--color-text-muted)] mt-[3px] tracking-[0.07em] uppercase font-bold">restantes</span>
            </div>
          </div>
        </div>
        <div className="h-3 bg-[var(--progress-track)] rounded-full overflow-hidden mb-[7px]">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_14px_rgba(255,107,157,0.5)] ${done ? 'bg-[#4A9B7F]' : 'bg-[#FF6B9D]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-right">
          <span className="text-[13px] text-[var(--color-text-dim)] tracking-[0.05em] font-bold">{pct.toFixed(1)}% completado</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(64px,18vw,90px),1fr))] gap-[clamp(4px,1.5vw,8px)] mb-7">
        {cells.map(cell => {
          const isBurst = burst === cell.id;
          const checkedClasses = "bg-[#FF6B9D] border border-[rgba(255,107,157,0.5)] text-white shadow-[0_4px_16px_rgba(255,107,157,0.45)]";
          const uncheckedClasses = "bg-[var(--cell-bg)] border border-[var(--cell-border)] text-[var(--cell-color)]";
          return (
            <button
              key={cell.id}
              onClick={() => onToggleCell(cell.id)}
              className={`aspect-square rounded-[10px] flex flex-col items-center justify-center transition-[transform,box-shadow] duration-[120ms] font-bold gap-[1px] ${cell.checked ? checkedClasses : uncheckedClasses} ${isBurst ? 'animate-burst' : ''}`}
              title={formatCOP(cell.value)}
            >
              {cell.checked && <span className="text-[13px] leading-none"><Check size={20} /></span>}
              <span className="text-[clamp(14px,3.5vw,20px)] opacity-95 font-extrabold">
                {cell.value >= 1000 ? `$${(cell.value / 1000).toLocaleString("es-CO")}k` : `$${cell.value}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Log */}
      <div className="bg-[var(--log-bg)] border border-[var(--log-border)] rounded-[18px] overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--log-divider)]">
          <span className="font-extrabold text-[14px] text-[var(--color-violet)] tracking-[0.03em] inline-flex items-center gap-[5px]"><ClipboardList size={16} />Historial de ahorros</span>
          <button onClick={onReset} className="bg-[rgba(244,67,54,0.1)] border border-[rgba(244,67,54,0.3)] text-[#F44336] rounded-lg px-[18px] py-[10px] text-[14px] font-bold">Reiniciar</button>
        </div>
        <div ref={logRef} className="max-h-[280px] overflow-y-auto p-[10px_14px] flex flex-col gap-[6px]">
          {log.length === 0 ? (
            <p className="text-[var(--color-text-ghost)] text-[13px] text-center py-5 font-semibold">Aún no hay registros. ¡Marca tu primer ahorro!</p>
          ) : (
            [...log].reverse().map(entry => (
              <div key={entry.id} className="bg-[var(--log-entry-bg)] rounded-[9px] p-[12px_14px] animate-fade-up">
                <div className="flex items-center gap-[7px] mb-[3px]">
                  <span className="text-[14px] text-[var(--log-text)] font-semibold">
                    {entry.type === "add" ? "Guardado" : "Desmarcado"}{" "}
                    <strong style={{ color: entry.type === "add" ? "#4A9B7F" : "#E84C7B" }}>{formatCOP(entry.value)}</strong>
                  </span>
                </div>
                <div className="flex justify-between text-[12px] text-[var(--log-meta)] flex-wrap gap-1 font-semibold">
                  <span>Acumulado: <strong style={{ color: "var(--color-violet)" }}>{formatCOP(entry.total)}</strong></span>
                  <span className="italic">{entry.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
