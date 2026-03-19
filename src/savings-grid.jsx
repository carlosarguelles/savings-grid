import { useState, useEffect, useRef } from "react";
import { Sun, Moon, PiggyBank, X, PartyPopper, Check, ClipboardList, Trash2, ArrowLeft, Plus } from 'lucide-react';

const formatCOP = (n) => "$" + n.toLocaleString("es-CO");

const COUNT = 176;
const STORAGE_KEY = "savings_grid_v3";

function generateCells(target) {
  const factor = target / 1_000_000;
  const STEP = Math.max(1, Math.round(500 * factor));
  const MIN = STEP;
  const MAX = Math.max(MIN + STEP, Math.round(10_000 * factor));

  let values = new Array(COUNT).fill(MIN);
  let pool = target - COUNT * MIN;
  const maxExtra = MAX - MIN;

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

  if (pool > 0) {
    for (let i = 0; i < COUNT && pool > 0; i++) {
      const canAdd = Math.floor((MAX - values[i]) / STEP) * STEP;
      const add = Math.min(canAdd, pool);
      values[i] += add;
      pool -= add;
    }
  }

  let cells = values.map((v, i) => ({ id: i, value: v, checked: false }));
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.goals) return parsed.goals;
    }
  } catch {}
  return [];
}

function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ goals }));
  } catch {}
}

