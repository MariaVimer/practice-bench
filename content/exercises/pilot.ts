import { type Frac, add, div, frac, mul, q, sub, show } from "../../lib/frac";
import type { Exercise } from "../../lib/types";

const n = (f: Frac) => show(f, { mixed: true });
const plural = (v: number, one: string, many = one + "s") => `${v} ${v === 1 ? one : many}`;

// ----------------------------------------------------------------------------------------------
// CML P 5-1 #5 — substitution on a balance (official answer 6)
type BalanceP = { a: number; b: number; c: number };
const plumsAndMelon: Exercise<BalanceP> = {
  id: "cml-p5-1-5",
  title: "Plums, cucumbers and a melon",
  source: { kind: "CML", ref: "P 5-1 #5", key: "official" },
  domain: "AAT",
  skill: "Equations by substitution",
  cluster: "equations",
  base: { a: 4, b: 2, c: 10 },
  variants: [
    { a: 5, b: 1, c: 11 },
    { a: 2, b: 3, c: 14 },
  ],
  official: [q(6)],
  solve: ({ a, b, c }) => {
    // independent: search whole-number weights (in plums) for the cucumber
    for (let cu = 1; cu <= 100; cu++) if (b * cu + (a + cu) === c) return [q(a + cu)];
    // fall back to exact algebra if the cucumber isn't a whole number of plums
    return [add(q(a), div(q(c - a), q(b + 1)))];
  },
  build: ({ a, b, c }) => {
    const cuc = div(q(c - a), q(b + 1));
    const mel = add(q(a), cuc);
    return {
      prompt: `**${plural(a, "plum")} plus 1 cucumber** weigh as much as **1 melon**. **${plural(b, "cucumber")} and 1 melon** weigh as much as **${plural(c, "plum")}**.\n\nHow many plums weigh as much as 1 melon?`,
      answer: { fields: [{ kind: "number", value: mel, unit: "plums" }] },
      answerText: `${n(mel)} plums`,
      hints: [
        "Both facts mention a melon. Fact one tells you exactly what a melon weighs. Could you trade the melon in fact two for that?",
        "After the trade, fact two has only cucumbers and plums. If you take the same number of plums away from *both* sides, they still weigh the same. What's left on each side?",
        "Now you know how many plums one cucumber is worth. Put that back into fact one.",
      ],
      solution: [
        `Fact one: 1 melon = ${plural(a, "plum")} + 1 cucumber.`,
        `Put that into fact two: ${plural(b, "cucumber")} + (${plural(a, "plum")} + 1 cucumber) = ${plural(c, "plum")}. So ${plural(b + 1, "cucumber")} + ${plural(a, "plum")} = ${plural(c, "plum")}.`,
        `Take ${plural(a, "plum")} off both sides: ${plural(b + 1, "cucumber")} = ${plural(c - a, "plum")}, so 1 cucumber = ${n(cuc)} plums.`,
        `Back to fact one: 1 melon = ${a} + ${n(cuc)} = **${n(mel)} plums**.`,
      ],
    };
  },
};

// ----------------------------------------------------------------------------------------------
// i-Ready Set 9 #6 — finding the whole from a percent (computed: 80)
type WholeP = { p: number; part: number };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const barrel: Exercise<WholeP> = {
  id: "ir-9-6",
  title: "Percent of what number?",
  source: { kind: "iReady", ref: "Set 9 #6 (p.15): 70% of what number is 56?", key: "computed" },
  domain: "AAT",
  skill: "Finding the whole",
  cluster: "percents",
  base: { p: 70, part: 56 },
  variants: [
    { p: 60, part: 45 },
    { p: 35, part: 42 },
  ],
  solve: ({ p, part }) => [div(q(part), q(p, 100))],
  build: ({ p, part }) => {
    const whole = div(q(part), q(p, 100));
    const band = gcd(p, 100);
    const nb = p / band;
    const each = div(q(part), q(nb));
    const all = 100 / band;
    return {
      prompt: `**${p}%** of what number is **${part}**?`,
      answer: { fields: [{ kind: "number", value: whole }] },
      answerText: n(whole),
      hints: [
        `${part} is ${p}% of the number you're looking for, not the whole number.`,
        `Split ${p}% into equal parts of ${band}%. How many parts is that, and how much is each part worth?`,
        `The whole number is 100%. How many ${band}% parts make 100%?`,
      ],
      solution: [
        `${p}% is ${nb} parts of ${band}%.`,
        `They share the ${part} equally: ${part} ÷ ${nb} = ${n(each)} for each ${band}%.`,
        `100% is ${all} parts: ${all} × ${n(each)} = **${n(whole)}**.`,
        `Check: ${p}% of ${n(whole)} = ${n(mul(q(p, 100), whole))} ✓`,
      ],
    };
  },
};

