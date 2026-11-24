// The figures the CML sample questions show, redrawn from each version's own numbers.
import { type Diagram, type Prim, cells, squareGrid, svg } from "../../lib/diagram";

const T = (x: number, y: number, text: string, o: Partial<Extract<Prim, { t: "text" }>> = {}): Prim => ({ t: "text", x, y, text, ...o });
const L = (x1: number, y1: number, x2: number, y2: number, o: Partial<Extract<Prim, { t: "line" }>> = {}): Prim => ({ t: "line", x1, y1, x2, y2, ...o });

/** P 5-1 #6: three containers, A full; sized by capacity. */
export function containers(a: number, b: number, c: number): Diagram {
  const max = Math.max(a, b, c), H = 120, top = 16;
  const boxes = [["A", a, 92], ["B", b, 76], ["C", c, 62]] as const;
  const items: Prim[] = [];
  let x = 18;
  for (const [name, cap, w] of boxes) {
    const h = Math.max(40, (cap / max) * H);
    const y = top + H - h;
    items.push({ t: "rect", x, y, w, h, fill: "none" });
    items.push(T(x + w / 2, y + h / 2 - 2, String(cap), { anchor: "middle", size: 14 }));
    items.push(T(x + w / 2, y + h / 2 + 14, "gallons", { anchor: "middle", size: 12 }));
    items.push(T(x + w / 2, top + H + 22, name, { anchor: "middle", size: 15, bold: true }));
    x += w + 30;
  }
  return svg(x, top + H + 32, items, `Three containers: A holds ${a} gallons, B holds ${b}, C holds ${c}.`);
}

/** P 6-3 #3: a rectangle cut into A, B (top) and D, C (bottom); areas of A, B, C shown. */
export function fourRects(w1: number, w2: number, h1: number, h2: number): Diagram {
  const W = 300, H = 170, x0 = 16, y0 = 16;
  const share = (a: number, b: number) => Math.min(0.75, Math.max(0.25, a / (a + b)));
  const xs = x0 + W * share(w1, w2), ys = y0 + H * share(h1, h2);
  const items: Prim[] = [
    { t: "rect", x: x0, y: y0, w: W, h: H, fill: "none" },
    L(xs, y0, xs, y0 + H, { w: 1.2 }),
    L(x0, ys, x0 + W, ys, { w: 1.2 }),
    T(x0 + 6, y0 + 16, "A", { bold: true }), T(xs + 6, y0 + 16, "B", { bold: true }),
    T(x0 + 6, ys + 16, "D", { bold: true }), T(xs + 6, ys + 16, "C", { bold: true }),
    T((x0 + xs) / 2, (y0 + ys) / 2 + 8, String(w1 * h1), { anchor: "middle", size: 15 }),
    T((xs + x0 + W) / 2, (y0 + ys) / 2 + 8, String(w2 * h1), { anchor: "middle", size: 15 }),
    T((xs + x0 + W) / 2, (ys + y0 + H) / 2 + 8, String(w2 * h2), { anchor: "middle", size: 15 }),
  ];
  return svg(W + 32, H + 32, items, `A rectangle split into four: A is ${w1 * h1}, B is ${w2 * h1}, C is ${w2 * h2}, D is unknown.`);
}

/** E 6-4 #1: long-division layout with an empty box for the dividend. */
export function divisionBox(d: number, qt: number, r: number): Diagram {
  const items: Prim[] = [
    T(62, 28, `${qt} r${r}`, { anchor: "middle", size: 16 }),
    T(30, 62, String(d), { anchor: "end", size: 17 }),
    { t: "path", d: "M36 40 Q44 52 36 68" },
    L(36, 40, 96, 40, { w: 1.4 }),
    { t: "rect", x: 46, y: 46, w: 40, h: 22, fill: "none" },
  ];
  return svg(120, 80, items, `${d} divides into an unknown number: quotient ${qt}, remainder ${r}.`);
}

