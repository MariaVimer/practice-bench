"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EXERCISES } from "../content";
import { creditOf, keyOf, load, type Store } from "../lib/progress";
import { CLUSTERS, DOMAINS, type Cluster } from "../lib/types";
import { SectionHead } from "./Shell";

export function HomeList() {
  const [store, setStore] = useState<Store>({});
  useEffect(() => {
    const refresh = () => setStore(load());
    refresh();
    window.addEventListener("bench-progress", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bench-progress", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const clusters = (Object.keys(CLUSTERS) as Cluster[]).filter((c) => EXERCISES.some((e) => e.cluster === c));
  let n = 0;
  return (
    <>
      {clusters.map((c, ci) => (
        <section key={c} id={c} className="section">
          <SectionHead n={ci + 1} title={CLUSTERS[c].name} />
          <ul className="list">
            {EXERCISES.filter((e) => e.cluster === c).map((e) => {
              n++;
              const versions = [0, 1, 2].map((v) => store[keyOf(e.id, v)]).filter(Boolean);
              const best = versions.length ? Math.max(...versions.map((r) => creditOf(r!))) : null;
              const state = best === null ? "" : best >= 1 ? "solid" : best > 0 ? "solved" : "tried";
              const label = state === "solid" ? "first try ✓" : state === "solved" ? "solved" : state === "tried" ? "in progress" : "";
              return (
                <li key={e.id}>
                  <Link href={`/x/${e.id}`} className="row">
                    <span className="row-n">{String(n).padStart(2, "0")}</span>
                    <span>
                      <span className="row-title">{e.title}</span>
                      <span className="row-meta">
                        <span className="tag" data-k={e.source.kind}>{e.source.kind === "iReady" ? "i-Ready" : e.source.kind}</span>
                        {DOMAINS[e.domain]} · {e.skill}
                      </span>
                    </span>
                    <span className="row-state" data-s={state}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
