// The figures and tables the i-Ready packet questions show, redrawn from each version's numbers.
import { type Diagram, type Prim, svg, table } from "../../lib/diagram";

const T = (x: number, y: number, text: string, o: Partial<Extract<Prim, { t: "text" }>> = {}): Prim => ({ t: "text", x, y, text, ...o });
const L = (x1: number, y1: number, x2: number, y2: number, o: Partial<Extract<Prim, { t: "line" }>> = {}): Prim => ({ t: "line", x1, y1, x2, y2, ...o });
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Set 7 #1: the packet's bar model: five equal parts, $0 and the goal above, 0% and 100% below. */
export function savingsBar(goal: number): Diagram {
  const x0 = 30, W = 450, y = 26, h = 44;
  const items: Prim[] = [{ t: "rect", x: x0, y, w: W, h, fill: "none" }];
  for (let i = 1; i < 5; i++) items.push(L(x0 + (W * i) / 5, y, x0 + (W * i) / 5, y + h, { w: 1.2 }));
  items.push(T(x0, y - 8, "$0", { anchor: "start", size: 12 }), T(x0 + W, y - 8, `$${goal}`, { anchor: "end", size: 12 }));
  items.push(T(x0, y + h + 17, "0%", { anchor: "start", size: 12 }), T(x0 + W, y + h + 17, "100%", { anchor: "end", size: 12 }));
  return svg(x0 * 2 + W, y + h + 26, items, `A bar model in five equal parts, from $0 (0%) to $${goal} (100%).`);
}

/** Set 7 #3: the packet's double number line: students on top, percent below; only the last tick is labelled. */
export function doubleLine(size: number, p: number): Diagram {
  const step = gcd(p, 100);
  const x0 = 70, W = 380, y1 = 34, y2 = 70;
  const items: Prim[] = [
    L(x0, y1, x0 + W + 30, y1, { w: 1.2, arrow: "end" }), L(x0, y2, x0 + W + 30, y2, { w: 1.2, arrow: "end" }),
    T(x0 - 52, y1 - 12, "Students", { size: 12, bold: true }), T(x0 - 52, y2 + 22, "Percent", { size: 12, bold: true }),
  ];
  for (let v = 0; v <= 100; v += step) {
    const x = x0 + (W * v) / 100;
    items.push(L(x, y1 - 7, x, y1 + 7, { w: 1 }), L(x, y2 - 7, x, y2 + 7, { w: 1 }));
  }
  items.push(T(x0 + W, y1 - 12, String(size), { anchor: "middle", size: 12 }));
  items.push(T(x0 + W, y2 + 22, "100%", { anchor: "middle", size: 12 }));
  return svg(x0 + W + 50, y2 + 32, items, `A double number line: students on top, ending at ${size}; percent below, ending at 100%; marked every ${step}%.`);
}

/** Set 10 #1: a bar for tn/td with its first piece of 1/s marked. */
export function ribbonBar(tn: number, td: number, s: number): Diagram {
  const x0 = 20, W = 470, y = 34, h = 36;
  const piece = (W * td) / (s * tn); // width of 1/s inside tn/td
  const items: Prim[] = [
    { t: "rect", x: x0, y, w: W, h, fill: "none" },
    L(x0 + piece, y, x0 + piece, y + h, { w: 1.2 }),
    T(x0 + W / 2, y - 12, `${tn}/${td}`, { anchor: "middle", size: 13 }),
    T(x0 + piece / 2, y + h + 18, `1/${s}`, { anchor: "middle", size: 13 }),
  ];
  // the piece's own tenths (or td-ths), dashed, as in the packet
  const sub = td / gcd(td, s) > 1 && td % s === 0 ? td / s : 0;
  for (let i = 1; i < sub; i++) items.push(L(x0 + (piece * i) / sub, y, x0 + (piece * i) / sub, y + h, { w: 0.7, dash: true }));
  return svg(x0 * 2 + W, y + h + 28, items, `A bar ${tn}/${td} long with its first piece, 1/${s}, marked off.`);
}

/** Set 10 #2: a number line from 0 to a/b. */
export function toFraction(a: number, b: number): Diagram {
  const x0 = 30, W = 440, y = 26;
  const items: Prim[] = [
    L(x0 - 16, y, x0 + W + 16, y, { w: 1.2, arrow: "both" }),
    L(x0, y - 7, x0, y + 7, { w: 1.2 }), L(x0 + W, y - 7, x0 + W, y + 7, { w: 1.2 }),
    T(x0, y + 24, "0", { anchor: "middle", size: 13 }), T(x0 + W, y + 24, `${a}/${b}`, { anchor: "middle", size: 13 }),
  ];
  return svg(x0 * 2 + W, y + 34, items, `A number line from 0 to ${a}/${b}.`);
}

export { table };
