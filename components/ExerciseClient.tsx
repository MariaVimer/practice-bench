"use client";
import { useEffect, useMemo, useState } from "react";
import { byId } from "../content";
import { check, type CheckResult } from "../lib/check";
import { keyOf, load, loadDraft, loadVersion, recordAttempt, saveDraft, saveVersion, recordHint, recordSolutionShown, type Record as Rec } from "../lib/progress";
import { CLUSTERS, DOMAINS } from "../lib/types";
import { neighbours } from "../content/order";
import { DiagramView } from "./Diagram";
import { Rich } from "./Rich";
import { ShareButton } from "./ShareButton";
import { FieldInput } from "./Fields";
import { Notes, Ref, SectionHead, Side } from "./Shell";

const VERSION_NAMES = ["Original", "New numbers A", "New numbers B"];
const CHEERS = ["Nice work!", "That's it!", "Yes, exactly.", "Got it!"];

export default function ExerciseClient({ id }: { id: string }) {
  const ex = byId(id)!;
  const [version, setVersion] = useState(0);
  const params = version === 0 ? ex.base : ex.variants[version - 1];
  const built = useMemo(() => ex.build(params), [ex, params]);
  const fields = built.answer.fields;
  const key = keyOf(ex.id, version);

  const [inputs, setInputs] = useState<string[]>(() => fields.map(() => ""));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [rec, setRec] = useState<Rec | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [answered, setAnswered] = useState(false);

  // reopen the version she was last on
  useEffect(() => {
    setVersion(loadVersion(ex.id));
  }, [ex.id]);
  const pickVersion = (v: number) => {
    setVersion(v);
    saveVersion(ex.id, v);
  };

  // restore per-version state, including what she typed and whether it was checked
  useEffect(() => {
    const r = load()[key] ?? null;
    setRec(r);
    const d = loadDraft(key);
    const saved = d && d.inputs.length === fields.length ? d.inputs : fields.map(() => "");
    setInputs(saved);
    setResult(d?.checked && d.inputs.length === fields.length ? check(built.answer, saved) : null);
    setHintsShown(r && !r.solved ? r.hints : 0);
    setAnswered(!!built.reflection || (!!r && r.attempts > 0));
    setShowSolution(!!r?.solved);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCheck = () => {
    const res = check(built.answer, inputs);
    if (res.fields.every((f) => f.blank)) {
      setResult(res);
      return;
    }
    setResult(res);
    saveDraft(key, { inputs, checked: true });
    const r = recordAttempt(key, res.ok);
    setRec({ ...r });
    setAnswered(true);
    if (res.ok) setShowSolution(true);
  };
  const nextHint = () => {
    const n = Math.min(3, hintsShown + 1);
    setHintsShown(n);
    if (!built.reflection) setRec({ ...recordHint(key, n) });
  };
  const revealSolution = () => {
    recordSolutionShown(key);
    setShowSolution(true);
    setAnswered(true);
  };

  const feedback = (() => {
    if (!result) return null;
    if (result.fields.every((f) => f.blank)) return <span>Type an answer first.</span>;
    const unreadable = result.fields.find((f) => f.unreadable);
    if (unreadable) return <span>{unreadable.note}</span>;
    if (result.ok) {
      return (
        <span>
          <strong>{CHEERS[(rec?.attempts ?? 1) % CHEERS.length]}</strong> {built.answerText}.{result.notes.length ? ` ${result.notes.join(" ")}` : ""}
        </span>
      );
    }
    const partly = fields.length > 1 && result.fields.some((f) => f.ok);
    return (
      <span>
        {partly ? "Part of that is right. " : "Not yet. "}
        {hintsShown < 3 ? "A hint might help, or have another go." : "Have another go, or open the worked solution."}
      </span>
    );
  })();

  const sourceNote =
    ex.source.kind === "CML" ? (
      <>
        Adapted from Continental Mathematics League sample paper {ex.source.ref}, © Continental Mathematics League. Same numbers, new wording; the answer is from CML&apos;s official solutions. Full contests and practice books are at{" "}
        <a href="https://www.cmleague.com/product-category/books/" target="_blank" rel="noopener">cmleague.com</a>.
      </>
    ) : ex.source.kind === "iReady" ? (
      <>
        Adapted from the i-Ready Grade 6 At-Home Activity Packet, {ex.source.ref}, © 2020 Curriculum Associates, LLC. All rights reserved. No teacher&apos;s key was available: the answer was computed and checked in code with exact fractions. More at{" "}
        <a href="https://www.curriculumassociates.com/programs/i-ready-assessment" target="_blank" rel="noopener">curriculumassociates.com</a>.
      </>
    ) : null;
  // where the problem comes from: the document and the question number in it
  const origin = (() => {
    const cml = /^([PE]) (\d)-(\d) #(\d+)$/.exec(ex.source.ref);
    if (ex.source.kind === "CML" && cml) {
      const also = (ex.alsoIn ?? []).map((r) => r.replace(/^([PE] \d-\d) #(\d+)$/, "paper $1 as question $2")).join(" and ");
      return `CML sample paper ${cml[1]} ${cml[2]}-${cml[3]} (Grade ${cml[2]}), question ${cml[4]}${also ? ` (it also appears in ${also})` : ""}`;
    }
    const ir = /^Set (\d+) #(\d+) \(p\.(\d+)\)/.exec(ex.source.ref);
    if (ex.source.kind === "iReady" && ir) return `i-Ready Grade 6 At-Home Activity Packet, Set ${ir[1]}, question ${ir[2]} (page ${ir[3]})`;
    return null;
  })();
  const versionNote = origin ? (version === 0 ? `From ${origin}.` : `Based on ${origin}, with new numbers.`) : null;
  const { prev, next } = neighbours(ex.id);

  return (
    <article>
      <nav className="crumbs crumbs-row">
        <span><a href="/">Bench</a> / {CLUSTERS[ex.cluster].name}</span>
        <span className="crumbs-step">
          {prev ? <a href={`/x/${prev.id}`} aria-label={`Previous: ${prev.title}`}>← Previous</a> : <span className="off">← Previous</span>}
          <span aria-hidden="true">·</span>
          {next ? <a href={`/x/${next.id}`} aria-label={`Next: ${next.title}`}>Next →</a> : <span className="off">Next →</span>}
        </span>
      </nav>
      <header className="masthead">
        <div className="title-row">
          <h1 className="title">{ex.title}</h1>
          <ShareButton title={ex.title} />
        </div>
        <ul className="masthead-line">
          <li>{DOMAINS[ex.domain]}</li>
          <li>{ex.skill}</li>
          <li>{ex.source.key === "official" ? "official key" : ex.source.key === "answer-bank" ? "printed answer bank" : "computed answer"}</li>
        </ul>
        <div className="themes-bar" role="radiogroup" aria-label="Version" style={{ marginTop: 18 }}>
          {VERSION_NAMES.map((name, i) => (
            <button key={name} type="button" role="radio" aria-checked={version === i} onClick={() => pickVersion(i)} style={{ textTransform: "none" }}>
              {name}
            </button>
          ))}
        </div>
      </header>

      <section id="problem" className="section">
        <SectionHead n={1} title="The problem" />
        <div className="prompt">
          <Rich text={built.prompt} block />
        </div>
        {built.diagram && <DiagramView d={built.diagram} />}
        {versionNote && (
          <p className="muted" style={{ fontSize: 13 }}>
            {versionNote}
            <Ref n={1} />
            <Side n={1}>{sourceNote}</Side>
          </p>
        )}
        <form
          className="answer"
          onSubmit={(ev) => {
            ev.preventDefault();
            doCheck();
          }}
        >
          {built.reflection ? (
            <div className="reflect">
              <textarea rows={4} placeholder="Write your answer here. It isn't checked or saved; it's for thinking." aria-label="Your answer" />
              {showSolution && <div className="reflect-sample"><span className="muted">A sample answer: </span><Rich text={built.reflection.sample} /></div>}
            </div>
          ) : (
            <div className="fields" data-stack={fields.length > 1 && !built.answer.anyOrder ? "" : undefined}>
              {fields.map((f, i) => (
                <FieldInput
                  key={`${key}-${i}`}
                  f={f}
                  i={i}
                  value={inputs[i] ?? ""}
                  state={result && !result.fields[i]?.blank ? (result.fields[i]?.ok ? "ok" : "no") : undefined}
                  anyOrderJoin={!!built.answer.anyOrder && i < fields.length - 1}
                  onChange={(v) => {
                    const next = [...inputs];
                    next[i] = v;
                    setInputs(next);
                    saveDraft(key, { inputs: next, checked: false });
                  }}
                />
              ))}
            </div>
          )}
          {built.answer.anyOrder && <span className="muted" style={{ fontSize: 13 }}>Either order is fine.</span>}
          <div className="actions">
            {built.reflection ? (
              !showSolution && <button className="btn" type="button" onClick={() => { setShowSolution(true); setAnswered(true); }}>Show a sample answer</button>
            ) : (
              <button className="btn" type="submit">Check</button>
            )}
            {!showSolution && answered && !built.reflection && (
              <button className="btn-quiet" type="button" onClick={revealSolution}>Show the solution</button>
            )}
          </div>
          <div className="feedback" data-ok={result?.ok ? "true" : undefined} aria-live="polite">{feedback}</div>
        </form>
      </section>

      <section id="hints" className="section">
        <SectionHead n={2} title="Hints" />
        {hintsShown > 0 && (
          <ol className="hints">
            {built.hints.slice(0, hintsShown).map((h, i) => (
              <li key={i} className="hint-row">
                <span>{i + 1}</span>
                <span><Rich text={h} /></span>
              </li>
            ))}
          </ol>
        )}
        {hintsShown < 3 && (
          <p style={{ marginTop: hintsShown ? 12 : 0 }}>
            <button className="btn-quiet" type="button" onClick={nextHint}>Show hint {hintsShown + 1} of 3</button>
          </p>
        )}
      </section>

      <section id="solution" className="section">
        <SectionHead n={3} title="Worked solution" />
        {showSolution ? (
          <ol className="steps">
            {built.solution.map((s, i) => (
              <li key={i}><span><Rich text={s} /></span></li>
            ))}
          </ol>
        ) : (
          <div className="locked">Solve it, or check an answer and choose “Show the solution”.</div>
        )}
      </section>

      <nav className="pager" aria-label="More problems">
        {prev ? (
          <a href={`/x/${prev.id}`} data-way="back"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 2.5 4 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{prev.title}</span></a>
        ) : <span />}
        {next ? (
          <a href={`/x/${next.id}`} data-way="on"><span>{next.title}</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5 8 6 4.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
        ) : <span />}
      </nav>

      {sourceNote && <Notes notes={[sourceNote]} />}
    </article>
  );
}
