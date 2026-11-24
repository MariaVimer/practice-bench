// Exact rational numbers. Every answer on the site is compared with these, never with floats.

export interface Frac {
  n: bigint;
  d: bigint; // always > 0, always reduced
}

const abs = (v: bigint) => (v < 0n ? -v : v);
export const gcd = (a: bigint, b: bigint): bigint => {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

export function frac(n: bigint | number, d: bigint | number = 1n): Frac {
  let N = typeof n === "bigint" ? n : BigInt(n);
  let D = typeof d === "bigint" ? d : BigInt(d);
  if (D === 0n) throw new Error("division by zero");
  if (D < 0n) {
    N = -N;
    D = -D;
  }
  const g = gcd(N, D) || 1n;
  return { n: N / g, d: D / g };
}

/** Exact value of a decimal string like "-12.375". */
export function fromDecimal(text: string): Frac {
  const m = /^([+-])?(\d*)(?:\.(\d*))?$/.exec(text);
  if (!m || (!m[2] && !m[3])) throw new Error(`not a decimal: ${text}`);
  const whole = m[2] || "0";
  const part = m[3] || "";
  const n = BigInt(whole + part) * (m[1] === "-" ? -1n : 1n);
  return frac(n, 10n ** BigInt(part.length));
}

/** Convenience: q(3,4), q("2.35"), q(7). */
export function q(a: number | string | bigint, b: number | bigint = 1): Frac {
  if (typeof a === "string") {
    const f = fromDecimal(a);
    return div(f, frac(b));
  }
  if (typeof a === "number" && !Number.isInteger(a)) return div(fromDecimal(String(a)), frac(b));
  return frac(a as number, b);
}

export const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => {
  if (b.n === 0n) throw new Error("division by zero");
  return frac(a.n * b.d, a.d * b.n);
};
export const neg = (a: Frac) => frac(-a.n, a.d);
export const eq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d;
export const cmp = (a: Frac, b: Frac) => {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l < r ? -1 : l > r ? 1 : 0;
};
export const absF = (a: Frac) => frac(abs(a.n), a.d);
export function pow(a: Frac, e: number): Frac {
  if (!Number.isInteger(e)) throw new Error("only whole-number exponents");
  if (e < 0) return pow(div(frac(1), a), -e);
  let r = frac(1);
  for (let i = 0; i < e; i++) r = mul(r, a);
  return r;
}
export const isInt = (a: Frac) => a.d === 1n;
export const toNumber = (a: Frac) => Number(a.n) / Number(a.d);

/** "3/4", "-2", "1 1/2" (mixed=true), or a terminating decimal if dec=true and it terminates. */
export function show(a: Frac, { mixed = false, dec = false }: { mixed?: boolean; dec?: boolean } = {}): string {
  if (a.d === 1n) return a.n.toString();
  if (dec) {
    let d = a.d;
    while (d % 2n === 0n) d /= 2n;
    while (d % 5n === 0n) d /= 5n;
    if (d === 1n) {
      const s = toNumber(a);
      return String(Math.round(s * 1e9) / 1e9);
    }
  }
  if (mixed && abs(a.n) > a.d) {
    const sign = a.n < 0n ? "-" : "";
    const w = abs(a.n) / a.d;
    const r = abs(a.n) % a.d;
    return `${sign}${w} ${r}/${a.d}`;
  }
  return `${a.n}/${a.d}`;
}

/** Money: exact to the cent or it throws. */
export function money(a: Frac): string {
  const cents = mul(a, frac(100));
  if (!isInt(cents)) throw new Error(`not whole cents: ${show(a)}`);
  const c = cents.n;
  const sign = c < 0n ? "-" : "";
  const v = abs(c);
  const dollars = (v / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${dollars}.${(v % 100n).toString().padStart(2, "0")}`;
}