export default function SavingsGrid() {
  const [goals, setGoals] = useState(() => loadGoals());
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [burst, setBurst] = useState(null);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState(1_000_000);
  const logRef = useRef(null);

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

  useEffect(() => { saveGoals(goals); }, [goals]);

  const activeGoal = goals.find(g => g.id === activeGoalId) ?? null;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [activeGoal?.log]);

  function updateGoal(id, updater) {
    setGoals(gs => gs.map(g => g.id === id ? updater(g) : g));
  }

  function toggleCell(goalId, cellId) {
    const goal = goals.find(g => g.id === goalId);
    const updated = goal.cells.map(c => c.id !== cellId ? c : { ...c, checked: !c.checked });
    const cell = updated.find(c => c.id === cellId);
    const newTotal = updated.filter(c => c.checked).reduce((s, c) => s + c.value, 0);
    const timeStr = new Date().toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    updateGoal(goalId, g => ({
      ...g,
      cells: updated,
      log: [...g.log, { type: cell.checked ? "add" : "remove", value: cell.value, total: newTotal, time: timeStr, id: crypto.randomUUID() }],
    }));
    if (cell.checked) {
      setBurst(cellId);
      setTimeout(() => setBurst(null), 700);
    }
  }

  function resetAll(goalId) {
    if (window.confirm("¿Reiniciar esta meta? Se perderá el progreso guardado.")) {
      const goal = goals.find(g => g.id === goalId);
      updateGoal(goalId, g => ({ ...g, cells: generateCells(goal.target), log: [] }));
    }
  }

  function createGoal() {
    const name = newName.trim();
    if (!name) return;
    const target = Math.max(1, Number(newTarget) || 1_000_000);
    const goal = {
      id: crypto.randomUUID(),
      name,
      target,
      cells: generateCells(target),
      log: [],
      createdAt: new Date().toISOString(),
    };
    setGoals(gs => [...gs, goal]);
    setNewName("");
    setNewTarget(1_000_000);
    setShowCreateForm(false);
    setActiveGoalId(goal.id);
  }

  function deleteGoal(id) {
    const goal = goals.find(g => g.id === id);
    if (window.confirm(`¿Eliminar la meta "${goal.name}"? Esta acción no se puede deshacer.`)) {
      setGoals(gs => gs.filter(g => g.id !== id));
      if (activeGoalId === id) setActiveGoalId(null);
    }
  }

  // ─── Detail view ───────────────────────────────────────────────────────────
  if (activeGoal) {
    const { cells, log, name, target } = activeGoal;
    const savedAmount = cells.filter(c => c.checked).reduce((s, c) => s + c.value, 0);
    const pct = Math.min((savedAmount / target) * 100, 100);
    const done = savedAmount >= target;
    const checkedCount = cells.filter(c => c.checked).length;

    return (
      <div className={theme} style={styles.root}>
        <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={styles.container}>
          {/* Detail header */}
          <header style={styles.detailHeader}>
            <button onClick={() => setActiveGoalId(null)} style={styles.backBtn}>
              <ArrowLeft size={20} />
            </button>
            <div style={styles.detailTitleWrap}>
              <h1 style={styles.detailTitle}>{name}</h1>
              <span style={styles.detailTarget}>{formatCOP(target)}</span>
            </div>
            <button onClick={() => deleteGoal(activeGoal.id)} style={styles.deleteGoalBtn} title="Eliminar meta">
              <Trash2 size={18} />
            </button>
          </header>

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
                  onClick={() => toggleCell(activeGoal.id, cell.id)}
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
              <button onClick={() => resetAll(activeGoal.id)} style={styles.resetBtn}>Reiniciar</button>
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
        </div>

        <style>{cssBase}</style>
      </div>
    );
  }

  // ─── List view ─────────────────────────────────────────────────────────────
  return (
    <div className={theme} style={styles.root}>
      <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle theme">
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div style={styles.container}>
        {/* List header */}
        <header style={styles.listHeader}>
          <span style={styles.coin}><PiggyBank size={48} /></span>
          <h1 style={styles.title}>Metas de Ahorro</h1>
        </header>

        {/* Create form */}
        {showCreateForm && (
          <div style={styles.createFormCard}>
            <h3 style={styles.createFormTitle}>Nueva meta</h3>
            <div style={styles.createFormFields}>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createGoal(); if (e.key === "Escape") setShowCreateForm(false); }}
                placeholder="Nombre de la meta (ej. Vacaciones)"
                maxLength={40}
                style={styles.formInput}
              />
              <input
                type="number"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                min={1}
                style={styles.formInput}
              />
            </div>
            <div style={styles.createFormBtns}>
              <button onClick={createGoal} style={styles.createBtn}>Crear</button>
              <button onClick={() => { setShowCreateForm(false); setNewName(""); setNewTarget(1_000_000); }} style={styles.cancelBtn}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {goals.length === 0 && !showCreateForm && (
          <div style={styles.emptyState}>
            <PiggyBank size={56} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={styles.emptyText}>Aún no tienes metas de ahorro.</p>
            <p style={styles.emptySubText}>¡Crea tu primera meta y empieza a ahorrar!</p>
            <button onClick={() => setShowCreateForm(true)} style={styles.createBtnLarge}>
              <Plus size={18} /> Nueva meta
            </button>
          </div>
        )}

        {/* Goal cards */}
        {goals.length > 0 && (
          <div style={styles.goalGrid}>
            {goals.map(goal => {
              const saved = goal.cells.filter(c => c.checked).reduce((s, c) => s + c.value, 0);
              const pct = Math.min((saved / goal.target) * 100, 100);
              return (
                <div
                  key={goal.id}
                  style={styles.goalCard}
                  onClick={() => setActiveGoalId(goal.id)}
                >
                  <div style={styles.goalCardTop}>
                    <span style={styles.goalCardName}>{goal.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
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
            })}
          </div>
        )}

        {/* FAB */}
        {goals.length > 0 && !showCreateForm && (
          <div style={styles.fabWrap}>
            <button onClick={() => setShowCreateForm(true)} style={styles.fab}>
              <Plus size={22} /> Nueva meta
            </button>
          </div>
        )}
      </div>

      <style>{cssBase}</style>
    </div>
  );
}

const cssBase = `
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
`;

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
    padding: "24px 16px 80px",
  },

  // List view
  listHeader: { textAlign: "center", marginBottom: 28 },
  coin: { fontSize: 48, display: "block", marginBottom: 6 },
  title: {
    fontSize: "clamp(26px, 7vw, 52px)",
    fontWeight: 900,
    color: "var(--color-title)",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  goalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  goalCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: 18,
    padding: "18px 18px 14px",
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  goalCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  goalCardName: {
    fontWeight: 800,
    fontSize: 17,
    color: "var(--color-text)",
    lineHeight: 1.2,
    flex: 1,
    marginRight: 8,
  },
  goalCardDelete: {
    background: "rgba(244,67,54,0.1)",
    border: "1px solid rgba(244,67,54,0.25)",
    color: "#F44336",
    borderRadius: 8,
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  goalCardProgressWrap: {
    height: 8,
    background: "var(--progress-track)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 10,
  },
  goalCardProgressBar: {
    height: "100%",
    background: "#FF6B9D",
    borderRadius: 99,
    transition: "width 0.4s ease",
    boxShadow: "0 0 8px rgba(255,107,157,0.4)",
  },
  goalCardMeta: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  goalCardSaved: { fontSize: 15, fontWeight: 700, color: "var(--color-gold)" },
  goalCardTarget: { fontSize: 13, color: "var(--color-goal)", fontWeight: 600 },
  goalCardPct: {
    marginLeft: "auto",
    fontSize: 13,
    fontWeight: 800,
    color: "var(--color-violet)",
    background: "var(--stat-bg)",
    border: "1px solid var(--stat-border)",
    borderRadius: 20,
    padding: "2px 10px",
  },

  // Create form
  createFormCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: 18,
    padding: "20px 20px 16px",
    marginBottom: 20,
  },
  createFormTitle: {
    fontWeight: 800,
    fontSize: 16,
    color: "var(--color-title)",
    marginBottom: 14,
  },
  createFormFields: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 },
  formInput: {
    background: "var(--input-bg)",
    border: "1px solid rgba(255,107,157,0.4)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--input-color)",
    fontSize: 15,
    outline: "none",
    width: "100%",
  },
  createFormBtns: { display: "flex", gap: 10 },
  createBtn: {
    background: "#FF6B9D",
    border: "1px solid #FF6B9D",
    color: "#fff",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 700,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--card-border)",
    color: "var(--color-text-muted)",
    borderRadius: 10,
    padding: "12px 20px",
    fontSize: 15,
    fontWeight: 600,
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 18, fontWeight: 700, color: "var(--color-text-dim)" },
  emptySubText: { fontSize: 14, color: "var(--color-text-faint)", marginBottom: 12 },
  createBtnLarge: {
    background: "rgba(255,107,157,0.22)",
    border: "1px solid rgba(255,107,157,0.55)",
    color: "var(--color-violet)",
    borderRadius: 14,
    padding: "14px 28px",
    fontSize: 16,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  // FAB
  fabWrap: { display: "flex", justifyContent: "center", marginTop: 8 },
  fab: {
    background: "rgba(255,107,157,0.22)",
    border: "1px solid rgba(255,107,157,0.55)",
    color: "var(--color-violet)",
    borderRadius: 99,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  // Detail view
  detailHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
    paddingTop: 4,
  },
  backBtn: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    color: "var(--color-text-dim)",
    borderRadius: 12,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  detailTitleWrap: { flex: 1, minWidth: 0 },
  detailTitle: {
    fontSize: "clamp(20px, 5vw, 32px)",
    fontWeight: 900,
    color: "var(--color-title)",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  detailTarget: { fontSize: 14, color: "var(--color-goal)", fontWeight: 600 },
  deleteGoalBtn: {
    background: "rgba(244,67,54,0.1)",
    border: "1px solid rgba(244,67,54,0.3)",
    color: "#F44336",
    borderRadius: 12,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  // Progress card (shared)
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

  // Grid
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

  // Log
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
