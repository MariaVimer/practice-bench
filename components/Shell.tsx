"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "../lib/site";
import { CatFooter } from "./CatFooter";
import { EXERCISES, byId } from "../content";
import { idOf, load } from "../lib/progress";
import { CLUSTERS, type Cluster } from "../lib/types";

const SECTIONS = (Object.keys(CLUSTERS) as Cluster[]).filter((c) => EXERCISES.some((e) => e.cluster === c));

/** The section she's in: the problem on screen, otherwise the last one she practiced. */
function useHere(path: string): Cluster | null {
  const [last, setLast] = useState<Cluster | null>(null);
  useEffect(() => {
    const refresh = () => {
      const recs = Object.entries(load()).sort((a, b) => b[1].updated - a[1].updated);
      setLast(recs.length ? byId(idOf(recs[0][0]))?.cluster ?? null : null);
    };
    refresh();
    window.addEventListener("bench-progress", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bench-progress", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const m = path.match(/^\/x\/([^/]+)/);
  return (m && byId(decodeURIComponent(m[1]))?.cluster) || last;
}

export const THEMES = ["light", "paper", "blueprint", "sepia", "dark"] as const;
type Theme = (typeof THEMES)[number];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const t = document.documentElement.dataset.theme as Theme;
    if (THEMES.includes(t)) setTheme(t);
  }, []);
  const pick = (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("bench-theme", t);
    } catch {}
  };
  return (
    <div className="themes-bar" role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => (
        <button key={t} type="button" role="radio" aria-checked={theme === t} onClick={() => pick(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

export interface TocItem { id: string; label: string }

export function Shell({ toc = [], children }: { toc?: TocItem[]; children: React.ReactNode }) {
  const path = usePathname();
  const here = useHere(path);
  const nav = (
    <ul className="nav">
      <li><Link href="/" aria-current={path === "/" ? "page" : undefined}>Bench</Link></li>
      <li><Link href="/#questions">Questions</Link></li>
      <li><Link href="/progress" aria-current={path === "/progress" ? "page" : undefined}>Progress</Link></li>
      <li><Link href="/print" aria-current={path === "/print" ? "page" : undefined}>Print</Link></li>
      <li><a href="#credits">Credits</a></li>
    </ul>
  );
  const railNav = (
    <ul className="nav">
      <li>
        <Link href="/" aria-current={path === "/" ? "page" : undefined}>Bench</Link>
        <ol className="subnav">
          {SECTIONS.map((c) => (
            <li key={c}>
              <Link href={`/#${c}`} aria-current={here === c ? "location" : undefined}>{CLUSTERS[c].name}</Link>
              {here === c && <span className="here">You are here</span>}
            </li>
          ))}
        </ol>
      </li>
      <li><Link href="/#questions">Questions</Link></li>
      <li><Link href="/progress" aria-current={path === "/progress" ? "page" : undefined}>Progress</Link></li>
      <li><Link href="/print" aria-current={path === "/print" ? "page" : undefined}>Print</Link></li>
      <li><a href="#credits">Credits</a></li>
    </ul>
  );
  return (
    <>
    <div className="page">
      <aside className="rail" aria-label="Site">
        {railNav}
        {toc.length > 0 && (
          <ol className="toc">
            {toc.map((t) => (
              <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>
            ))}
          </ol>
        )}
        <div>
          <div className="rail-label">Theme</div>
          <ThemeSwitcher />
        </div>
      </aside>
      <main className="column">
        <nav className="top" aria-label="Site">
          {nav}
          <ThemeSwitcher />
        </nav>
        {children}
        <footer className="colophon" id="credits">
          <p>
            Made by {SITE.author}. Built with Claude Code. Set in Inter and EB Garamond.
          </p>
          <p>
            Problems adapted from <a href="https://www.cmleague.com/product-category/cml/" target="_blank" rel="noopener">Continental Mathematics League</a> sample papers
            (© Continental Mathematics League) and the i-Ready Grade 6 At-Home Activity Packet (© 2020{" "}
            <a href="https://www.curriculumassociates.com/programs/i-ready-assessment" target="_blank" rel="noopener">Curriculum Associates, LLC</a>. All rights reserved),
            reworded. Not affiliated with either.
          </p>
          {(SITE.linkedin || SITE.github) && (
            <p className="colophon-links">
              {SITE.linkedin && <a href={SITE.linkedin} target="_blank" rel="noopener">{SITE.author} on LinkedIn</a>}
              {SITE.github && <a href={SITE.github} target="_blank" rel="noopener">Source on GitHub</a>}
            </p>
          )}
        </footer>
      </main>
    </div>
    <CatFooter />
    </>
  );
}

export function SectionHead({ n, title }: { n: number; title: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      <span className="section-index" aria-hidden="true">{String(n).padStart(2, "0")}</span>
    </div>
  );
}

/** A numbered footnote: a side note in the margin on desktop, collected under the page on phones. */
export function Ref({ n }: { n: number }) {
  return <a className="ref" href={`#note-${n}`} id={`ref-${n}`} aria-label={`Note ${n}`}>{n}</a>;
}
export function Side({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="side" role="note">
      <span aria-hidden="true">{n}</span>
      {children}
    </span>
  );
}
export function Notes({ notes }: { notes: React.ReactNode[] }) {
  return (
    <ol className="notes">
      {notes.map((note, i) => (
        <li key={i} id={`note-${i + 1}`}>
          <span>{i + 1}</span>
          <span>{note}</span>
        </li>
      ))}
    </ol>
  );
}
