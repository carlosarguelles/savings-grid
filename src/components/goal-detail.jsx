import { useRef, useEffect } from 'react';
import { PartyPopper, Check, ClipboardList } from 'lucide-react';
import { COUNT, formatCOP } from '../utils.js';
import { styles } from '../styles.js';

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
      <div style={styles.progressCard}>
        <div style={styles.progressTop}>
          <div>
            <div style={styles.progressNumbers}>
              <span style={styles.savedAmount}>{formatCOP(savedAmount)}</span>
              <span style={styles.slash}> / </span>
              <span style={styles.goalAmount}>{formatCOP(target)}</span>
            </div>
            <div style={styles.remaining}>
              {done ? <><PartyPopper size={16} />¡Felicitaciones, meta alcanzada!</> : `Faltan ${formatCOP(target - savedAmount)}`}
            </div>
          </div>
          <div style={styles.statsRight}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{checkedCount}</span>
              <span style={styles.statLabel}>marcadas</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{COUNT - checkedCount}</span>
              <span style={styles.statLabel}>restantes</span>
            </div>
          </div>
        </div>
        <div style={styles.progressBarWrap}>
          <div style={{ ...styles.progressBar, width: `${pct}%`, background: done ? "#4A9B7F" : "#FF6B9D" }} />
        </div>
        <div style={styles.pctRow}>
          <span style={styles.pctLabel}>{pct.toFixed(1)}% completado</span>
        </div>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {cells.map(cell => {
          const isBurst = burst === cell.id;
          return (
            <button
              key={cell.id}
              onClick={() => onToggleCell(cell.id)}
              style={{
                ...styles.cell,
                ...(cell.checked ? styles.cellChecked : styles.cellUnchecked),
                ...(isBurst ? styles.cellBurst : {}),
              }}
              title={formatCOP(cell.value)}
            >
              {cell.checked && <span style={styles.checkmark}><Check size={20} /></span>}
              <span style={styles.cellValue}>
                {cell.value >= 1000 ? `$${(cell.value / 1000).toLocaleString("es-CO")}k` : `$${cell.value}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Log */}
      <div style={styles.logSection}>
        <div style={styles.logHeader}>
          <span style={styles.logTitle}><ClipboardList size={16} />Historial de ahorros</span>
          <button onClick={onReset} style={styles.resetBtn}>Reiniciar</button>
        </div>
        <div ref={logRef} style={styles.logScroll}>
          {log.length === 0 ? (
            <p style={styles.logEmpty}>Aún no hay registros. ¡Marca tu primer ahorro!</p>
          ) : (
            [...log].reverse().map(entry => (
              <div key={entry.id} style={styles.logEntry}>
                <div style={styles.logRow}>
                  <span style={styles.logText}>
                    {entry.type === "add" ? "Guardado" : "Desmarcado"}{" "}
                    <strong style={{ color: entry.type === "add" ? "#4A9B7F" : "#E84C7B" }}>{formatCOP(entry.value)}</strong>
                  </span>
                </div>
                <div style={styles.logMeta}>
                  <span>Acumulado: <strong style={{ color: "var(--color-violet)" }}>{formatCOP(entry.total)}</strong></span>
                  <span style={styles.logTime}>{entry.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
