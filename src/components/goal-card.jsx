import { Trash2 } from 'lucide-react';
import { formatCOP } from '../utils.js';

export default function GoalCard({ goal, onOpen, onDelete }) {
  const saved = goal.cells.filter(c => c.checked).reduce((s, c) => s + c.value, 0);
  const pct = Math.min((saved / goal.target) * 100, 100);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-[18px_18px_14px] cursor-pointer transition-[transform,box-shadow] duration-150" onClick={() => onOpen(goal.id)}>
      <div className="flex justify-between items-start mb-3">
        <span className="font-extrabold text-[17px] text-[var(--color-text)] leading-[1.2] flex-1 mr-2">{goal.name}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(goal.id); }}
          className="bg-[rgba(244,67,54,0.1)] border border-[rgba(244,67,54,0.25)] text-[#F44336] rounded-lg p-[6px_8px] flex items-center shrink-0"
          title="Eliminar"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="h-2 bg-[var(--progress-track)] rounded-full overflow-hidden mb-[10px]">
        <div className="h-full bg-[#FF6B9D] rounded-full transition-[width] duration-[400ms] ease-out shadow-[0_0_8px_rgba(255,107,157,0.4)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-baseline gap-[6px] flex-wrap">
        <span className="text-[15px] font-bold text-[var(--color-gold)]">{formatCOP(saved)}</span>
        <span className="text-[13px] text-[var(--color-goal)] font-semibold">/ {formatCOP(goal.target)}</span>
        <span className="ml-auto text-[13px] font-extrabold text-[var(--color-violet)] bg-[var(--stat-bg)] border border-[var(--stat-border)] rounded-[20px] px-[10px] py-[2px]">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