// ----------------------------------------------------------------------------------------------
// CML P 5-1 #4 — twice as far (official answer 21 & 33), multi-part, any order
type RailP = { A: number; B: number; r: number };
const times = (r: number) => (r === 2 ? "twice" : r === 3 ? "three times" : `${r} times`);
const twiceAsFar: Exercise<RailP> = {
  id: "cml-p5-1-4",
  title: "Twice as far",
  source: { kind: "CML", ref: "P 5-1 #4", key: "official" },
  domain: "NO",
  skill: "Distance on the number line",
  cluster: "negatives",
  base: { A: 15, B: 24, r: 2 },
  variants: [
    { A: 8, B: 20, r: 3 },
    { A: 4, B: 13, r: 2 },
  ],
  official: [q(21), q(33)],
  solve: ({ A, B, r }) => {
    // independent: scan the number line in quarter steps
    const hits: Frac[] = [];
    for (let i = -400; i <= 800; i++) {
      const x = q(i, 4);
      const dA = Math.abs(i / 4 - A), dB = Math.abs(i / 4 - B);
      if (Math.abs(dA - r * dB) < 1e-9) hits.push(x);
    }
    return hits;
  },
  build: ({ A, B, r }) => {
    const gap = B - A;
    const x1 = div(q(A + r * B), q(1 + r));
    const x2 = div(q(r * B - A), q(r - 1));
    const part = div(q(gap), q(r + 1));
    const beyond = div(q(gap), q(r - 1));
    return {
      prompt: `Find the two numbers that are **${times(r)} as far from ${A}** as they are **from ${B}**.`,
      answer: { anyOrder: true, fields: [{ kind: "number", value: x1 }, { kind: "number", value: x2 }] },
      answerText: `${n(x1)} and ${n(x2)}`,
      hints: [
        `Picture ${A} and ${B} on a number line. For any number, how far is it from ${A}, and how far from ${B}?`,
        `Try numbers between ${A} and ${B} first: the distance from ${A} has to be ${r} times the distance from ${B}.`,
        `Is there also a number bigger than ${B} that works? Past ${B}, a number is always ${gap} farther from ${A} than from ${B}.`,
      ],
      solution: [
        `${A} and ${B} are ${B} − ${A} = ${gap} apart.`,
        `Between them: cut ${gap} into ${r + 1} equal pieces of ${n(part)}. ${n(x1)} is ${n(sub(x1, q(A)))} from ${A} and ${n(sub(q(B), x1))} from ${B}, and ${n(sub(x1, q(A)))} = ${r} × ${n(sub(q(B), x1))} ✓`,
        `Past ${B}: if a number is d from ${B}, it is d + ${gap} from ${A}. So d + ${gap} = ${r}d, which gives d = ${n(beyond)}. That's ${n(x2)}: ${n(sub(x2, q(A)))} = ${r} × ${n(sub(x2, q(B)))} ✓`,
        `So the two numbers are **${n(x1)}** and **${n(x2)}**.`,
      ],
    };
  },
};

export const PILOT: Exercise[] = [plumsAndMelon, barrel, twiceAsFar];
void frac;
