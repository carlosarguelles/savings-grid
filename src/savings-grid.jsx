import { useState, useEffect } from "react";
import { Sun, Moon, PiggyBank, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { COUNT, formatCOP, haptic, generateCells, loadGoals, saveGoals } from './utils.js';
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

  // ─── List content ─────────────────────────────────────────────────────────────
  const listContent = (
    <>
      {goals.length === 0 && !showCreateForm && (
        <div className="text-center py-[60px] px-5 flex flex-col items-center gap-2">
          <PiggyBank size={56} className="opacity-30 mb-4" />
          <p className="text-[18px] font-bold text-[var(--color-text-dim)]">Aún no tienes metas de ahorro.</p>
          <p className="text-[14px] text-[var(--color-text-faint)] mb-3">¡Crea tu primera meta y empieza a ahorrar!</p>
          <button onClick={openSheet} className="bg-[rgba(255,107,157,0.22)] border border-[rgba(255,107,157,0.55)] text-[var(--color-violet)] rounded-2xl px-7 py-3.5 text-[16px] font-bold flex items-center gap-2 mt-2">
            <Plus size={18} /> Nueva meta
          </button>
        </div>
      )}

      {goals.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 mb-6">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onOpen={navigateTo} onDelete={deleteGoal} />
          ))}
        </div>
      )}
    </>
  );

  // ─── Unified return ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)] font-nunito text-[var(--color-text)] relative overflow-x-hidden">
      {/* Fixed app header */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-safe-header pt-safe-header px-4 flex items-center backdrop-blur-[14px] bg-[var(--header-bg)] border-b border-[var(--card-border)]">
        {activeGoal ? (
          <>
            <button onClick={() => navigateTo(null)} className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--color-text-dim)] rounded-xl p-[10px_12px] flex items-center shrink-0 mr-3"><ArrowLeft size={20} /></button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[clamp(16px,4vw,24px)] font-black text-[var(--color-title)] leading-[1.15] whitespace-nowrap overflow-hidden text-ellipsis">{activeGoal.name}</h1>
              <span className="text-[13px] text-[var(--color-goal)] font-semibold">{formatCOP(activeGoal.target)}</span>
            </div>
            <button onClick={() => deleteGoal(activeGoal.id)} className="bg-[rgba(244,67,54,0.1)] border border-[rgba(244,67,54,0.3)] text-[#F44336] rounded-xl p-[10px_12px] flex items-center shrink-0" title="Eliminar meta"><Trash2 size={18} /></button>
          </>
        ) : (
          <>
            <PiggyBank size={26} className="text-[var(--color-title)] shrink-0" />
            <h1 className="text-[20px] ml-[10px] flex-1 font-black text-[var(--color-title)] tracking-[-0.02em] leading-[1.1]">Metas de Ahorro</h1>
            <button onClick={toggleTheme} className="w-12 h-12 rounded-full bg-[var(--toggle-bg)] border border-[var(--toggle-border)] text-[var(--toggle-color)] text-[18px] flex items-center justify-center transition-[background,border-color] duration-200" title="Toggle theme">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </>
        )}
      </header>

      {/* Sliding content */}
      <div data-view-state={viewState} className="w-full overflow-hidden">
        <div className="max-w-[960px] mx-auto pt-safe-top px-4 pb-safe-fab">
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
        <div className="fixed bottom-safe-fab left-0 right-0 z-50 flex justify-center pointer-events-none">
          <button onClick={openSheet} className="bg-[rgba(255,107,157,0.22)] border border-[rgba(255,107,157,0.55)] text-[var(--color-violet)] rounded-full px-7 py-3.5 text-[15px] font-bold flex items-center gap-2 pointer-events-auto"><Plus size={22} /> Nueva meta</button>
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
    </div>
  );
}
