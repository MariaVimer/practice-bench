"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EXERCISES } from "../content";
import { CLUSTERS, type Cluster } from "../lib/types";
import { Rich } from "./Rich";
import { DiagramView } from "./Diagram";

const SECTIONS = (Object.keys(CLUSTERS) as Cluster[]).filter((c) => EXERCISES.some((e) => e.cluster === c));
const PAPER = {
  letter: { w: 8.5, h: 11, css: "letter" },
  a4: { w: 8.27, h: 11.69, css: "A4" },
} as const;
const SPACE = { small: 70, medium: 130, large: 200 } as const; // px of working space per question
const DPI = 96;
const PAD = 0.6; // inches of margin on every side
const FOOT = 34; // px reserved for the page footer

type Block =
  | { kind: "head" }
  | { kind: "section"; c: Cluster; n: number }
  | { kind: "q"; id: string; n: number };

export function PrintWorksheet() {
  const [picked, setPicked] = useState<Cluster[]>([SECTIONS[0]]);
  const [version, setVersion] = useState(0);
  const [space, setSpace] = useState<keyof typeof SPACE>("medium");
  const [paper, setPaper] = useState<keyof typeof PAPER>("letter");
  const [pages, setPages] = useState<Block[][]>([]);
  const [zoom, setZoom] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const size = PAPER[paper];
  const contentW = (size.w - PAD * 2) * DPI;
  const contentH = (size.h - PAD * 2) * DPI - FOOT;

  const blocks = useMemo<Block[]>(() => {
    const out: Block[] = [{ kind: "head" }];
    let n = 0;
    SECTIONS.filter((c) => picked.includes(c)).forEach((c, i) => {
      out.push({ kind: "section", c, n: i + 1 });
      for (const e of EXERCISES.filter((x) => x.cluster === c)) out.push({ kind: "q", id: e.id, n: ++n });
    });
    return out;
  }, [picked]);

  // measure every block at print width, then pack whole blocks into pages (a section heading never ends a page)
  useLayoutEffect(() => {
    const box = measureRef.current;
    if (!box) return;
    const run = () => {
      const heights = [...box.children].map((el) => (el as HTMLElement).getBoundingClientRect().height + 14);
      const out: Block[][] = [];
      let page: Block[] = [];
      let used = 0;
      blocks.forEach((b, i) => {
        let need = heights[i];
        if (b.kind === "section" && i + 1 < blocks.length) need += heights[i + 1];
        if (page.length && used + need > contentH) {
          out.push(page);
          page = [];
          used = 0;
        }
        page.push(b);
        used += heights[i];
      });
      if (page.length) out.push(page);
      setPages(out);
    };
    run();
    document.fonts?.ready.then(run);
  }, [blocks, version, space, paper, contentH]);

  // fit the paper preview into the column on screen
  useEffect(() => {
    const fit = () => setZoom(Math.min(1, (wrapRef.current?.clientWidth ?? 800) / (size.w * DPI)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [size.w]);

  const render = (b: Block) => {
    if (b.kind === "head")
      return (
        <div className="ws-head">
          <div className="ws-title">Practice Bench <span>· worksheet</span></div>
          <div className="ws-meta">
            <span>{SECTIONS.filter((c) => picked.includes(c)).map((c) => CLUSTERS[c].name).join(" · ")}</span>
            <span>{version === 0 ? "Original numbers" : version === 1 ? "New numbers A" : "New numbers B"}</span>
          </div>
          <div className="ws-name"><span>Name</span><i /><span>Date</span><i /></div>
        </div>
      );
    if (b.kind === "section")
      return (
        <div className="ws-section">
          <h2>{CLUSTERS[b.c].name}</h2>
          <span>{String(b.n).padStart(2, "0")}</span>
        </div>
      );
    const ex = EXERCISES.find((e) => e.id === b.id)!;
    const built = ex.build(version === 0 ? ex.base : ex.variants[version - 1]);
    const choices = built.answer.fields.filter((f) => f.kind === "choice");
    const blanks = built.answer.fields.filter((f) => f.kind !== "choice");
    const onlyChoices = built.answer.fields.length > 0 && blanks.length === 0;
    return (
      <div className="ws-q">
        <div className="ws-qhead"><span className="ws-n">{b.n}</span><span className="ws-qtitle">{ex.title}</span></div>
        <div className="ws-prompt"><Rich text={built.prompt} block /></div>
        {built.diagram && <div className="ws-diagram"><DiagramView d={built.diagram} print /></div>}
        {choices.map((f, i) => f.kind === "choice" && (
          <div className="ws-choices" key={i}>
            {f.label && <div className="ws-label"><Rich text={f.label} /></div>}
            <div className="ws-opts">
              {f.options.map((o, k) => <span key={k}><b>{String.fromCharCode(65 + k)}</b> <Rich text={o} /></span>)}
            </div>
          </div>
        ))}
        <div className="ws-work" style={{ height: onlyChoices ? Math.round(SPACE[space] * 0.4) : built.reflection ? SPACE[space] * 1.3 : SPACE[space] }} />
        {blanks.length > 0 && (
          <div className="ws-answers">
            {blanks.map((f, i) => (
              <span key={i} className="ws-answer">
                <span>{f.label ? <Rich text={f.label} /> : "Answer"}</span>
                {f.kind === "ftin" ? <><i className="short" /> ft <i className="short" /> in</> : <i />}
                {f.kind === "number" && f.unit && <span>{f.unit}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const pick = (c: Cluster) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const nQ = blocks.filter((b) => b.kind === "q").length;

  return (
    <div className="print-page">
      <style>{`@page { size: ${size.css}; margin: 0; }`}</style>
      <div className="print-controls">
        <div className="print-group">
          <div className="print-label">Sections</div>
          <div className="print-checks">
            {SECTIONS.map((c) => (
              <label key={c}><input type="checkbox" checked={picked.includes(c)} onChange={() => pick(c)} /> {CLUSTERS[c].name} <span className="muted">({EXERCISES.filter((e) => e.cluster === c).length})</span></label>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn-quiet" onClick={() => setPicked([...SECTIONS])}>All</button>
            <button type="button" className="btn-quiet" onClick={() => setPicked([])}>None</button>
          </div>
        </div>
        {([["Numbers", version, setVersion, [[0, "Original"], [1, "New numbers A"], [2, "New numbers B"]]], ["Space to work", space, setSpace, [["small", "Small"], ["medium", "Medium"], ["large", "Large"]]], ["Paper", paper, setPaper, [["letter", "Letter"], ["a4", "A4"]]]] as const).map(([label, value, set, opts]) => (
          <div className="print-group" key={label}>
            <div className="print-label">{label}</div>
            <div className="themes-bar" role="radiogroup" aria-label={label}>
              {opts.map(([v, name]) => (
                <button key={String(v)} type="button" role="radio" aria-checked={value === v} style={{ textTransform: "none" }} onClick={() => (set as (x: any) => void)(v)}>{name}</button>
              ))}
            </div>
          </div>
        ))}
        <div className="print-go">
          <button className="btn" type="button" disabled={!nQ} onClick={() => window.print()}>Print or save as PDF</button>
          <span className="muted">{nQ} {nQ === 1 ? "question" : "questions"} · {pages.length} {pages.length === 1 ? "page" : "pages"}. In the print window, choose “Save as PDF” to keep a copy.</span>
        </div>
      </div>

      <div className="print-preview" ref={wrapRef}>
        <div className="sheets" style={{ zoom } as React.CSSProperties}>
          {nQ === 0 ? (
            <div className="sheet" style={{ width: `${size.w}in`, height: `${size.h}in`, padding: `${PAD}in` }}><p className="ws-empty">Pick at least one section.</p></div>
          ) : (
            pages.map((pg, i) => (
              <div className="sheet" key={i} style={{ width: `${size.w}in`, height: `${size.h}in`, padding: `${PAD}in` }}>
                <div className="sheet-body">{pg.map((b, j) => <div key={j} className="ws-block">{render(b)}</div>)}</div>
                <div className="sheet-foot">
                  <span>Problems adapted from Continental Mathematics League sample papers (© CML) and the i-Ready Grade 6 At-Home Activity Packet (© 2020 Curriculum Associates, LLC), reworded.</span>
                  <span>{i + 1} / {pages.length}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* off-screen measurer at print width */}
      <div className="sheet ws-measure" aria-hidden="true" ref={measureRef} style={{ width: contentW }}>
        {blocks.map((b, i) => <div key={i} className="ws-block">{render(b)}</div>)}
      </div>
    </div>
  );
}
