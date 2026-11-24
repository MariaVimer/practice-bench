import type { Diagram, Prim } from "../lib/diagram";

const fillClass = (f?: string) => (f === "dark" ? "dg-dark" : f === "mid" ? "dg-mid" : f === "light" ? "dg-light" : "dg-none");

function Item({ p, i }: { p: Prim; i: number }) {
  switch (p.t) {
    case "line":
      return (
        <line
          x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}
          className={p.dash ? "dg-line dg-dash" : "dg-line"}
          strokeWidth={p.w ?? 1.2}
          markerEnd={p.arrow ? "url(#dg-arrow)" : undefined}
          markerStart={p.arrow === "both" ? "url(#dg-arrow-start)" : undefined}
        />
      );
    case "rect":
      return <rect x={p.x} y={p.y} width={p.w} height={p.h} className={`dg-shape ${fillClass(p.fill)}${p.dash ? " dg-dash" : ""}`} />;
    case "circle":
      return <circle cx={p.cx} cy={p.cy} r={p.r} className={`dg-shape ${fillClass(p.fill)}`} />;
    case "poly":
      return p.closed === false
        ? <polyline points={p.points.map((q) => q.join(",")).join(" ")} className={`dg-shape dg-none${p.dash ? " dg-dash" : ""}`} />
        : <polygon points={p.points.map((q) => q.join(",")).join(" ")} className={`dg-shape ${fillClass(p.fill)}${p.dash ? " dg-dash" : ""}`} />;
    case "path":
      return <path d={p.d} className={`dg-shape ${fillClass(p.fill)}${p.dash ? " dg-dash" : ""}`} />;
    case "text":
      return (
        <text key={i} x={p.x} y={p.y} textAnchor={p.anchor ?? "start"} fontSize={p.size ?? 13} className={`dg-text${p.italic ? " dg-italic" : ""}${p.bold ? " dg-bold" : ""}`}>
          {p.text}
        </text>
      );
  }
}

/** A question's figure or table, drawn from the version's own numbers. */
export function DiagramView({ d, print = false }: { d: Diagram; print?: boolean }) {
  if (d.kind === "table") {
    return (
      <figure className={print ? "dg dg-print" : "dg"}>
        <table className="dg-table">
          <thead><tr>{d.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{d.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
        {d.caption && <figcaption>{d.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className={print ? "dg dg-print" : "dg"}>
      <svg viewBox={`0 0 ${d.width} ${d.height}`} width={d.width} role="img" aria-label={d.label} className="dg-svg" style={{ maxWidth: "100%", height: "auto" }}>
        <defs>
          <marker id="dg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 Z" className="dg-arrowhead" />
          </marker>
          <marker id="dg-arrow-start" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 Z" className="dg-arrowhead" />
          </marker>
        </defs>
        {d.items.map((p, i) => <Item key={i} p={p} i={i} />)}
      </svg>
      {d.caption && <figcaption>{d.caption}</figcaption>}
    </figure>
  );
}
