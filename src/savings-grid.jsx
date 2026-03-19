import { useState, useEffect, useRef } from "react";
import { Sun, Moon, PiggyBank, X, Pencil, PartyPopper, Check, ClipboardList, PlusCircle, MinusCircle } from 'lucide-react';

const formatCOP = (n) => "$" + n.toLocaleString("es-CO");

const TARGET = 1_000_000;
const COUNT = 176;
const MIN = 500;
const MAX = 10_000;
const STEP = 500;
const STORAGE_KEY = "savings_grid_v2";

// Generates COUNT cells with values in [MIN..MAX] (multiples of STEP)
// that sum EXACTLY to TARGET.
// 176 * 500 = 88,000  ≤  1,000,000  ≤  176 * 10,000 = 1,760,000  ✓
function generateCells() {
  let values = new Array(COUNT).fill(MIN);
  let pool = TARGET - COUNT * MIN; // 912,000 left to distribute
  const maxExtra = MAX - MIN;      // each cell can receive up to 9,500 extra

  // Random permutation to spread the extra evenly
  const order = Array.from({ length: COUNT }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  for (const idx of order) {
    if (pool <= 0) break;
    const canAdd = Math.min(maxExtra, pool);
    const steps = Math.floor(canAdd / STEP);
    const extra = Math.floor(Math.random() * (steps + 1)) * STEP;
    values[idx] += extra;
    pool -= extra;
  }

  // Safety: if pool > 0, top up cells that haven't hit MAX
  if (pool > 0) {
    for (let i = 0; i < COUNT && pool > 0; i++) {
      const canAdd = Math.floor((MAX - values[i]) / STEP) * STEP;
      const add = Math.min(canAdd, pool);
      values[i] += add;
      pool -= add;
    }
  }

  // Build & shuffle display order
  let cells = values.map((v, i) => ({ id: i, value: v, checked: false }));
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function SavingsGrid() {
  const [cells, setCells] = useState(() => {
    const s = loadState();
    return s?.cells || generateCells();
  });
  const [log, setLog] = useState(() => {
    const s = loadState();
    return s?.log || [];
  });
  const [purpose, setPurpose] = useState(() => {
    const s = loadState();
    return s?.purpose || "";
  });
  const [editingPurpose, setEditingPurpose] = useState(false);
  const [purposeDraft, setPurposeDraft] = useState("");
  const [burst, setBurst] = useState(null);
  const logRef = useRef(null);
  const purposeInputRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  function toggleTheme() {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }

  const savedAmount = cells.filter((c) => c.checked).reduce((s, c) => s + c.value, 0);
  const pct = Math.min((savedAmount / TARGET) * 100, 100);
  const done = savedAmount >= TARGET;
  const checkedCount = cells.filter((c) => c.checked).length;

  useEffect(() => {
    saveState({ cells, log, purpose });
  }, [cells, log, purpose]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    if (editingPurpose && purposeInputRef.current) purposeInputRef.current.focus();
  }, [editingPurpose]);

  function toggleCell(id) {
    const updated = cells.map((c) => (c.id !== id ? c : { ...c, checked: !c.checked }));
    const cell = updated.find((c) => c.id === id);
    const newTotal = updated.filter((c) => c.checked).reduce((s, c) => s + c.value, 0);
    const timeStr = new Date().toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    setCells(updated);
    setLog((l) => [...l, { type: cell.checked ? "add" : "remove", value: cell.value, total: newTotal, time: timeStr, id: crypto.randomUUID() }]);
    if (cell.checked) {
      setBurst(id);
      setTimeout(() => setBurst(null), 700);
    }
  }

  function resetAll() {
    if (window.confirm("¿Reiniciar todo? Se perderá el progreso guardado.")) {
      const fresh = generateCells();
      setCells(fresh);
      setLog([]);
      saveState({ cells: fresh, log: [], purpose });
    }
  }

  function startEditPurpose() {
    setPurposeDraft(purpose);
    setEditingPurpose(true);
  }

  function savePurpose() {
    setPurpose(purposeDraft.trim());
    setEditingPurpose(false);
  }

  function handlePurposeKey(e) {
    if (e.key === "Enter") savePurpose();
    if (e.key === "Escape") setEditingPurpose(false);
  }

  return (
    <div className={theme} style={styles.root}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle theme">
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <span style={styles.coin}><PiggyBank size={48} /></span>
          <h1 style={styles.title}>Meta de Ahorro</h1>

          {/* Purpose */}
          <div style={styles.purposeWrap}>
            {editingPurpose ? (
              <div style={styles.purposeInputRow}>
                <input
                  ref={purposeInputRef}
                  value={purposeDraft}
                  onChange={(e) => setPurposeDraft(e.target.value)}
                  onKeyDown={handlePurposeKey}
                  placeholder="ej. comprar un carro nuevo…"
                  maxLength={80}
                  style={styles.purposeInput}
                />
                <button onClick={savePurpose} style={styles.purposeSaveBtn}>Guardar</button>
                <button onClick={() => setEditingPurpose(false)} style={styles.purposeCancelBtn}><X size={16} /></button>
              </div>
            ) : (
              <button onClick={startEditPurpose} style={styles.purposeDisplay}>
                {purpose ? (
                  <>
                    <span style={styles.purposeLabel}>Para: </span>
                    <span style={styles.purposeText}>{purpose}</span>
                    <span style={styles.purposeEdit}><Pencil size={14} /></span>
                  </>
                ) : (
                  <span style={styles.purposePlaceholder}>+ Añade un propósito para tu ahorro</span>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Progress card */}
        <div style={styles.progressCard}>
          <div style={styles.progressTop}>
            <div>
              <div style={styles.progressNumbers}>
                <span style={styles.savedAmount}>{formatCOP(savedAmount)}</span>
                <span style={styles.slash}> / </span>
                <span style={styles.goalAmount}>{formatCOP(TARGET)}</span>
              </div>
              <div style={styles.remaining}>
                {done ? <><PartyPopper size={16} />¡Felicitaciones, meta alcanzada!</> : `Faltan ${formatCOP(TARGET - savedAmount)}`}
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
            <div
              style={{
                ...styles.progressBar,
                width: `${pct}%`,
                background: done ? "#4A9B7F" : "#FF6B9D",
              }}
            />
          </div>
          <div style={styles.pctRow}>
            <span style={styles.pctLabel}>{pct.toFixed(1)}% completado</span>
          </div>
        </div>

        {/* Grid */}
        <div style={styles.grid}>
          {cells.map((cell) => {
            const isBurst = burst === cell.id;
            return (
              <button
                key={cell.id}
                onClick={() => toggleCell(cell.id)}
                style={{
                  ...styles.cell,
                  ...(cell.checked ? styles.cellChecked : styles.cellUnchecked),
                  ...(isBurst ? styles.cellBurst : {}),
                }}
                title={formatCOP(cell.value)}
              >
                {cell.checked && <span style={styles.checkmark}><Check size={20} /></span>}
                <span style={styles.cellValue}>
                  {cell.value >= 1000 ? `$${cell.value / 1000}k` : `$${cell.value}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Log */}
        <div style={styles.logSection}>
          <div style={styles.logHeader}>
            <span style={styles.logTitle}><ClipboardList size={16} />Historial de ahorros</span>
            <button onClick={resetAll} style={styles.resetBtn}>Reiniciar</button>
          </div>
          <div ref={logRef} style={styles.logScroll}>
            {log.length === 0 ? (
              <p style={styles.logEmpty}>Aún no hay registros. ¡Marca tu primer ahorro!</p>
            ) : (
              [...log].reverse().map((entry) => (
                <div
                  key={entry.id}
                  style={styles.logEntry}
                >
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
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; outline: none; font-family: inherit; }
        input { font-family: inherit; }
        @keyframes burst {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.25); box-shadow: 0 0 24px rgba(255,107,157,0.7); }
          65%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,107,157,0.35); border-radius: 2px; }

        :root {
          --bg: #1A1A1A;
          --color-text: #FFFAF5;
          --color-text-dim: #FFB3D9;
          --color-text-muted: #E8A0C0;
          --color-text-faint: #8A5570;
          --color-text-ghost: #5A3050;
          --color-gold: #FFA366;
          --color-violet: #FFB3D9;
          --color-slash: #E8A0C0;
          --color-goal: #7AB8A0;
          --card-bg: rgba(255,107,157,0.07);
          --card-border: rgba(255,107,157,0.18);
          --stat-bg: rgba(212,181,245,0.1);
          --stat-border: rgba(212,181,245,0.25);
          --progress-track: rgba(255,107,157,0.15);
          --cell-bg: rgba(255,107,157,0.08);
          --cell-border: rgba(255,107,157,0.22);
          --cell-color: #FFE5F0;
          --log-bg: rgba(255,107,157,0.05);
          --log-border: rgba(255,107,157,0.15);
          --log-divider: rgba(255,107,157,0.15);
          --log-entry-bg: rgba(255,107,157,0.05);
          --log-text: #FFE5F0;
          --log-meta: #E8A0C0;
          --input-bg: rgba(255,107,157,0.07);
          --input-color: #FFFAF5;
          --cancel-bg: rgba(255,255,255,0.05);
          --cancel-border: rgba(255,255,255,0.15);
          --cancel-color: #FFB3D9;
          --toggle-bg: rgba(255,107,157,0.12);
          --toggle-border: rgba(255,107,157,0.3);
          --toggle-color: #FFB3D9;
          --color-title: #FF6B9D;
        }

        .light {
          --bg: #FFF8DC;
          --color-text: #1A1A1A;
          --color-text-dim: #E84C7B;
          --color-text-muted: #FF6B9D;
          --color-text-faint: #FFB3D9;
          --color-text-ghost: #FFD0E8;
          --color-gold: #E67E3C;
          --color-violet: #E84C7B;
          --color-slash: #FFA366;
          --color-goal: #2F7A63;
          --card-bg: rgba(255,107,157,0.06);
          --card-border: rgba(255,107,157,0.2);
          --stat-bg: rgba(212,181,245,0.15);
          --stat-border: rgba(184,143,232,0.3);
          --progress-track: rgba(255,107,157,0.12);
          --cell-bg: rgba(255,107,157,0.08);
          --cell-border: rgba(255,107,157,0.25);
          --cell-color: #424242;
          --log-bg: rgba(255,248,220,0.8);
          --log-border: rgba(255,107,157,0.2);
          --log-divider: rgba(255,107,157,0.2);
          --log-entry-bg: rgba(255,107,157,0.05);
          --log-text: #1A1A1A;
          --log-meta: #757575;
          --input-bg: rgba(255,255,255,0.7);
          --input-color: #1A1A1A;
          --cancel-bg: rgba(0,0,0,0.04);
          --cancel-border: rgba(0,0,0,0.12);
          --cancel-color: #757575;
          --toggle-bg: rgba(255,107,157,0.1);
          --toggle-border: rgba(255,107,157,0.3);
          --toggle-color: #E84C7B;
          --color-title: #E84C7B;
        }

        body { background: var(--bg); }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "var(--bg)",
    fontFamily: "'Nunito', sans-serif",
    color: "var(--color-text)",
    position: "relative",
  },
  themeToggle: {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 100,
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "var(--toggle-bg)",
    border: "1px solid var(--toggle-border)",
    color: "var(--toggle-color)",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, border-color 0.2s",
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 960,
    margin: "0 auto",
    padding: "24px 16px 48px",
  },
  header: { textAlign: "center", marginBottom: 28 },
  coin: { fontSize: 48, display: "block", marginBottom: 6 },
  title: {
    fontSize: "clamp(26px, 7vw, 52px)",
    fontWeight: 900,
    color: "var(--color-title)",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: 14,
  },
  purposeWrap: { display: "flex", justifyContent: "center", marginTop: 8 },
  purposeInputRow: { display: "flex", gap: 8, alignItems: "center", width: "100%", maxWidth: 500 },
  purposeInput: {
    flex: 1,
    background: "var(--input-bg)",
    border: "1px solid rgba(255,107,157,0.4)",
    borderRadius: 10,
    padding: "8px 14px",
    color: "var(--input-color)",
    fontSize: 14,
    outline: "none",
  },
  purposeSaveBtn: {
    background: "rgba(255,107,157,0.22)",
    border: "1px solid rgba(255,107,157,0.55)",
    color: "var(--color-violet)",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 700,
  },
  purposeCancelBtn: {
    background: "var(--cancel-bg)",
    border: "1px solid var(--cancel-border)",
    color: "var(--cancel-color)",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
  },
  purposeDisplay: {
    background: "var(--card-bg)",
    border: "1px dashed var(--card-border)",
    borderRadius: 10,
    padding: "12px 22px",
    color: "var(--color-text-dim)",
    fontSize: 14,
    maxWidth: 500,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  purposeLabel: { color: "var(--color-goal)", fontStyle: "italic" },
  purposeText: { color: "var(--color-gold)", fontWeight: 700 },
  purposeEdit: { fontSize: 11 },
  purposePlaceholder: { color: "var(--color-text-faint)", fontStyle: "italic" },

  progressCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: 20,
    padding: "20px 20px 16px",
    marginBottom: 22,
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  progressNumbers: { display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  savedAmount: {
    fontSize: "clamp(22px, 4.5vw, 34px)",
    fontWeight: 700,
    color: "var(--color-gold)",
  },
  slash: { color: "var(--color-slash)", fontSize: 20 },
  goalAmount: { fontSize: 16, color: "var(--color-goal)", fontWeight: 600 },
  remaining: { fontSize: 14, color: "var(--color-text-dim)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 },
  statsRight: { display: "flex", gap: 10 },
  statBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "var(--stat-bg)",
    border: "1px solid var(--stat-border)",
    borderRadius: 12,
    padding: "12px 18px",
    minWidth: 62,
  },
  statNum: {
    fontSize: "clamp(18px, 4vw, 24px)",
    fontWeight: 700,
    color: "var(--color-violet)",
    lineHeight: 1,
  },
  statLabel: { fontSize: 12, color: "var(--color-text-muted)", marginTop: 3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 700 },
  progressBarWrap: {
    height: 12,
    background: "var(--progress-track)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 7,
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "0 0 14px rgba(255,107,157,0.5)",
  },
  pctRow: { textAlign: "right" },
  pctLabel: { fontSize: 13, color: "var(--color-text-dim)", letterSpacing: "0.05em", fontWeight: 700 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(clamp(64px, 18vw, 90px), 1fr))",
    gap: "clamp(4px, 1.5vw, 8px)",
    marginBottom: 28,
  },
  cell: {
    aspectRatio: "1 / 1",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.12s, box-shadow 0.12s",
    fontWeight: 700,
    gap: 1,
  },
  cellUnchecked: {
    background: "var(--cell-bg)",
    border: "1px solid var(--cell-border)",
    color: "var(--cell-color)",
  },
  cellChecked: {
    background: "#FF6B9D",
    border: "1px solid rgba(255,107,157,0.5)",
    color: "#fff",
    boxShadow: "0 4px 16px rgba(255,107,157,0.45)",
  },
  cellBurst: { animation: "burst 0.65s cubic-bezier(0.4,0,0.2,1)" },
  checkmark: { fontSize: 13, lineHeight: 1 },
  cellValue: { fontSize: "clamp(14px, 3.5vw, 20px)", opacity: 0.95, fontWeight: 800 },

  logSection: {
    background: "var(--log-bg)",
    border: "1px solid var(--log-border)",
    borderRadius: 18,
    overflow: "hidden",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--log-divider)",
  },
  logTitle: { fontWeight: 800, fontSize: 14, color: "var(--color-violet)", letterSpacing: "0.03em", display: "inline-flex", alignItems: "center", gap: 5 },
  resetBtn: {
    background: "rgba(244,67,54,0.1)",
    border: "1px solid rgba(244,67,54,0.3)",
    color: "#F44336",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 700,
  },
  logScroll: {
    maxHeight: 280,
    overflowY: "auto",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  logEmpty: { color: "var(--color-text-ghost)", fontSize: 13, textAlign: "center", padding: "20px 0", fontWeight: 600 },
  logEntry: {
    background: "var(--log-entry-bg)",
    borderRadius: 9,
    padding: "12px 14px",
    animation: "fadeUp 0.2s ease",
  },
  logRow: { display: "flex", alignItems: "center", gap: 7, marginBottom: 3 },
  logText: { fontSize: 14, color: "var(--log-text)", fontWeight: 600 },
  logMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "var(--log-meta)",
    flexWrap: "wrap",
    gap: 4,
    fontWeight: 600,
  },
  logTime: { fontStyle: "italic" },
};
