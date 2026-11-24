import { type Frac, add, cmp, eq, frac, mul, show, sub } from "./frac";
import { evalExpr, parseExpr, parseNumber, tidy, varsOf } from "./parse";

// ---------------------------------------------------------------------------------------------
// Answer specs. One field per box she types into (or one choice group).

export type Field =
  | { kind: "number"; label?: string; unit?: string; value: Frac; within?: Frac; simplest?: boolean; prefix?: string }
  | { kind: "choice"; label?: string; options: string[]; correct: number }
  | { kind: "expr"; label?: string; value: string; vars?: string[] }
  | { kind: "ineq"; label?: string; variable: string; op: "<" | "<=" | ">" | ">="; value: Frac }
  | { kind: "point"; label?: string; x: Frac; y: Frac; /** other points that are also correct */ alts?: [Frac, Frac][] }
  | { kind: "ftin"; label?: string; inches: Frac };

export interface AnswerSpec {
  fields: Field[];
  /** If set, the number fields can be typed in any order (e.g. "the two numbers are ___ and ___"). */
  anyOrder?: boolean;
}

export type FieldResult = { ok: boolean; note?: string; blank?: boolean; unreadable?: boolean };
export interface CheckResult {
  ok: boolean;
  fields: FieldResult[];
  /** gentle notes shown even when right ("Right! In simplest form that's 3/23.") */
  notes: string[];
}

// ---------------------------------------------------------------------------------------------

