// Practice tracking. localStorage only, every access wrapped: a private window or blocked storage
// just means nothing is remembered, never a broken page.

const KEY = "bench-progress-v1";

export interface Record {
  attempts: number;
  /** null until the first check; then whether the first check was right */
  firstTry: boolean | null;
  /** highest hint number she opened (0–3) before solving */
  hints: number;
  solved: boolean;
  sawSolution: boolean;
  updated: number;
}
export type Store = { [key: string]: Record };

/** One record per exercise version: "cml-p5-1-5" (original), "cml-p5-1-5~1", "cml-p5-1-5~2" (new numbers). */
export const keyOf = (id: string, version: number) => (version === 0 ? id : `${id}~${version}`);
export const idOf = (key: string) => key.split("~")[0];

export function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function save(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
  try {
    window.dispatchEvent(new Event("bench-progress"));
  } catch {}
}

const blank = (): Record => ({ attempts: 0, firstTry: null, hints: 0, solved: false, sawSolution: false, updated: Date.now() });

export function recordAttempt(key: string, correct: boolean) {
  const s = load();
  const r = s[key] ?? blank();
  if (r.solved) return r; // re-checking a solved problem doesn't change the score
  r.attempts += 1;
  // copying the shown solution isn't a first-try success
  if (r.firstTry === null) r.firstTry = correct && !r.sawSolution;
  if (correct) r.solved = true;
  r.updated = Date.now();
  s[key] = r;
  save(s);
  return r;
}

export function recordHint(key: string, n: number) {
  const s = load();
  const r = s[key] ?? blank();
  if (r.solved) return r;
  r.hints = Math.max(r.hints, n);
  r.updated = Date.now();
  s[key] = r;
  save(s);
  return r;
}

export function recordSolutionShown(key: string) {
  const s = load();
  const r = s[key] ?? blank();
  r.sawSolution = true;
  r.updated = Date.now();
  s[key] = r;
  save(s);
}

/** Replace everything saved (used when restoring from a progress link). */
export function replaceAll(store: Store) {
  save(store);
}

// What she typed, per exercise version, and which version she had open. Kept apart from the
// progress records so a half-typed answer never counts as an attempt.
const DRAFTS = "bench-drafts-v1";
const VERSIONS = "bench-versions-v1";
export interface Draft { inputs: string[]; checked: boolean }
function readMap<T>(k: string): { [key: string]: T } {
  try {
    const v = JSON.parse(localStorage.getItem(k) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
function writeEntry<T>(k: string, key: string, value: T) {
  try {
    const m = readMap<T>(k);
    m[key] = value;
    localStorage.setItem(k, JSON.stringify(m));
  } catch {}
}
export const loadDraft = (key: string): Draft | null => readMap<Draft>(DRAFTS)[key] ?? null;
export const saveDraft = (key: string, d: Draft) => writeEntry(DRAFTS, key, d);
export const loadVersion = (id: string): number => {
  const v = readMap<number>(VERSIONS)[id];
  return v === 1 || v === 2 ? v : 0;
};
export const saveVersion = (id: string, v: number) => writeEntry(VERSIONS, id, v);

export function resetAll() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(DRAFTS);
    localStorage.removeItem(VERSIONS);
  } catch {}
  save({});
}

/**
 * Credit for one try, 0–1, kept deliberately simple so the Progress page can explain it in a line:
 *   right first time, no hints .............. 1
 *   right first time after hints ............ 0.75
 *   right after more than one check ......... 0.5
 *   not solved yet (or solved only after seeing the solution) ... 0
 */
export function creditOf(r: Record): number {
  if (!r.solved || (r.sawSolution && r.firstTry === false)) return 0;
  if (r.firstTry && r.hints === 0) return 1;
  if (r.firstTry) return 0.75;
  return 0.5;
}
