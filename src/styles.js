export const cssBase = `
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
  @keyframes slideUp   { from { transform: translateY(100%) } to { transform: translateY(0) } }
  @keyframes slideDown { from { transform: translateY(0) } to { transform: translateY(100%) } }
  @keyframes overlayIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes overlayOut { from { opacity: 1 } to { opacity: 0 } }
  body.sheet-open { overflow: hidden; touch-action: none; }
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

  html, body { background: var(--bg); }
`;

export const styles = {
  root: {
    minHeight: "100vh",
    background: "var(--bg)",
    fontFamily: "'Nunito', sans-serif",
    color: "var(--color-text)",
    position: "relative",
    overflowX: "hidden",
  },
  themeToggle: {
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
    maxWidth: 960,
    margin: "0 auto",
    padding: "calc(60px + env(safe-area-inset-top, 0px) + 20px) 16px calc(env(safe-area-inset-bottom, 0px) + 96px)",
  },

  // List view
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
    fontSize: 16,
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
  fabWrap: {
    position: "fixed",
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
    left: 0, right: 0, zIndex: 50,
    display: "flex", justifyContent: "center",
    pointerEvents: "none",
  },
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
    pointerEvents: "auto",
  },

  // Detail view
  backBtn: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    color: "var(--color-text-dim)",
    borderRadius: 12,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginRight: 12,
  },
  detailTitleWrap: { flex: 1, minWidth: 0 },
  detailTitle: {
    fontSize: "clamp(16px, 4vw, 24px)",
    fontWeight: 900,
    color: "var(--color-title)",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  detailTarget: { fontSize: 13, color: "var(--color-goal)", fontWeight: 600 },
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
