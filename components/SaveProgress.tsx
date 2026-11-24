"use client";
import { useEffect, useState } from "react";
import { EXERCISES } from "../content";
import { load, replaceAll, type Store } from "../lib/progress";
import { decode, encode, merge } from "../lib/progress-link";

const allKeys = () => EXERCISES.flatMap((e) => [e.id, `${e.id}~1`, `${e.id}~2`]);
const linkFor = (store: Store) => `${window.location.origin}/progress#save=${encode(store)}`;

/** Restore prompt, shown when the page is opened from a progress link. */
export function RestoreFromLink() {
  const [incoming, setIncoming] = useState<Store | null>(null);
  const [bad, setBad] = useState(false);
  const [done, setDone] = useState(0);
  useEffect(() => {
    const m = /#save=([^&]+)/.exec(window.location.hash);
    if (!m) return;
    const s = decode(decodeURIComponent(m[1]), allKeys());
    if (s) setIncoming(s);
    else setBad(true);
  }, []);
  const clearHash = () => history.replaceState(null, "", window.location.pathname);
  if (bad)
    return (
      <div className="save-card" role="status">
        <p>This progress link looks incomplete. Try copying the whole link again.</p>
        <button className="btn-quiet" type="button" onClick={() => { setBad(false); clearHash(); }}>OK</button>
      </div>
    );
  if (done) return <div className="save-card" role="status"><p><strong>Restored.</strong> {done} saved {done === 1 ? "problem is" : "problems are"} back on this device.</p></div>;
  if (!incoming) return null;
  const n = Object.keys(incoming).length;
  return (
    <div className="save-card" role="dialog" aria-label="Restore progress">
      <p><strong>Restore progress from this link?</strong> It has {n} saved {n === 1 ? "problem" : "problems"}. Anything already saved here is kept; where both have the same problem, the one with more progress wins.</p>
      <div className="actions">
        <button className="btn" type="button" onClick={() => { replaceAll(merge(load(), incoming)); setDone(n); clearHash(); }}>Restore</button>
        <button className="btn-quiet" type="button" onClick={() => { setIncoming(null); clearHash(); }}>Not now</button>
      </div>
    </div>
  );
}

/** Make a link that carries this device's progress, and send it somewhere safe. */
export function SaveProgress() {
  const [store, setStore] = useState<Store>({});
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    const refresh = () => setStore(load());
    refresh();
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
    window.addEventListener("bench-progress", refresh);
    return () => window.removeEventListener("bench-progress", refresh);
  }, []);
  const count = Object.values(store).filter((r) => r.attempts + r.hints > 0 || r.sawSolution).length;
  if (!count) return <p className="text-2">Nothing to save yet. Once you&apos;ve tried a problem, you can save a link here that brings your progress back on any device.</p>;
  const link = linkFor(store);
  const subject = "Practice Bench progress";
  const body = `My Practice Bench progress (${count} problems). Open this link to restore it:\n${link}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement("textarea");
      t.value = link;
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch {}
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="save">
      <p className="text-2">
        Progress is saved only in this browser. This link carries all {count} {count === 1 ? "problem" : "problems"} you&apos;ve tried: open it later, or on another phone or computer, to bring them back. It updates as you practise, so save a fresh one now and then.
      </p>
      <input className="save-link" readOnly value={link} aria-label="Your progress link" onFocus={(e) => e.currentTarget.select()} />
      <div className="actions">
        <button className="btn" type="button" onClick={copy}>{copied ? "Link copied" : "Copy link"}</button>
        <a className="btn-quiet save-btn" href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>Email it</a>
        <a className="btn-quiet save-btn" href={`sms:?&body=${encodeURIComponent(body)}`}>Text it</a>
        <a className="btn-quiet save-btn" href={`https://wa.me/?text=${encodeURIComponent(body)}`} target="_blank" rel="noopener">WhatsApp</a>
        {canShare && <button className="btn-quiet" type="button" onClick={() => navigator.share({ title: subject, text: body }).catch(() => {})}>Share…</button>}
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>The link holds only which problems were tried and how they went: no name, no account, nothing stored on a server.</p>
    </div>
  );
}