function sameExpr(a: string, b: string, vars?: string[]): boolean | null {
  let ea, eb;
  try {
    ea = parseExpr(a);
    eb = parseExpr(b);
  } catch {
    return null;
  }
  const letters = new Set([...varsOf(ea), ...varsOf(eb), ...(vars ?? [])]);
  // A student who writes the right expression with a different letter shouldn't be marked wrong,
  // so if both sides use exactly one (different) letter, rename hers.
  const va = [...varsOf(ea)];
  const vb = [...varsOf(eb)];
  let rename: Record<string, string> = {};
  if (va.length === 1 && vb.length === 1 && va[0] !== vb[0]) rename = { [va[0]]: vb[0] };
  const points = [
    [frac(3), frac(7), frac(2)],
    [frac(-5, 2), frac(11, 3), frac(13)],
    [frac(17, 7), frac(-4), frac(5, 9)],
    [frac(29), frac(1, 6), frac(-31, 4)],
  ];
  const names = [...letters];
  for (const pt of points) {
    const env: Record<string, Frac> = {};
    names.forEach((n, i) => (env[n] = pt[i % pt.length].n === 0n ? frac(1) : add(pt[i % pt.length], frac(i))));
    const envA: Record<string, Frac> = { ...env };
    for (const [from, to] of Object.entries(rename)) envA[from] = env[to];
    try {
      if (!eq(evalExpr(ea, envA), evalExpr(eb, env))) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function parseIneq(raw: string): { variable: string; op: string; value: Frac } | null {
  const s = tidy(raw).toLowerCase().replace(/\s+/g, "");
  let m = /^([a-z])(<=|>=|<|>|=<|=>)(.+)$/.exec(s);
  const flip: Record<string, string> = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
  const fix = (op: string) => (op === "=<" ? "<=" : op === "=>" ? ">=" : op);
  if (m) {
    const v = parseNumber(m[3]);
    return v ? { variable: m[1], op: fix(m[2]), value: v } : null;
  }
  m = /^(.+?)(<=|>=|<|>|=<|=>)([a-z])$/.exec(s);
  if (m) {
    const v = parseNumber(m[1]);
    return v ? { variable: m[3], op: flip[fix(m[2])], value: v } : null;
  }
  return null;
}

function parsePoint(raw: string): [Frac, Frac] | null {
  const s = tidy(raw).replace(/[()\s]/g, "");
  const parts = s.split(/[,;]/);
  if (parts.length !== 2) return null;
  const x = parseNumber(parts[0]);
  const y = parseNumber(parts[1]);
  return x && y ? [x, y] : null;
}

/** "22 ft 2 1/4 in", "22' 2.25\"", or two boxes joined with "|" by the UI. */
export function parseFtIn(raw: string): Frac | null {
  const s = tidy(raw).toLowerCase();
  if (s.includes("|")) {
    const [ft, inch] = s.split("|");
    const f = ft.trim() ? parseNumber(ft) : frac(0);
    const i = inch.trim() ? parseNumber(inch) : frac(0);
    return f && i ? add(mul(f, frac(12)), i) : null;
  }
  const m = /^(.*?)(?:ft\.?|feet|foot|')\s*(.*?)(?:in\.?|inches|inch|")?$/.exec(s);
  if (!m) return null;
  const f = parseNumber(m[1]);
  const i = m[2].trim() ? parseNumber(m[2]) : frac(0);
  return f && i ? add(mul(f, frac(12)), i) : null;
}

function checkField(f: Field, raw: string): FieldResult & { value?: Frac } {
  const blank = !raw || !raw.trim();
  if (blank) return { ok: false, blank: true };
  switch (f.kind) {
    case "number": {
      const v = parseNumber(raw);
      if (!v) return { ok: false, unreadable: true, note: "I couldn't read that as a number. Try something like 12, 3/4, 2 1/2 or 0.75." };
      const ok = f.within ? cmp(sub(v, f.value), f.within) <= 0 && cmp(sub(f.value, v), f.within) <= 0 : eq(v, f.value);
      let note: string | undefined;
      if (ok && f.simplest) {
        const typed = tidy(raw).replace(/\s+/g, " ");
        const m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(typed);
        if (m && (BigInt(m[1]) !== f.value.n || BigInt(m[2]) !== f.value.d) && f.value.d !== 1n)
          note = `Right value. In simplest form it's ${show(f.value)}.`;
      }
      return { ok, note, value: v };
    }
    case "choice": {
      const i = Number(raw);
      return { ok: i === f.correct };
    }
    case "expr": {
      const same = sameExpr(raw, f.value, f.vars);
      if (same === null) return { ok: false, unreadable: true, note: "I couldn't read that expression. Use * or a space-free form like 8.2n + 12." };
      return { ok: same };
    }
    case "ineq": {
      const p = parseIneq(raw);
      if (!p) return { ok: false, unreadable: true, note: `Write it like ${f.variable} <= 56 (you can also use ≤ or ≥).` };
      return { ok: p.op === f.op && eq(p.value, f.value) };
    }
    case "point": {
      const p = parsePoint(raw);
      if (!p) return { ok: false, unreadable: true, note: "Write a point like (3, -2)." };
      return { ok: [[f.x, f.y] as [Frac, Frac], ...(f.alts ?? [])].some(([x, y]) => eq(p[0], x) && eq(p[1], y)) };
    }
    case "ftin": {
      const v = parseFtIn(raw);
      if (!v) return { ok: false, unreadable: true, note: "Fill in feet and inches." };
      const ok = eq(v, f.inches);
      let note: string | undefined;
      if (ok && /\|/.test(raw)) {
        const inch = parseNumber(raw.split("|")[1] || "0");
        if (inch && cmp(inch, frac(12)) >= 0) note = "Right length. In simplest form the inches part is less than 12.";
      }
      return { ok, note };
    }
  }
}

export function check(spec: AnswerSpec, raws: string[]): CheckResult {
  const notes: string[] = [];
  if (spec.anyOrder) {
    // Match typed values to expected values in any order (all fields must be numbers).
    const expected = spec.fields as Extract<Field, { kind: "number" }>[];
    const used = new Set<number>();
    const fields: FieldResult[] = raws.map((raw) => {
      if (!raw || !raw.trim()) return { ok: false, blank: true };
      const v = parseNumber(raw);
      if (!v) return { ok: false, unreadable: true, note: "I couldn't read that as a number." };
      const hit = expected.findIndex((f, i) => !used.has(i) && (f.within ? cmp(sub(v, f.value), f.within) <= 0 && cmp(sub(f.value, v), f.within) <= 0 : eq(v, f.value)));
      if (hit >= 0) {
        used.add(hit);
        return { ok: true };
      }
      return { ok: false };
    });
    return { ok: fields.every((f) => f.ok), fields, notes };
  }
  const fields = spec.fields.map((f, i) => {
    const r = checkField(f, raws[i] ?? "");
    if (r.ok && r.note) notes.push(r.note);
    return { ok: r.ok, note: r.note, blank: r.blank, unreadable: r.unreadable };
  });
  return { ok: fields.every((f) => f.ok), fields, notes };
}
