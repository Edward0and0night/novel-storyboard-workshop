import type { Shot } from "./types";

export const HISTORY_KEY = "storyboard-history";
const LIMIT = 5;

export type HistoryEntry = { at: number; preview: string; shots: Shot[] };

export function saveHistory(chapter: string, shots: Shot[]): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    const entry: HistoryEntry = { at: Date.now(), preview: chapter.trim().slice(0, 40), shots };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...list].slice(0, LIMIT)));
  } catch {
    // localStorage 不可用或已满时忽略，不影响主流程
  }
}
