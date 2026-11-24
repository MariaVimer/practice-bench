import { type Frac, add, div, frac, fromDecimal, mul, neg, pow, sub } from "./frac";

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": " 1/2", "⅓": " 1/3", "⅔": " 2/3", "¼": " 1/4", "¾": " 3/4", "⅕": " 1/5", "⅖": " 2/5", "⅗": " 3/5", "⅘": " 4/5",
  "⅙": " 1/6", "⅚": " 5/6", "⅛": " 1/8", "⅜": " 3/8", "⅝": " 5/8", "⅞": " 7/8",
};

/** Normalise typing quirks: unicode minus, fraction glyphs, "÷", "×", "·", fullwidth etc. */
export function tidy(raw: string): string {
  let s = raw.normalize("NFKC");
  for (const [g, r] of Object.entries(UNICODE_FRACTIONS)) s = s.split(g).join(r);
  s = s
    .replace(/[−‒–—]/g, "-")
    .replace(/[×✕✖]/g, "*")
    .replace(/[·•⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/⁄/g, "/")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

// Words a kid might type after a number. Stripped only from the END of a plain-number answer.
const UNIT_WORDS =
  /\s*(dollars?|cents?|¢|miles?|mi|mph|minutes?|mins?|min|hours?|hrs?|h|seconds?|secs?|s|feet|foot|ft|inches|inch|in|yards?|yd|cups?|gallons?|gal|liters?|litres?|l|ounces?|oz|fl oz|pounds?|lbs?|lb|kilograms?|kg|cm|centimeters?|meters?|m|sq\.? ?units?|square units|units?|lawns?|pages?|passes|plants|dogs|students|songs|batches|runs|years?( old)?|degrees|°f?|turns|times|plums|lemons|percent|per ?cent|%)\.?$/i;

/** Parse one number the way a 6th grader might type it. Returns null if it isn't one. */
export function parseNumber(raw: string): Frac | null {
  let s = tidy(raw).toLowerCase();
  if (!s) return null;
  s = s.replace(/^\$\s*/, "").replace(/^(about|approximately|approx\.?|~|≈)\s*/, "");
  for (let i = 0; i < 3; i++) s = s.replace(UNIT_WORDS, "").trim();
  // any other trailing words after a number ("12 km", "48 square cm", "7 pens") are units too
  if (/^[-+$.\d]/.test(s)) s = s.replace(/\s*[a-z][a-z .'²³-]*$/i, "").trim();
  s = s.replace(/^\$\s*/, "");
  // thousands separators: 13,200 or 4,102 (only when the commas are in thousands positions)
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  // ratio "5:3" or "5 : 3" (a ratio typed the way it's written in class) → 5/3
  const ratio = /^(\d*\.?\d+)\s*:\s*(\d*\.?\d+)$/.exec(s);
  if (ratio) {
    const b = fromDecimal(ratio[2]);
    return b.n === 0n ? null : div(fromDecimal(ratio[1]), b);
  }
  // mixed number "-1 3/4" or "1 3/4"
  let m = /^(-)?(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (m) {
    const whole = BigInt(m[2]);
    const n = BigInt(m[3]);
    const d = BigInt(m[4]);
    if (d === 0n) return null;
    const v = frac(whole * d + n, d);
    return m[1] ? neg(v) : v;
  }
  // fraction "a/b" with optional signs, decimals allowed on top/bottom (e.g. 1.5/3)
  m = /^(-)?\s*(\d*\.?\d+)\s*\/\s*(-)?\s*(\d*\.?\d+)$/.exec(s);
  if (m) {
    const top = fromDecimal(m[2]);
    const bottom = fromDecimal(m[4]);
    if (bottom.n === 0n) return null;
    const v = div(top, bottom);
    return (m[1] ? 1 : 0) + (m[3] ? 1 : 0) === 1 ? neg(v) : v;
  }
  // plain decimal / integer, "+5", ".5", "5."
  m = /^([+-])?(\d+\.?\d*|\.\d+)$/.exec(s);
  if (m) return fromDecimal((m[1] === "-" ? "-" : "") + m[2]);
  return null;
}

// ---------------------------------------------------------------------------------------------
// Expressions: + - * / ^, parentheses, implicit multiplication (8.2n, 5.6(4+p), (x+1)(x-1), 2x),
// single-letter variables. Evaluated exactly at chosen rational points.

type Tok = { t: "num"; v: Frac } | { t: "var"; v: string } | { t: "op"; v: string } | { t: "(" } | { t: ")" };

function tokens(src: string): Tok[] {
  const s = tidy(src).replace(/\s+/g, "");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      const text = s.slice(i, j).replace(/,(?=\d{3}(\D|$))/g, "");
      out.push({ t: "num", v: fromDecimal(text) });
      i = j;
    } else if (/[a-z]/i.test(c)) {
      out.push({ t: "var", v: c.toLowerCase() });
      i++;
    } else if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
    } else if (c === "(" || c === "[") {
      out.push({ t: "(" });
      i++;
    } else if (c === ")" || c === "]") {
      out.push({ t: ")" });
      i++;
    } else throw new Error(`unexpected "${c}"`);
  }
  // insert implicit "*"
  const withMul: Tok[] = [];
  for (let k = 0; k < out.length; k++) {
    const a = withMul[withMul.length - 1];
    const b = out[k];
    const aEnds = a && (a.t === "num" || a.t === "var" || a.t === ")");
    const bStarts = b.t === "num" || b.t === "var" || b.t === "(";
    if (aEnds && bStarts) withMul.push({ t: "op", v: "*" });
    withMul.push(b);
  }
  return withMul;
}

export type Expr =
  | { k: "num"; v: Frac }
  | { k: "var"; v: string }
  | { k: "neg"; a: Expr }
  | { k: "bin"; op: string; a: Expr; b: Expr };

export function parseExpr(src: string): Expr {
  const ts = tokens(src);
  let p = 0;
  const peek = () => ts[p];
  const take = () => ts[p++];
  function primary(): Expr {
    const t = take();
    if (!t) throw new Error("unexpected end");
    if (t.t === "num") return { k: "num", v: t.v };
    if (t.t === "var") return { k: "var", v: t.v };
    if (t.t === "(") {
      const e = sum();
      if (take()?.t !== ")") throw new Error("missing )");
      return e;
    }
    if (t.t === "op" && t.v === "-") return { k: "neg", a: power() };
    if (t.t === "op" && t.v === "+") return power();
    throw new Error("unexpected token");
  }
  function power(): Expr {
    const base = primary();
    const t = peek();
    if (t && t.t === "op" && t.v === "^") {
      take();
      return { k: "bin", op: "^", a: base, b: unary() };
    }
    return base;
  }
  function unary(): Expr {
    const t = peek();
    if (t && t.t === "op" && t.v === "-") {
      take();
      return { k: "neg", a: unary() };
    }
    return power();
  }
  function product(): Expr {
    let e = unary();
    for (;;) {
      const t = peek();
      if (t && t.t === "op" && (t.v === "*" || t.v === "/")) {
        take();
        e = { k: "bin", op: t.v, a: e, b: unary() };
      } else return e;
    }
  }
  function sum(): Expr {
    let e = product();
    for (;;) {
      const t = peek();
      if (t && t.t === "op" && (t.v === "+" || t.v === "-")) {
        take();
        e = { k: "bin", op: t.v, a: e, b: product() };
      } else return e;
    }
  }
  const e = sum();
  if (p !== ts.length) throw new Error("extra input");
  return e;
}

export function evalExpr(e: Expr, env: Record<string, Frac>): Frac {
  switch (e.k) {
    case "num":
      return e.v;
    case "var": {
      const v = env[e.v];
      if (!v) throw new Error(`unknown letter ${e.v}`);
      return v;
    }
    case "neg":
      return neg(evalExpr(e.a, env));
    case "bin": {
      const a = evalExpr(e.a, env);
      const b = evalExpr(e.b, env);
      if (e.op === "+") return add(a, b);
      if (e.op === "-") return sub(a, b);
      if (e.op === "*") return mul(a, b);
      if (e.op === "/") return div(a, b);
      const ex = Number(b.n) / Number(b.d);
      return pow(a, ex);
    }
  }
}

export function varsOf(e: Expr, into = new Set<string>()): Set<string> {
  if (e.k === "var") into.add(e.v);
  if (e.k === "neg") varsOf(e.a, into);
  if (e.k === "bin") {
    varsOf(e.a, into);
    varsOf(e.b, into);
  }
  return into;
}
