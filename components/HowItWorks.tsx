"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "bench-howto-closed";

/** Floating "start here" card, in the Anatomy site's labelled .prompts list style. */
export function HowItWorks() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let closed = false;
    try {
      closed = localStorage.getItem(KEY) === "1";
    } catch {}
    if (!closed) {
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, []);
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };
  const reopen = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setOpen(true);
  };
  const tab = open ? 0 : -1;
  return (
    <>
      <aside className="howto" data-open={open ? "" : undefined} aria-label="Start here" aria-hidden={!open}>
        <div className="howto-head">
          <span>Start here</span>
          <button type="button" className="howto-close" aria-label="Close" onClick={close} tabIndex={tab}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" /></svg>
          </button>
        </div>
        <ul className="howto-list">
          <li>
            <span className="howto-label">Who it&apos;s for</span>
            <span className="howto-text">Sixth graders practising contest-style math, and the grown-ups helping them.</span>
          </li>
          <li>
            <span className="howto-label">How to use it</span>
            <span className="howto-text">
              Pick a problem, type your answer and press <kbd>Check</kbd>. Stuck? Open up to three hints; none gives the answer away. After you check, you can open the worked solution. Try <span className="howto-word">New numbers</span> to practise again.
            </span>
          </li>
          <li>
            <Link href="/progress" className="howto-row" tabIndex={tab}>
              <span className="howto-label">Track your progress</span>
              <span className="howto-text">
                <span className="howto-word">Progress</span> shows a bar for every skill, plus your strongest and weakest. It&apos;s saved in this browser, no account needed. No timers, no leaderboards.
              </span>
            </Link>
          </li>
        </ul>
      </aside>
      <button type="button" className="howto-chip" data-hidden={open ? "" : undefined} onClick={reopen} tabIndex={open ? -1 : 0}>
        Start here
      </button>
    </>
  );
}
