"use client";
import type { Field } from "../lib/check";
import { Rich } from "./Rich";

const PLACEHOLDER: Partial<Record<Field["kind"], string>> = {
  expr: "e.g. 3x + 2",
  ineq: "e.g. w ≤ 56",
  point: "(x, y)",
};

/** One answer box (or choice group) per field. Values are strings; choices store their index. */
export function FieldInput({ f, i, value, state, onChange, anyOrderJoin }: {
  f: Field;
  i: number;
  value: string;
  state?: "ok" | "no";
  onChange: (v: string) => void;
  anyOrderJoin?: boolean;
}) {
  if (f.kind === "choice") {
    return (
      <div className="choice-field">
        {f.label && <div className="choice-label"><Rich text={f.label} /></div>}
        <div className="choices" data-compact={f.options.every((o) => o.replace(/\[\[|\]\]/g, "").length <= 12) ? "" : undefined} role="radiogroup" aria-label={f.label ?? "Choose one"}>
          {f.options.map((o, k) => (
            <button
              key={k}
              type="button"
              role="radio"
              className="choice"
              aria-checked={value === String(k)}
              data-state={value === String(k) ? state : undefined}
              onClick={() => onChange(String(k))}
            >
              <span className="choice-mark" aria-hidden="true">{String.fromCharCode(65 + k)}</span>
              <span><Rich text={o} /></span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (f.kind === "ftin") {
    const [ft = "", inch = ""] = value.split("|");
    const set = (a: string, b: string) => onChange(`${a}|${b}`);
    return (
      <span className="field">
        {f.label && <label htmlFor={`f-${i}`}>{f.label}</label>}
        <input id={`f-${i}`} className="short" inputMode="decimal" autoComplete="off" aria-label="feet" value={ft} data-state={state} onChange={(e) => set(e.target.value, inch)} />
        <span className="unit">ft</span>
        <input className="short" inputMode="text" autoComplete="off" aria-label="inches" value={inch} data-state={state} onChange={(e) => set(ft, e.target.value)} />
        <span className="unit">in</span>
      </span>
    );
  }
  const prefix = f.kind === "number" ? f.prefix : undefined;
  return (
    <span className="field">
      {f.label && <label htmlFor={`f-${i}`}><Rich text={f.label} /></label>}
      {prefix && <span className="unit">{prefix}</span>}
      <input
        id={`f-${i}`}
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={PLACEHOLDER[f.kind]}
        aria-label={f.label ? `${f.label}` : "Your answer"}
        value={value}
        data-state={state}
        onChange={(e) => onChange(e.target.value)}
      />
      {f.kind === "number" && f.unit && <span className="unit">{f.unit}</span>}
      {anyOrderJoin && <span className="muted">and</span>}
    </span>
  );
}
