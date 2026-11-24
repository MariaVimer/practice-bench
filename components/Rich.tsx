import { Fragment } from "react";

/** Tiny markup: [[3/4]] stacked fraction, **bold**, *italic*, blank line = new paragraph. */
function inline(text: string, key = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\[\[(-?\d+)\/(\d+)\]\]|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<span className="frac" key={`${key}-${i++}`} aria-label={`${m[1]} over ${m[2]}`}><span>{m[1]}</span><span>{m[2]}</span></span>);
    else if (m[3]) out.push(<strong key={`${key}-${i++}`}>{inline(m[3], i)}</strong>);
    else if (m[4]) out.push(<em key={`${key}-${i++}`}>{inline(m[4], i)}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Rich({ text, block = false }: { text: string; block?: boolean }) {
  if (!block) return <>{inline(text)}</>;
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{inline(p, i)}</p>
      ))}
    </>
  );
}
export { Fragment };
