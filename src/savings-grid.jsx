import { useState, useEffect, useRef } from "react";

const formatCOP = (n) => "$" + n.toLocaleString("es-CO") + " COP";

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
    setCells((prev) => {
      const updated = prev.map((c) => (c.id !== id ? c : { ...c, checked: !c.checked }));
      const cell = updated.find((c) => c.id === id);
      const newTotal = updated.filter((c) => c.checked).reduce((s, c) => s + c.value, 0);
      const timeStr = new Date().toLocaleString("es-CO", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      if (cell.checked) {
        setLog((l) => [...l, { type: "add", value: cell.value, total: newTotal, time: timeStr, id: Date.now() }]);
        setBurst(id);
        setTimeout(() => setBurst(null), 700);
      } else {
        setLog((l) => [...l, { type: "remove", value: cell.value, total: newTotal, time: timeStr, id: Date.now() }]);
      }
      return updated;
    });
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
    <div style={styles.root}>
      <div style={styles.bgGlow} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <span style={styles.coin}>🪙</span>
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
                <button onClick={() => setEditingPurpose(false)} style={styles.purposeCancelBtn}>✕</button>
              </div>
            ) : (
              <button onClick={startEditPurpose} style={styles.purposeDisplay}>
                {purpose ? (
                  <>
                    <span style={styles.purposeLabel}>Para: </span>
                    <span style={styles.purposeText}>{purpose}</span>
                    <span style={styles.purposeEdit}> ✏️</span>
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
                {done ? "🎊 ¡Felicitaciones, meta alcanzada!" : `Faltan ${formatCOP(TARGET - savedAmount)}`}
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
                background: done
                  ? "linear-gradient(90deg,#f59e0b,#10b981)"
                  : "linear-gradient(90deg,#c97d2e,#f0c060)",
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
                {cell.checked && <span style={styles.checkmark}>✓</span>}
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
            <span style={styles.logTitle}>📋 Historial de ahorros</span>
            <button onClick={resetAll} style={styles.resetBtn}>Reiniciar</button>
          </div>
          <div ref={logRef} style={styles.logScroll}>
            {log.length === 0 ? (
              <p style={styles.logEmpty}>Aún no hay registros. ¡Marca tu primer ahorro!</p>
            ) : (
              [...log].reverse().map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    ...styles.logEntry,
                    borderLeft: `3px solid ${entry.type === "add" ? "#e6a94a" : "#555"}`,
                  }}
                >
                  <div style={styles.logRow}>
                    <span>{entry.type === "add" ? "✅" : "↩️"}</span>
                    <span style={styles.logText}>
                      {entry.type === "add" ? "Guardado" : "Desmarcado"}{" "}
                      <strong style={{ color: "#e6c87a" }}>{formatCOP(entry.value)}</strong>
                    </span>
                  </div>
                  <div style={styles.logMeta}>
                    <span>Acumulado: <strong>{formatCOP(entry.total)}</strong></span>
                    <span style={styles.logTime}>{entry.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; outline: none; font-family: inherit; }
        input { font-family: inherit; }
        @keyframes burst {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.22); }
          65%  { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(230,169,74,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#141009",
    fontFamily: "'DM Sans', sans-serif",
    color: "#f0e6d0",
    position: "relative",
  },
  bgGlow: {
    position: "fixed",
    inset: 0,
    background: `
      radial-gradient(ellipse at 15% 0%, rgba(201,125,46,0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 90%, rgba(180,130,30,0.14) 0%, transparent 50%)
    `,
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 960,
    margin: "0 auto",
    padding: "32px 16px 56px",
  },
  header: { textAlign: "center", marginBottom: 24 },
  coin: { fontSize: 36, display: "block", marginBottom: 4 },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(26px, 5vw, 40px)",
    fontWeight: 900,
    color: "#e6a94a",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: 12,
  },
  purposeWrap: { display: "flex", justifyContent: "center", marginTop: 8 },
  purposeInputRow: { display: "flex", gap: 8, alignItems: "center", width: "100%", maxWidth: 500 },
  purposeInput: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(230,169,74,0.4)",
    borderRadius: 10,
    padding: "8px 14px",
    color: "#f0e6d0",
    fontSize: 14,
    outline: "none",
  },
  purposeSaveBtn: {
    background: "rgba(230,169,74,0.18)",
    border: "1px solid rgba(230,169,74,0.45)",
    color: "#e6a94a",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
  },
  purposeCancelBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#777",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 13,
  },
  purposeDisplay: {
    background: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(230,169,74,0.28)",
    borderRadius: 10,
    padding: "7px 18px",
    color: "#a08060",
    fontSize: 13,
    maxWidth: 500,
    width: "100%",
    textAlign: "center",
  },
  purposeLabel: { color: "#7a6040", fontStyle: "italic" },
  purposeText: { color: "#e6c87a", fontWeight: 600 },
  purposeEdit: { fontSize: 11 },
  purposePlaceholder: { color: "#4a3820", fontStyle: "italic" },

  progressCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(230,169,74,0.16)",
    borderRadius: 18,
    padding: "20px 24px 14px",
    marginBottom: 22,
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  progressNumbers: { display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  savedAmount: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(20px, 4vw, 30px)",
    fontWeight: 700,
    color: "#e6a94a",
  },
  slash: { color: "#3a2810", fontSize: 20 },
  goalAmount: { fontSize: 15, color: "#6a5030", fontWeight: 500 },
  remaining: { fontSize: 13, color: "#8a7050" },
  statsRight: { display: "flex", gap: 10 },
  statBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: "8px 14px",
    minWidth: 58,
  },
  statNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 700,
    color: "#c49040",
    lineHeight: 1,
  },
  statLabel: { fontSize: 9, color: "#5a4020", marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" },
  progressBarWrap: {
    height: 9,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "0 0 10px rgba(230,169,74,0.4)",
  },
  pctRow: { textAlign: "right" },
  pctLabel: { fontSize: 11, color: "#7a6040", letterSpacing: "0.04em" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(78px, 1fr))",
    gap: 5,
    marginBottom: 26,
  },
  cell: {
    aspectRatio: "1 / 1",
    borderRadius: 9,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.12s, box-shadow 0.12s",
    fontWeight: 600,
    gap: 1,
  },
  cellUnchecked: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(230,169,74,0.12)",
    color: "#7a6040",
  },
  cellChecked: {
    background: "linear-gradient(135deg, #6b4010 0%, #c07828 100%)",
    border: "1px solid rgba(230,169,74,0.5)",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(160,90,10,0.45)",
  },
  cellBurst: { animation: "burst 0.65s cubic-bezier(0.4,0,0.2,1)" },
  checkmark: { fontSize: 13, lineHeight: 1 },
  cellValue: { fontSize: 13, opacity: 0.9, fontWeight: 700 },

  logSection: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  logTitle: { fontWeight: 600, fontSize: 13, color: "#b09050" },
  resetBtn: {
    background: "rgba(255,60,40,0.09)",
    border: "1px solid rgba(255,60,40,0.25)",
    color: "#ff6650",
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 600,
  },
  logScroll: {
    maxHeight: 280,
    overflowY: "auto",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  logEmpty: { color: "#3a2c18", fontSize: 13, textAlign: "center", padding: "20px 0" },
  logEntry: {
    background: "rgba(255,255,255,0.025)",
    borderRadius: 8,
    padding: "8px 12px",
    animation: "fadeUp 0.2s ease",
  },
  logRow: { display: "flex", alignItems: "center", gap: 7, marginBottom: 3 },
  logText: { fontSize: 12, color: "#a08050" },
  logMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#4a3820",
    flexWrap: "wrap",
    gap: 4,
  },
  logTime: { fontStyle: "italic" },
};
