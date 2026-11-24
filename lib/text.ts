import { type Frac, money as moneyF, q, show } from "./frac";

/** "3/4", "2 1/2", "7" — mixed numbers for display */
export const n = (f: Frac) => show(f, { mixed: true });
/** terminating decimals as decimals ("0.75"), others as mixed fractions */
export const d = (f: Frac) => show(f, { mixed: true, dec: true });
/** "$1,440.00" (exact cents or it throws) */
export const usd = (f: Frac) => moneyF(f);
/** "1 plum" / "3 plums" */
export const plural = (v: number, one: string, many = one + "s") => `${v} ${v === 1 ? one : many}`;
export const times = (r: number) => (r === 2 ? "twice" : r === 3 ? "three times" : `${r} times`);
/** stacked fraction markup for prompts: [[3/4]] */
export const fr = (f: Frac) => (f.d === 1n ? String(f.n) : `[[${f.n}/${f.d}]]`);
export const num = (x: number | string) => q(x as any);