/** E 6-4 #2: the rule |a c; b d| = ad − bc, and the box to solve. */
export function bracketRule(b: number, c: number, d: number, R: number): Diagram {
  const box = (x: number, tl: string, tr: string, bl: string, br: string): Prim[] => [
    L(x, 10, x, 64, { w: 1.4 }), L(x + 64, 10, x + 64, 64, { w: 1.4 }),
    T(x + 18, 32, tl, { anchor: "middle", size: 16, italic: /[a-z]/.test(tl) }), T(x + 46, 32, tr, { anchor: "middle", size: 16, italic: /[a-z]/.test(tr) }),
    T(x + 18, 58, bl, { anchor: "middle", size: 16, italic: /[a-z]/.test(bl) }), T(x + 46, 58, br, { anchor: "middle", size: 16, italic: /[a-z]/.test(br) }),
  ];
  const items: Prim[] = [
    ...box(10, "a", "c", "b", "d"),
    T(84, 44, "= ad − bc", { size: 16 }),
    ...box(230, "x", String(b), String(c), String(d)),
    T(304, 44, `= ${R}`, { size: 16 }),
  ];
  return svg(360, 74, items, `The rule: a box with a and c on top, b and d below, equals a times d minus b times c. The box to solve has x and ${b} on top, ${c} and ${d} below, and equals ${R}.`);
}

