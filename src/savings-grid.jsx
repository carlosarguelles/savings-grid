import { useState, useEffect } from "react";
import { Sun, Moon, PiggyBank, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { COUNT, formatCOP, haptic, generateCells, loadGoals, saveGoals } from './utils.js';
import { styles, cssBase } from './styles.js';
import GoalCard from './components/goal-card.jsx';
import GoalDetail from './components/goal-detail.jsx';
import CreateGoalSheet from './components/create-goal-sheet.jsx';

export default function SavingsGrid() {
  const [goals, setGoals] = useState(() => loadGoals());
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [burst, setBurst] = useState(null);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState(1_000_000);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [viewState, setViewState] = useState("idle"); // "idle" | "entering" | "active"

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

  useEffect(() => {
    document.documentElement.className = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#1A1A1A" : "#FFF8DC";
  }, [theme]);

  const activeGoal = goals.find(g => g.id === activeGoalId) ?? null;

  function updateGoal(id, updater) {
    setGoals(gs => gs.map(g => g.id === id ? updater(g) : g));
  }

  function toggleCell(goalId, cellId) {
    haptic(15);
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

  function openSheet() {
    setSheetClosing(false);
    setShowCreateForm(true);
    document.body.classList.add("sheet-open");
  }

  function closeSheet() {
    setSheetClosing(true);
    setTimeout(() => {
      setShowCreateForm(false);
      setSheetClosing(false);
      setNewName("");
      setNewTarget(1_000_000);
      document.body.classList.remove("sheet-open");
    }, 270);
  }

  function navigateTo(goalId) {
    if (goalId) {
      setViewState("entering");
      setActiveGoalId(goalId);
      requestAnimationFrame(() => requestAnimationFrame(() => setViewState("active")));
    } else {
      setViewState("entering");
      setTimeout(() => { setActiveGoalId(null); setViewState("idle"); }, 280);
    }
  }

  function createGoal() {
    const name = newName.trim();
    if (!name) return;
    haptic(30);
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
    closeSheet();
    navigateTo(goal.id);
  }

  function deleteGoal(id) {
    const goal = goals.find(g => g.id === id);
    if (window.confirm(`¿Eliminar la meta "${goal.name}"? Esta acción no se puede deshacer.`)) {
      haptic(30);
      setGoals(gs => gs.filter(g => g.id !== id));
      if (activeGoalId === id) navigateTo(null);
    }
  }

  // ─── Computed styles ─────────────────────────────────────────────────────────
  const headerStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    height: "calc(60px + env(safe-area-inset-top, 0px))",
    paddingTop: "env(safe-area-inset-top, 0px)",
    paddingLeft: 16, paddingRight: 16,
    display: "flex", alignItems: "center",
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    background: theme === "dark" ? "rgba(26,26,26,0.85)" : "rgba(255,248,220,0.9)",
    borderBottom: "1px solid var(--card-border)",
  };

  const slideStyle = {
    width: "100%",
    overflow: "hidden",
    transform: viewState === "entering" ? "translateX(100%)" : "translateX(0)",
    transition: viewState === "entering" ? "none" : viewState === "active" ? "transform 0.28s cubic-bezier(0.4,0,0.2,1)" : "none",
  };

  // ─── List content ─────────────────────────────────────────────────────────────
  const listContent = (
    <>
      {goals.length === 0 && !showCreateForm && (
        <div style={styles.emptyState}>
          <PiggyBank size={56} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={styles.emptyText}>Aún no tienes metas de ahorro.</p>
          <p style={styles.emptySubText}>¡Crea tu primera meta y empieza a ahorrar!</p>
          <button onClick={openSheet} style={styles.createBtnLarge}>
            <Plus size={18} /> Nueva meta
          </button>
        </div>
      )}

      {goals.length > 0 && (
        <div style={styles.goalGrid}>
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onOpen={navigateTo} onDelete={deleteGoal} />
          ))}
        </div>
      )}
    </>
  );

  // ─── Unified return ───────────────────────────────────────────────────────────
  return (
    <div className={theme} style={styles.root}>
      {/* Fixed app header */}
      <header style={headerStyle}>
        {activeGoal ? (
          <>
            <button onClick={() => navigateTo(null)} style={styles.backBtn}><ArrowLeft size={20} /></button>
            <div style={{ ...styles.detailTitleWrap, flex: 1 }}>
              <h1 style={styles.detailTitle}>{activeGoal.name}</h1>
              <span style={styles.detailTarget}>{formatCOP(activeGoal.target)}</span>
            </div>
            <button onClick={() => deleteGoal(activeGoal.id)} style={styles.deleteGoalBtn} title="Eliminar meta"><Trash2 size={18} /></button>
          </>
        ) : (
          <>
            <PiggyBank size={26} style={{ color: "var(--color-title)", flexShrink: 0 }} />
            <h1 style={{ ...styles.title, fontSize: 20, marginLeft: 10, flex: 1 }}>Metas de Ahorro</h1>
            <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle theme">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </>
        )}
      </header>

      {/* Sliding content */}
      <div style={slideStyle}>
        <div style={styles.container}>
          {activeGoal ? (
            <GoalDetail
              goal={activeGoal}
              burst={burst}
              onToggleCell={cellId => toggleCell(activeGoal.id, cellId)}
              onReset={() => resetAll(activeGoal.id)}
            />
          ) : listContent}
        </div>
      </div>

      {/* Fixed FAB */}
      {!activeGoal && goals.length > 0 && !showCreateForm && (
        <div style={styles.fabWrap}>
          <button onClick={openSheet} style={styles.fab}><Plus size={22} /> Nueva meta</button>
        </div>
      )}

      {/* Bottom sheet */}
      {showCreateForm && (
        <CreateGoalSheet
          closing={sheetClosing}
          newName={newName}
          newTarget={newTarget}
          onChangeName={setNewName}
          onChangeTarget={setNewTarget}
          onCreate={createGoal}
          onClose={closeSheet}
        />
      )}

      <style>{cssBase}</style>
    </div>
  );
}
