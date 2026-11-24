// Progress ⇄ shareable link. The code rides in the URL hash (#save=…), so it never reaches a server.
// Format "1." + base64url of 5-byte entries: 3-byte FNV-1a hash of the record key, then
// 11 bits of state: attempts (5) · hints (2) · firstTry (2: none/false/true) · solved (1) · sawSolution (1).

import type { Record as Rec, Store } from "./progress";

export const fnv24 = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) & 0xffffff;
};

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

export function encode(store: Store): string {
  const entries = Object.entries(store).filter(([, r]) => r.attempts + r.hints > 0 || r.sawSolution);
  const bytes = new Uint8Array(entries.length * 5);
  entries.forEach(([key, r], i) => {
    const h = fnv24(key);
    const ft = r.firstTry === null ? 0 : r.firstTry ? 2 : 1;
    const bits = (Math.min(31, r.attempts) << 6) | (Math.min(3, r.hints) << 4) | (ft << 2) | ((r.solved ? 1 : 0) << 1) | (r.sawSolution ? 1 : 0);
    bytes.set([h >> 16, (h >> 8) & 255, h & 255, bits >> 8, bits & 255], i * 5);
  });
  return "1." + b64url(bytes);
}

/** keys: every record key the site knows (id, id~1, id~2), to turn hashes back into keys */
export function decode(code: string, keys: string[]): Store | null {
  const m = /^1\.([A-Za-z0-9_-]*)$/.exec(code.trim());
  if (!m) return null;
  let bytes: Uint8Array;
  try {
    bytes = unb64url(m[1]);
  } catch {
    return null;
  }
  if (bytes.length % 5) return null;
  const byHash = new Map(keys.map((k) => [fnv24(k), k]));
  const out: Store = {};
  for (let i = 0; i < bytes.length; i += 5) {
    const key = byHash.get((bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]);
    if (!key) continue; // a problem this version of the site doesn't have
    const bits = (bytes[i + 3] << 8) | bytes[i + 4];
    const ft = (bits >> 2) & 3;
    out[key] = { attempts: bits >> 6, hints: (bits >> 4) & 3, firstTry: ft === 0 ? null : ft === 2, solved: !!((bits >> 1) & 1), sawSolution: !!(bits & 1), updated: Date.now() };
  }
  return out;
}

/** Keep whichever record shows more progress. */
export function merge(here: Store, incoming: Store): Store {
  const out: Store = { ...here };
  const weight = (r: Rec) => (r.solved ? 1000 : 0) + r.attempts * 4 + r.hints;
  for (const [k, r] of Object.entries(incoming)) if (!out[k] || weight(r) > weight(out[k])) out[k] = r;
  return out;
}