/** E 6-4 #4: nine identical squares in a cross. */
export function cross(): Diagram {
  return cells([[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [0, 3], [1, 3], [2, 3], [1, 4]], { unit: 34, label: "Nine identical squares: a column of five with a row of three across its second and fourth squares." });
}

/** P 7-3 #4: a big cube (1 ft) and a small cube (s in), drawn as boxes with hidden edges dashed. */
export function cubes(s: number): Diagram {
  const cube = (x: number, y: number, a: number, o: number, label: string, hidden: boolean): Prim[] => [
    { t: "rect", x, y: y + o, w: a, h: a, fill: "none" },
    { t: "poly", points: [[x, y + o], [x + o, y], [x + a + o, y], [x + a, y + o]], fill: "none" },
    { t: "poly", points: [[x + a, y + o], [x + a + o, y], [x + a + o, y + a], [x + a, y + a + o]], fill: "none" },
    ...(hidden ? [L(x + o, y, x + o, y + a, { dash: true, w: 0.9 }), L(x + o, y + a, x + a + o, y + a, { dash: true, w: 0.9 }), L(x + o, y + a, x, y + a + o, { dash: true, w: 0.9 })] : []),
    T(x + a / 2, y + a + o + 20, label, { anchor: "middle", size: 13 }),
  ];
  return svg(300, 176, [...cube(14, 10, 118, 34, "1 ft", true), ...cube(214, 86, 40, 12, `${s} in`, false)], `A cube 1 foot on each side, and a small cube ${s} inch${s === 1 ? "" : "es"} on each side.`);
}

/** P 7-3 #5: a W × H outline with a notch D deep cut into the right side; every corner square. */
export function notched(W: number, H: number, D: number, y0: number, g: number): Diagram {
  const u = Math.min(200 / W, 200 / H), x0 = 34, t0 = 26;
  const X = (v: number) => x0 + v * u, Y = (v: number) => t0 + v * u;
  const pts: [number, number][] = [[0, 0], [W, 0], [W, y0], [W - D, y0], [W - D, y0 + g], [W, y0 + g], [W, H], [0, H]];
  const items: Prim[] = [
    { t: "poly", points: pts.map(([a, b]) => [X(a), Y(b)] as [number, number]), fill: "none" },
    T(X(W / 2), Y(0) - 8, String(W), { anchor: "middle", size: 14 }),
    T(X(0) - 8, Y(H / 2) + 5, String(H), { anchor: "end", size: 14 }),
    T(X(W - D / 2), Y(y0) - 6, String(D), { anchor: "middle", size: 14 }),
  ];
  // right-angle marks at the corners
  for (const [a, b] of pts) {
    const cx = X(a), cy = Y(b), sx = a <= 0.001 ? 1 : -1, sy = b <= 0.001 ? 1 : -1;
    if ((a === W - D && (b === y0 || b === y0 + g))) continue;
    items.push({ t: "poly", points: [[cx + sx * 7, cy], [cx + sx * 7, cy + sy * 7], [cx, cy + sy * 7]], fill: "none", closed: false });
  }
  return svg(X(W) + 24, Y(H) + 20, items, `A ${W} by ${H} outline with a notch ${D} deep cut into its right side. Every corner is a right angle.`);
}

/** P 7-3 #6: the multiplication written vertically. */
export function letterMultiplication(k: number, pattern: string): Diagram {
  const items: Prim[] = [
    T(120, 26, "A B C D", { anchor: "end", size: 18, bold: true }),
    T(38, 54, "×", { size: 18 }),
    T(120, 54, String(k), { anchor: "end", size: 18, bold: true }),
    L(34, 64, 124, 64, { w: 1.4 }),
    T(120, 90, pattern.split("").join(" "), { anchor: "end", size: 18, bold: true }),
  ];
  return svg(150, 100, items, `A B C D times ${k} equals ${pattern.split("").join(" ")}.`);
}

/** E 7-1 #4: triangle RST, P the midpoint of ST, U on RT so RUS is the given fraction of RST, Q = RP ∩ SU. */
export function triangle(f: [number, number], rsq: number, ruq: number): Diagram {
  const S: [number, number] = [24, 170], Tt: [number, number] = [244, 170], R: [number, number] = [118, 18];
  const P: [number, number] = [(S[0] + Tt[0]) / 2, S[1]];
  const k = f[0] / f[1];
  const U: [number, number] = [R[0] + (Tt[0] - R[0]) * k, R[1] + (Tt[1] - R[1]) * k];
  // intersection of R→P and S→U
  const [x1, y1] = R, [x2, y2] = P, [x3, y3] = S, [x4, y4] = U;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const tq = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const Q: [number, number] = [x1 + tq * (x2 - x1), y1 + tq * (y2 - y1)];
  const mid = (...ps: [number, number][]): [number, number] => [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length];
  const a = mid(R, S, Q), b = mid(R, U, Q);
  const items: Prim[] = [
    { t: "poly", points: [R, S, Tt], fill: "none" },
    L(R[0], R[1], P[0], P[1], { w: 1.2 }),
    L(S[0], S[1], U[0], U[1], { w: 1.2 }),
    T(R[0], R[1] - 6, "R", { anchor: "middle", bold: true }), T(S[0] - 6, S[1] + 16, "S", { anchor: "middle", bold: true }),
    T(Tt[0] + 6, Tt[1] + 16, "T", { anchor: "middle", bold: true }), T(P[0], P[1] + 18, "P", { anchor: "middle", bold: true }),
    T(U[0] + 10, U[1], "U", { bold: true }), T(Q[0] + 7, Q[1] + 14, "Q", { bold: true, size: 12 }),
    T(a[0] - 4, a[1] + 5, String(rsq), { anchor: "middle", size: 14 }),
    T(b[0] + 2, b[1] + 5, String(ruq), { anchor: "middle", size: 13 }),
  ];
  return svg(270, 196, items, `Triangle RST with P on ST, U on RT, and RP crossing SU at Q. Triangle RSQ is marked ${rsq} and triangle RUQ is marked ${ruq}.`);
}

/** E 7-1 #6: a street grid, A bottom-left, B top-right. */
export function routes(w: number, h: number): Diagram {
  return squareGrid(w, h, { unit: 46, corners: [{ at: [0, 0], label: "A" }, { at: [w, h], label: "B" }] });
}
