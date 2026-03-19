export const COUNT = 176;
export const STORAGE_KEY = "savings_grid_v3";

export const formatCOP = (n) => "$" + n.toLocaleString("es-CO");

export function haptic(ms = 15) { if (navigator.vibrate) navigator.vibrate(ms); }

export function snapToNice(raw) {
  if (raw <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  let mult;
  if (m < 1.414) mult = 1;
  else if (m < 3.162) mult = 2;
  else if (m < 7.071) mult = 5;
  else mult = 10;
  return mult * p;
}

export function generateCells(target) {
  const factor = target / 1_000_000;
  const STEP = Math.max(500, snapToNice(Math.max(1, Math.round(500 * factor))));
  const effectiveTarget = Math.floor(target / STEP) * STEP;
  const MIN = STEP;
  const MAX = Math.max(MIN + STEP, snapToNice(Math.round(10_000 * factor)));

  let values = new Array(COUNT).fill(MIN);
  let pool = effectiveTarget - COUNT * MIN;
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
    for (let i = 0; i < COUNT && pool >= STEP; i++) {
      const canAdd = Math.floor((MAX - values[i]) / STEP) * STEP;
      const add = Math.min(canAdd, Math.floor(pool / STEP) * STEP);
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

export function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.goals) return parsed.goals;
    }
  } catch {}
  return [];
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ goals }));
  } catch {}
}
