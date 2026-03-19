import { Trash2 } from 'lucide-react';
import { formatCOP } from '../utils.js';
import { styles } from '../styles.js';

export default function GoalCard({ goal, onOpen, onDelete }) {
  const saved = goal.cells.filter(c => c.checked).reduce((s, c) => s + c.value, 0);
  const pct = Math.min((saved / goal.target) * 100, 100);

  return (
    <div style={styles.goalCard} onClick={() => onOpen(goal.id)}>
      <div style={styles.goalCardTop}>
        <span style={styles.goalCardName}>{goal.name}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(goal.id); }}
          style={styles.goalCardDelete}
          title="Eliminar"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div style={styles.goalCardProgressWrap}>
        <div style={{ ...styles.goalCardProgressBar, width: `${pct}%` }} />
      </div>
      <div style={styles.goalCardMeta}>
        <span style={styles.goalCardSaved}>{formatCOP(saved)}</span>
        <span style={styles.goalCardTarget}>/ {formatCOP(goal.target)}</span>
        <span style={styles.goalCardPct}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
