import type { AnswerSpec } from "./check";

export type Domain = "NO" | "AAT" | "MD" | "G";
export const DOMAINS: Record<Domain, string> = {
  NO: "Number & Operations",
  AAT: "Algebra & Algebraic Thinking",
  MD: "Measurement & Data",
  G: "Geometry",
};

/** Topic sections on the Bench. */
export type Cluster = "rates" | "percents" | "fracdiv" | "negatives" | "equations" | "logic" | "shapes" | "data";
export const CLUSTERS: Record<Cluster, { name: string }> = {
  rates: { name: "Ratios & rates" },
  percents: { name: "Percents & parts of a whole" },
  fracdiv: { name: "Fraction division" },
  negatives: { name: "Negative numbers & the number line" },
  equations: { name: "Equations & expressions" },
  logic: { name: "Logic puzzles" },
  shapes: { name: "Area, perimeter & volume" },
  data: { name: "Statistics" },
};

export type SourceKind = "CML" | "iReady";
/** Where the answer comes from. */
export type KeySource = "official" | "answer-bank" | "computed";

export interface Source {
  kind: SourceKind;
  /** e.g. "P 5-1 #5", "Set 9 #6 (p.15)" */
  ref: string;
  key: KeySource;
  /** set when the answer couldn't be checked against an official key */
  unverified?: string;
}

/** Inline markup used in prompts, hints and solutions:  [[3/4]] renders a stacked fraction,
 *  *word* renders italic, **word** renders bold. */
export type Rich = string;

export interface Built {
  prompt: Rich;
  answer: AnswerSpec;
  hints: [Rich, Rich, Rich];
  solution: Rich[];
  /** what the answer looks like when shown, e.g. "6 plums" */
  answerText: string;
  /** the figure or table the original question shows, drawn with this version's numbers */
  diagram?: import("./diagram").Diagram;
  /** unscored reflection card: no answer fields; `sample` is shown on request */
  reflection?: { sample: Rich };
}

export interface Exercise<P = any> {
  id: string;
  title: string;
  source: Source;
  domain: Domain;
  skill: string;
  cluster: Cluster;
  base: P;
  variants: [P, P];
  build: (p: P) => Built;
  /** independent re-computation of the answer (exact), used by scripts/verify.ts */
  solve: (p: P) => import("./frac").Frac[];
  /** other source refs for the same problem (e.g. a word-for-word duplicate) */
  alsoIn?: string[];
  /** the official/printed answer for the base item, when one exists */
  official?: import("./frac").Frac[];
}
