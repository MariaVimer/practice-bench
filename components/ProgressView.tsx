"use client";
import { useEffect, useState } from "react";
import { EXERCISES } from "../content";
import { creditOf, idOf, load, resetAll, type Store } from "../lib/progress";
import { DOMAINS, type Domain } from "../lib/types";
import { Notes, Ref, SectionHead, Side } from "./Shell";
import { RestoreFromLink, SaveProgress } from "./SaveProgress";

interface Group { name: string; tries: number; total: number; score: number | null; firstTry: number; hinted: number; solved: number; open: number }

function groups(store: Store, by: (id: string) => string | undefined, names: string[]): Group[] {
  return names.map((name) => {
    const recs = Object.entries(store).filter(([key, r]) => by(idOf(key)) === name && r.attempts + r.hints > 0).map(([, r]) => r);
    const total = EXERCISES.filter((e) => by(e.id) === name).length;
    const credits = recs.map(creditOf);
    return {
      name,
      tries: recs.length,
      total,
      score: recs.length ? credits.reduce((a, b) => a + b, 0) / recs.length : null,
      firstTry: recs.filter((r) => r.solved && r.firstTry && r.hints === 0).length,
      hinted: recs.filter((r) => r.solved && r.firstTry && r.hints > 0).length,
      solved: recs.filter((r) => r.solved).length,
      open: recs.filter((r) => !r.solved).length,
    };
  });
}

/** One plain-language line per strength level. */
export function meaning(g: Group): string {
  if (g.score === null) return "Not tried yet.";
  if (g.tries < 2 && g.score >= 0.8) return "Right the first time so far; one problem is too few to call it a strength yet.";
  if (g.score >= 0.8) return "Strong: usually right on the first check, without hints.";
  if (g.score >= 0.55) return "Growing: gets there, sometimes after a hint or a second check.";
  if (g.score > 0) return "Building: solved some, often after a few tries. The hints and worked solutions are worth another look.";
  return "Just started: nothing solved here yet. Try one hint at a time, then read the worked solution.";
}

function Bar({ g }: { g: Group }) {
  const pct = g.score === null ? 0 : Math.round(g.score * 100);
  return (
    <li className="bar-row">
      <div className="bar-head">
        <span>{g.name}</span>
        <span>{g.score === null ? "—" : `${pct}`} · {g.tries} {g.tries === 1 ? "try" : "tries"}</span>
      </div>
      <div className="bar" role="img" aria-label={`${g.name}: ${g.score === null ? "not tried" : `${pct} out of 100`}`}>
        <i style={{ width: `${pct}%` }} />
        <b style={{ left: "55%" }} />
        <b style={{ left: "80%" }} />
      </div>
      <span className="bar-mean">{meaning(g)}</span>
    </li>
  );
}

export function ProgressView() {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => setStore(load());
    refresh();
    setReady(true);
    window.addEventListener("bench-progress", refresh);
    return () => window.removeEventListener("bench-progress", refresh);
  }, []);
  const skillOf = (id: string) => EXERCISES.find((e) => e.id === id)?.skill;
  const domainOf = (id: string) => {
    const d = EXERCISES.find((e) => e.id === id)?.domain;
    return d ? DOMAINS[d] : undefined;
  };
  const skills = groups(store, skillOf, [...new Set(EXERCISES.map((e) => e.skill))]);
  const domains = groups(store, domainOf, (Object.keys(DOMAINS) as Domain[]).map((d) => DOMAINS[d]));
  const ranked = skills.filter((g) => g.tries >= 2 && g.score !== null).sort((a, b) => b.score! - a.score!);
  const strongest = ranked[0];
  const weakest = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;
  const totalTries = Object.values(store).filter((r) => r.attempts + r.hints > 0).length;
  const disclaimer = "These are practice scores from this site only. They show how you did on these problems, on this device.";

  return (
    <article>
      <header className="masthead">
        <div className="title-row">
          <h1 className="title">Progress <span>· practice scores</span></h1>
        </div>
        <p className="statement">
          What you've practised so far, and what it <em>might</em> mean. {disclaimer}
          <Ref n={1} />
          <Side n={1}>Saved only in this browser. Clearing site data or switching devices starts fresh.</Side>
        </p>
        <ul className="masthead-line">
          <li>{totalTries} {totalTries === 1 ? "problem" : "problems"} tried</li>
          <li>{Object.values(store).filter((r) => r.solved).length} solved</li>
        </ul>
      </header>

      <RestoreFromLink />

      <section id="summary" className="section">
        <SectionHead n={1} title="At a glance" />
        {!ready ? null : ranked.length === 0 ? (
          <p className="text-2">Strongest and weakest skills show up after at least two problems in a skill. {totalTries ? "Keep going!" : "Nothing tried yet: pick any problem on the Bench."}</p>
        ) : (
          <div className="callout">
            <div>
              <h3>Strongest</h3>
              <strong>{strongest.name}</strong>
              <p className="text-2" style={{ margin: "4px 0 0" }}>{meaning(strongest)}</p>
            </div>
            <div>
              <h3>Most room to grow</h3>
              {weakest && weakest !== strongest ? (
                <>
                  <strong>{weakest.name}</strong>
                  <p className="text-2" style={{ margin: "4px 0 0" }}>{meaning(weakest)}</p>
                </>
              ) : (
                <p className="text-2" style={{ margin: 0 }}>Needs a second skill with two or more tries to compare.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <section id="save" className="section">
        <SectionHead n={2} title="Save your progress" />
        <SaveProgress />
      </section>

      <section id="skills" className="section">
        <SectionHead n={3} title="By skill" />
        <ul className="bars">{skills.map((g) => <Bar key={g.name} g={g} />)}</ul>
      </section>

      <section id="domains" className="section">
        <SectionHead n={4} title="By domain" />
        <p className="muted" style={{ fontSize: 13 }}>The four i-Ready domains. Each problem counts toward one.</p>
        <ul className="bars">{domains.map((g) => <Bar key={g.name} g={g} />)}</ul>
      </section>

      <section id="how" className="section">
        <SectionHead n={5} title="How it's counted" />
        <p>Each try at a problem (the original or a new-numbers version) earns a practice score:</p>
        <ul className="list">
          <li className="row" style={{ gridTemplateColumns: "60px 1fr" }}><span className="row-n">100</span><span>right on the first check, no hints</span></li>
          <li className="row" style={{ gridTemplateColumns: "60px 1fr" }}><span className="row-n">75</span><span>right on the first check, after hints</span></li>
          <li className="row" style={{ gridTemplateColumns: "60px 1fr" }}><span className="row-n">50</span><span>right after more than one check</span></li>
          <li className="row" style={{ gridTemplateColumns: "60px 1fr" }}><span className="row-n">0</span><span>not solved yet, or solved only after opening the solution</span></li>
        </ul>
        <p style={{ marginTop: 14 }}>A bar is the average of those scores. The two thin marks are at 55 and 80, where the words change from <em>building</em> to <em>growing</em> to <em>strong</em>.</p>
        <p className="muted">{disclaimer}</p>
        <p style={{ marginTop: 24 }}>
          <button
            className="btn-quiet"
            type="button"
            onClick={() => {
              if (confirm("Clear all saved practice on this device?")) resetAll();
            }}
          >
            Clear saved practice
          </button>
        </p>
      </section>
      <Notes notes={["Saved only in this browser. Clearing site data or switching devices starts fresh."]} />
    </article>
  );
}
