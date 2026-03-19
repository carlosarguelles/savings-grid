export default function CreateGoalSheet({ closing, newName, newTarget, onChangeName, onChangeTarget, onCreate, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[200] bg-black/50 ${closing ? 'animate-overlay-out' : 'animate-overlay-in'}`}
      />
      <div className={`fixed left-0 right-0 bottom-0 z-[201] bg-[var(--bg)] rounded-t-[20px] px-5 pb-safe-sheet shadow-[0_-8px_40px_rgba(0,0,0,0.35)] border border-[var(--card-border)] border-b-0 ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <div className="w-10 h-1 rounded-full bg-[rgba(255,107,157,0.3)] mx-auto mt-3 mb-5" />
        <h3 className="font-extrabold text-[16px] text-[var(--color-title)] mb-[14px]">Nueva meta</h3>
        <div className="flex flex-col gap-[10px] mb-[14px]">
          <input
            autoFocus
            value={newName}
            onChange={e => onChangeName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onCreate(); if (e.key === "Escape") onClose(); }}
            placeholder="Nombre de la meta (ej. Vacaciones)"
            maxLength={40}
            className="bg-[var(--input-bg)] border border-[rgba(255,107,157,0.4)] rounded-[10px] px-[14px] py-[10px] text-[var(--input-color)] text-[16px] outline-none w-full"
          />
          <input
            type="number"
            value={newTarget}
            onChange={e => onChangeTarget(e.target.value)}
            min={1}
            className="bg-[var(--input-bg)] border border-[rgba(255,107,157,0.4)] rounded-[10px] px-[14px] py-[10px] text-[var(--input-color)] text-[16px] outline-none w-full"
          />
        </div>
        <div className="flex gap-[10px]">
          <button onClick={onCreate} className="bg-[#FF6B9D] border border-[#FF6B9D] text-white rounded-[10px] px-6 py-3 text-[15px] font-bold">Crear</button>
          <button onClick={onClose} className="bg-transparent border border-[var(--card-border)] text-[var(--color-text-muted)] rounded-[10px] px-5 py-3 text-[15px] font-semibold">Cancelar</button>
        </div>
      </div>
    </>
  );
}
