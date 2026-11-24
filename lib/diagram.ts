// Diagrams: the figures and tables the original questions show, drawn from each version's numbers.
// Pure data (no React) so the screen, the print worksheet and the verifier can all use it.

export type Fill = "none" | "light" | "mid" | "dark";
export type Prim =
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; dash?: boolean; w?: number; arrow?: "end" | "both" }
  | { t: "rect"; x: number; y: number; w: number; h: number; fill?: Fill; dash?: boolean }
  | { t: "circle"; cx: number; cy: number; r: number; fill?: Fill }
  | { t: "poly"; points: [number, number][]; fill?: Fill; closed?: boolean; dash?: boolean }
  | { t: "path"; d: string; fill?: Fill; dash?: boolean }
  | { t: "text"; x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; size?: number; italic?: boolean; bold?: boolean };

export type Diagram =
  | { kind: "svg"; width: number; height: number; items: Prim[]; caption?: string; label: string }
  | { kind: "table"; headers: string[]; rows: string[][]; caption?: string };

export const svg = (width: number, height: number, items: Prim[], label: string, caption?: string): Diagram => ({ kind: "svg", width, height, items, label, caption });
export const table = (headers: string[], rows: (string | number)[][], caption?: string): Diagram => ({ kind: "table", headers, rows: rows.map((r) => r.map(String)), caption });

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000)).replace("-", "−");

/** A number line with ticks every `step`, optional labels, plotted points and an inequality ray. */
export function numberLine(o: {
  min: number;
  max: number;
  step?: number;
  /** which ticks get numbers: all, none, or a list of values */
  labels?: "all" | "none" | number[];
  points?: { at: number; label?: string; hollow?: boolean }[];
  ray?: { from: number; dir: 1 | -1; closed: boolean };
  width?: number;
}): Diagram {
  const step = o.step ?? 1;
  const W = o.width ?? 560, pad = 28, H = o.points?.some((p) => p.label) ? 74 : 58;
  const y = 30;
  const x = (v: number) => pad + ((v - o.min) / (o.max - o.min)) * (W - pad * 2);
  const items: Prim[] = [{ t: "line", x1: pad - 16, y1: y, x2: W - pad + 16, y2: y, arrow: "both", w: 1.2 }];
  const n = Math.round((o.max - o.min) / step);
  for (let i = 0; i <= n; i++) {
    const v = o.min + i * step;
    items.push({ t: "line", x1: x(v), y1: y - 6, x2: x(v), y2: y + 6, w: 1 });
    const show = o.labels === undefined || o.labels === "all" ? true : o.labels === "none" ? false : o.labels.some((l) => Math.abs(l - v) < 1e-9);
    if (show) items.push({ t: "text", x: x(v), y: y + 22, text: fmt(v), anchor: "middle", size: 12 });
  }
  if (o.ray) {
    const from = x(o.ray.from);
    const to = o.ray.dir > 0 ? W - pad + 14 : pad - 14;
    items.push({ t: "line", x1: from, y1: y, x2: to, y2: y, w: 3.2, arrow: "end" });
    items.push({ t: "circle", cx: from, cy: y, r: 5.5, fill: o.ray.closed ? "dark" : "none" });
  }
  for (const p of o.points ?? []) {
    items.push({ t: "circle", cx: x(p.at), cy: y, r: 5, fill: p.hollow ? "none" : "dark" });
    if (p.label) items.push({ t: "text", x: x(p.at), y: y - 13, text: p.label, anchor: "middle", size: 13, italic: true });
  }
  return svg(W, H, items, `Number line from ${fmt(o.min)} to ${fmt(o.max)}`);
}

