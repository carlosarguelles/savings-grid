import { styles } from '../styles.js';

export default function CreateGoalSheet({ closing, newName, newTarget, onChangeName, onChangeTarget, onCreate, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.5)",
        animation: `${closing ? "overlayOut" : "overlayIn"} 0.27s ease forwards`,
      }} />
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201,
        background: "var(--bg)", borderRadius: "20px 20px 0 0",
        padding: "0 20px calc(env(safe-area-inset-bottom, 0px) + 28px)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
        border: "1px solid var(--card-border)", borderBottom: "none",
        animation: `${closing ? "slideDown" : "slideUp"} 0.27s ease forwards`,
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,107,157,0.3)", margin: "12px auto 20px" }} />
        <h3 style={styles.createFormTitle}>Nueva meta</h3>
        <div style={styles.createFormFields}>
          <input
            autoFocus
            value={newName}
            onChange={e => onChangeName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onCreate(); if (e.key === "Escape") onClose(); }}
            placeholder="Nombre de la meta (ej. Vacaciones)"
            maxLength={40}
            style={styles.formInput}
          />
          <input
            type="number"
            value={newTarget}
            onChange={e => onChangeTarget(e.target.value)}
            min={1}
            style={styles.formInput}
          />
        </div>
        <div style={styles.createFormBtns}>
          <button onClick={onCreate} style={styles.createBtn}>Crear</button>
          <button onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
        </div>
      </div>
    </>
  );
}
