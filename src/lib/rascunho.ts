// Local backup of the technical sheet so edits survive reloads, Android tab discards and offline periods.
export type Rascunho<T> = { v: 1; ts: number; estado: T };

export const chaveRascunho = (userId: string, fichaId: string) => `renovar:ficha:${userId}:${fichaId}`;

export function lerRascunho<T>(chave: string): Rascunho<T> | null {
  try {
    const raw = window.localStorage.getItem(chave);
    if (!raw) return null;
    const r = JSON.parse(raw) as Rascunho<T>;
    return r && r.v === 1 && typeof r.ts === "number" && r.estado ? r : null;
  } catch {
    return null;
  }
}

export function gravarRascunho<T>(chave: string, estado: T, ts = Date.now()) {
  try { window.localStorage.setItem(chave, JSON.stringify({ v: 1, ts, estado } satisfies Rascunho<T>)); } catch { /* storage full or blocked */ }
}

export function apagarRascunho(chave: string) {
  try { window.localStorage.removeItem(chave); } catch { /* ignore */ }
}

// A draft only wins when it was written after the last database save.
export function rascunhoMaisNovo(r: Rascunho<unknown> | null, dbUpdatedAt: string | null | undefined) {
  if (!r) return false;
  const db = dbUpdatedAt ? Date.parse(dbUpdatedAt) : 0;
  return r.ts > (Number.isFinite(db) ? db : 0);
}