/** A coordinate grid from −range to range on both axes, with optional labelled points. */
export function coordPlane(o: { range?: number; points?: { x: number; y: number; label?: string }[]; size?: number }): Diagram {
  const r = o.range ?? 5, S = o.size ?? 300, pad = 26, u = (S - pad * 2) / (2 * r);
  const X = (v: number) => pad + (v + r) * u, Y = (v: number) => pad + (r - v) * u;
  const items: Prim[] = [];
  for (let i = -r; i <= r; i++) {
    items.push({ t: "line", x1: X(i), y1: Y(-r), x2: X(i), y2: Y(r), w: 0.5, dash: i !== 0 });
    items.push({ t: "line", x1: X(-r), y1: Y(i), x2: X(r), y2: Y(i), w: 0.5, dash: i !== 0 });
  }
  items.push({ t: "line", x1: X(-r) - 10, y1: Y(0), x2: X(r) + 10, y2: Y(0), w: 1.3, arrow: "both" });
  items.push({ t: "line", x1: X(0), y1: Y(-r) + 10, x2: X(0), y2: Y(r) - 10, w: 1.3, arrow: "both" });
  items.push({ t: "text", x: X(r) + 14, y: Y(0) + 4, text: "x", italic: true, size: 13 });
  items.push({ t: "text", x: X(0) + 6, y: Y(r) - 12, text: "y", italic: true, size: 13 });
  for (let i = -r; i <= r; i++) if (i !== 0) {
    items.push({ t: "text", x: X(i), y: Y(0) + 14, text: fmt(i), anchor: "middle", size: 9.5 });
    items.push({ t: "text", x: X(0) - 5, y: Y(i) + 3, text: fmt(i), anchor: "end", size: 9.5 });
  }
  items.push({ t: "text", x: X(0) - 5, y: Y(0) + 14, text: "O", anchor: "end", size: 9.5, italic: true });
  for (const p of o.points ?? []) {
    items.push({ t: "circle", cx: X(p.x), cy: Y(p.y), r: 4, fill: "dark" });
    if (p.label) items.push({ t: "text", x: X(p.x) + 7, y: Y(p.y) - 6, text: p.label, size: 12, bold: true });
  }
  return svg(S + 20, S, items, `Coordinate plane from −${r} to ${r}`);
}

/** A rectangular grid of squares (e.g. a street grid), cols × rows, with optional corner labels. */
export function squareGrid(cols: number, rows: number, o: { unit?: number; corners?: { at: [number, number]; label: string; dot?: boolean }[] } = {}): Diagram {
  const u = o.unit ?? 48, pad = 26;
  const items: Prim[] = [];
  for (let i = 0; i <= cols; i++) items.push({ t: "line", x1: pad + i * u, y1: pad, x2: pad + i * u, y2: pad + rows * u, w: 1.2 });
  for (let j = 0; j <= rows; j++) items.push({ t: "line", x1: pad, y1: pad + j * u, x2: pad + cols * u, y2: pad + j * u, w: 1.2 });
  for (const c of o.corners ?? []) {
    const cx = pad + c.at[0] * u, cy = pad + (rows - c.at[1]) * u;
    if (c.dot !== false) items.push({ t: "circle", cx, cy, r: 4.5, fill: "dark" });
    items.push({ t: "text", x: cx + (c.at[0] === 0 ? -10 : 10), y: cy + (c.at[1] === 0 ? 16 : -8), text: c.label, anchor: c.at[0] === 0 ? "end" : "start", size: 14, bold: true });
  }
  return svg(cols * u + pad * 2, rows * u + pad * 2, items, `A grid ${cols} squares wide and ${rows} squares tall`);
}

/** Unit squares at the given cells (x right, y down), outlined. */
export function cells(list: [number, number][], o: { unit?: number; label?: string } = {}): Diagram {
  const u = o.unit ?? 34, pad = 10;
  const W = Math.max(...list.map(([x]) => x)) + 1, H = Math.max(...list.map(([, y]) => y)) + 1;
  const items: Prim[] = list.map(([x, y]) => ({ t: "rect", x: pad + x * u, y: pad + y * u, w: u, h: u, fill: "light" }) as Prim);
  return svg(W * u + pad * 2, H * u + pad * 2, items, o.label ?? `A shape made of ${list.length} squares`);
}
