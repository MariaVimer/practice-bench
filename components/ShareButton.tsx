"use client";
import { useState } from "react";

/** Share: the system share sheet where there is one (phones), otherwise copy the link.
 *  Icon button and copy→check morph from the Anatomy site's .copy button. */
export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      return; // the person closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch {}
      t.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <button type="button" className="share" data-done={done ? "" : undefined} onClick={share} aria-label={done ? "Link copied" : "Share this page"}>
      <span className="copy-icon" data-done={done ? "" : undefined} aria-hidden="true">
        <svg className="copy-icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 10V2.5M5 5.2 8 2.3l3 2.9" />
          <path d="M5.5 7.5H4.2a1 1 0 0 0-1 1v4.8a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1V8.5a1 1 0 0 0-1-1h-1.3" />
        </svg>
        <svg className="copy-icon-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength="1" />
        </svg>
      </span>
      <span className="share-label">{done ? "Link copied" : "Share"}</span>
    </button>
  );
}
