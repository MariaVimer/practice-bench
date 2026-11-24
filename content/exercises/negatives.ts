// i-Ready Grade 6 At-Home Activity Packet, Sets 12–15: positive and negative numbers, comparing and
// ordering, absolute value, the four-quadrant coordinate plane. No teacher's key was attached, so every
// answer is computed here and re-checked independently in solve().

import { type Frac, q, sub } from "../../lib/frac";
import { parseNumber } from "../../lib/parse";
import type { Exercise, Source } from "../../lib/types";
import { coordPlane, numberLine } from "../../lib/diagram";

const UNVERIFIED = "No teacher's key attached; computed and checked in code.";
const src = (set: number, n: number, page: number): Source => ({ kind: "iReady", ref: `Set ${set} #${n} (p.${page})`, key: "computed", unverified: UNVERIFIED });

// ---------------------------------------------------------------- number text helpers
/** exact value of "−1 2/3", "-0.31", "2/3", "-200" */
const val = (s: string): Frac => {
  const v = parseNumber(s);
  if (!v) throw new Error(`bad number ${s}`);
  return v;
};
/** independent float reading (used by solve, never by build) */
function toFloat(s: string): number {
  const t = s.replace("−", "-").trim();
  const neg = t.startsWith("-");
  const body = neg ? t.slice(1) : t;
  let v: number;
  const mixed = /^(\d+) (\d+)\/(\d+)$/.exec(body);
  if (mixed) v = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  else if (body.includes("/")) {
    const [a, b] = body.split("/");
    v = Number(a) / Number(b);
  } else v = Number(body);
  return neg ? -v : v;
}
/** display markup: −1 [[2/3]], −[[3/4]], −0.1 */
function md(s: string): string {
  const t = s.trim();
  const neg = t.startsWith("-") || t.startsWith("−");
  const body = neg ? t.slice(1) : t;
  const sign = neg ? "−" : "";
  const mixed = /^(\d+) (\d+)\/(\d+)$/.exec(body);
  if (mixed) return `${sign}${mixed[1]} [[${mixed[2]}/${mixed[3]}]]`;
  if (body.includes("/")) return `${sign}[[${body}]]`;
  return `${sign}${body}`;
}
/** plain text (for choice options, labels, captions) */
const tx = (s: string) => s.trim().replace(/^-/, "−");
const fmt = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return (r < 0 ? "−" : "") + String(Math.abs(r));
};

// ---------------------------------------------------------------- Set 12
type GapP = { gap: number };
const ex12_1: Exercise<GapP> = {
  id: "ir-12-1",
  title: "Two opposite points",
  source: src(12, 1, 18),
  domain: "NO",
  skill: "Rational numbers & opposites",
  cluster: "negatives",
  base: { gap: 10 },
  variants: [{ gap: 14 }, { gap: 8 }],
  solve: ({ gap }) => {
    for (let x = 1; x <= 100; x++) if (x - -x === gap) return [q(x), q(-x)];
    return [];
  },
  build: ({ gap }) => {
    const h = gap / 2;
    return {
      diagram: numberLine({ min: -h - 1, max: h + 1, labels: "none", points: [{ at: -h }, { at: h }] }),
      prompt: `The points on the number line are **opposite numbers**. The tick marks are 1 unit apart.\n\nWhat number is the point to the right of 0? What number is the point to the left of 0?`,
      answer: { fields: [{ kind: "number", label: "right point", value: q(h) }, { kind: "number", label: "left point", value: q(-h) }] },
      answerText: `${h} and −${h}`,
      hints: [
        "Opposites are the same distance from 0, one on each side.",
        "So 0 sits exactly halfway between the two points.",
        "Split the distance between them into two equal parts. The right point is positive; the left one is negative.",
      ],
      solution: [`Opposites are equally far from 0, so 0 is halfway between them.`, `Half of ${gap} is ${h}.`, `The point on the right is **${h}** and the point on the left is **−${h}**.`],
    };
  },
};

const KINDS12 = ["whole number", "integer, not whole", "rational, not an integer"];
type SortP = { list: string[] };
const kindIndex = (s: string) => {
  const v = toFloat(s);
  if (!Number.isInteger(v)) return 2;
  return v < 0 ? 1 : 0;
};
const ex12_2: Exercise<SortP> = {
  id: "ir-12-2",
  title: "Sort the numbers",
  source: src(12, 2, 18),
  domain: "NO",
  skill: "Rational numbers & opposites",
  cluster: "negatives",
  base: { list: ["0", "4", "-2", "2/3", "-1.8", "16", "3.2", "-5/4"] },
  variants: [{ list: ["7", "-3", "0.5", "-9", "12", "-2/5", "0", "1 1/4"] }, { list: ["-6", "3/8", "9", "-0.7", "1", "-11", "5.5", "-7/3"] }],
  solve: ({ list }) => list.map((s) => q(kindIndex(s))),
  build: ({ list }) => {
    const pick = (s: string) => {
      const v = val(s);
      return v.d !== 1n ? 2 : v.n < 0n ? 1 : 0;
    };
    return {
      prompt: `Use this list of numbers: ${list.map(md).join(", ")}\n\nWhich numbers are rational numbers that are not integers? Of the remaining numbers, which are integers but not whole numbers? Of the remaining numbers, which are whole numbers? Sort each number.`,
      answer: { fields: list.map((s) => ({ kind: "choice" as const, label: tx(s), options: KINDS12, correct: pick(s) })) },
      answerText: list.map((s) => `${tx(s)}: ${KINDS12[pick(s)]}`).join("; "),
      hints: [
        "First ask: is it a whole step on the number line, or does it land between two ticks?",
        "Anything that lands between ticks (a fraction or decimal that isn't whole) is rational but not an integer.",
        "Of the numbers on a tick, the negative ones are integers but not whole numbers.",
      ],
      solution: [
        `Fractions and decimals between ticks: ${list.filter((s) => pick(s) === 2).map(tx).join(", ")} are rational, not integers.`,
        `Negative integers: ${list.filter((s) => pick(s) === 1).map(tx).join(", ")} are integers but not whole numbers.`,
        `What's left: ${list.filter((s) => pick(s) === 0).map(tx).join(", ")} are whole numbers.`,
      ],
    };
  },
};

const TERMS = ["whole numbers", "integers", "rational numbers"];
const DESCRIBE = [
  "The counting numbers and zero are …",
  "The counting numbers, their opposites, and zero are …",
  "Integers and the decimal equivalents of fractions are …",
];
type MatchP = { order: number[] };
const ex12_3: Exercise<MatchP> = {
  id: "ir-12-3",
  title: "Name the number family",
  source: src(12, 3, 18),
  domain: "NO",
  skill: "Rational numbers & opposites",
  cluster: "negatives",
  base: { order: [0, 1, 2] },
  variants: [{ order: [2, 0, 1] }, { order: [1, 2, 0] }],
  // independent: the family that each description defines, by which sample numbers it lets in
  solve: ({ order }) =>
    order.map((i) => {
      const lets = [[0, 3], [0, 3, -3], [0, 3, -3, 0.5]][i];
      return q(lets.length - 2);
    }),
  build: ({ order }) => ({
    prompt: `Complete each statement with *integers*, *rational numbers* or *whole numbers*. Use each term only once.\n\n${order.map((i, k) => `${k + 1}. ${DESCRIBE[i]}`).join("\n\n")}`,
    answer: { fields: order.map((i, k) => ({ kind: "choice" as const, label: `${k + 1}.`, options: TERMS, correct: i })) },
    answerText: order.map((i, k) => `${k + 1}. ${TERMS[i]}`).join("; "),
    hints: [
      "Each family contains the one before it: whole numbers sit inside integers, integers sit inside rational numbers.",
      "Which family is the first to include negative numbers?",
      "Which family is the first to include numbers between the tick marks, like halves?",
    ],
    solution: [
      "Counting numbers and zero (0, 1, 2, …) are the **whole numbers**.",
      "Add their opposites (−1, −2, …) and you get the **integers**.",
      "Add fractions and decimals too and you get the **rational numbers**.",
    ],
  }),
};

type OppP = { nums: number[] };
const ex12_4: Exercise<OppP> = {
  id: "ir-12-4",
  title: "Find the opposites",
  source: src(12, 4, 19),
  domain: "NO",
  skill: "Rational numbers & opposites",
  cluster: "negatives",
  base: { nums: [4, -3, 1] },
  variants: [{ nums: [6, -5, 2] }, { nums: [-7, 3, 8] }],
  solve: ({ nums }) => nums.map((v) => q(0 - v)),
  build: ({ nums }) => ({
    diagram: (() => { const r = Math.max(...nums.map(Math.abs)) + 1; return numberLine({ min: -r, max: r, labels: "none" }); })(),
    prompt: `Plot and label **${nums.map((v) => fmt(v)).join(", ")}** and their opposites on the number line.\n\nWhat are their opposites?`,
    answer: { fields: nums.map((v) => ({ kind: "number" as const, label: `opposite of ${fmt(v)}`, value: sub(q(0), q(v)) })) },
    answerText: nums.map((v) => `${fmt(v)} → ${fmt(-v)}`).join(", "),
    hints: [
      "An opposite is the same distance from 0, on the other side.",
      "Count how many ticks the point is from 0, then count the same number the other way.",
      "A positive number's opposite is negative, and a negative number's opposite is positive.",
    ],
    solution: [...nums.map((v) => `${fmt(v)} is ${Math.abs(v)} from 0, so its opposite is **${fmt(-v)}**.`)],
  }),
};

const FARTHEST = ["Yes, the farthest point is always the greatest", "No: a negative number can be far from 0 and still be the least", "Only when there are exactly three points", "Only if one of the points is 0"];
type FarP = { pts: number[] };
const ex12_5: Exercise<FarP> = {
  id: "ir-12-5",
  title: "Farthest means greatest?",
  source: src(12, 5, 19),
  domain: "NO",
  skill: "Rational numbers & opposites",
  cluster: "negatives",
  base: { pts: [-10, 2, 6] },
  variants: [{ pts: [-9, 3, 5] }, { pts: [-12, 4, 7] }],
  solve: ({ pts }) => {
    const far = pts.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a));
    const great = Math.max(...pts);
    return [q(far === great ? 0 : 1)];
  },
  build: ({ pts }) => {
    const far = pts.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a));
    return {
      prompt: `If several points are graphed on a number line, is the point that is the **farthest from 0** always the **greatest**?`,
      answer: { fields: [{ kind: "choice", options: FARTHEST, correct: far === Math.max(...pts) ? 0 : 1 }] },
      answerText: FARTHEST[1],
      hints: [
        "Which of the three points is farthest from 0? Count ticks, ignoring the sign.",
        "Which one is greatest? Greater numbers are farther to the right.",
        "Are those the same point?",
      ],
      solution: [`Try ${pts.map(fmt).join(", ")}: ${fmt(far)} is farthest from 0 (${Math.abs(far)} ticks away).`, `But the greatest is ${fmt(Math.max(...pts))}, the one farthest right.`, `So no: **a negative number can be far from 0 and still be the least.**`],
    };
  },
};

// ---------------------------------------------------------------- Set 13: compare (#1–9)
type CmpP = { a: string; b: string };
const CMP_ITEMS: { n: number; base: CmpP; v: [CmpP, CmpP] }[] = [
  { n: 1, base: { a: "7", b: "10" }, v: [{ a: "9", b: "4" }, { a: "13", b: "15" }] },
  { n: 2, base: { a: "7", b: "-10" }, v: [{ a: "-6", b: "3" }, { a: "8", b: "-12" }] },
  { n: 3, base: { a: "-7", b: "-10" }, v: [{ a: "-4", b: "-2" }, { a: "-9", b: "-15" }] },
  { n: 4, base: { a: "2/3", b: "-1 2/3" }, v: [{ a: "-3/4", b: "1/4" }, { a: "1 1/2", b: "-2 1/2" }] },
  { n: 5, base: { a: "-50", b: "0.3" }, v: [{ a: "0.8", b: "-40" }, { a: "-25", b: "0.1" }] },
  { n: 6, base: { a: "-12", b: "-35" }, v: [{ a: "-28", b: "-16" }, { a: "-11", b: "-30" }] },
  { n: 7, base: { a: "-5", b: "4.5" }, v: [{ a: "3.5", b: "-6" }, { a: "-2", b: "1.5" }] },
  { n: 8, base: { a: "1/2", b: "-80" }, v: [{ a: "-45", b: "1/3" }, { a: "3/4", b: "-30" }] },
  { n: 9, base: { a: "-1/4", b: "-1.4" }, v: [{ a: "-2.5", b: "-1/2" }, { a: "-3/4", b: "-1.25" }] },
];
const compares: Exercise<CmpP>[] = CMP_ITEMS.map(({ n, base, v }) => ({
  id: `ir-13-${n}`,
  title: `Which is greater? (${n})`,
  source: src(13, n, 20),
  domain: "NO",
  skill: "Comparing & ordering",
  cluster: "negatives",
  base,
  variants: v,
  solve: ({ a, b }) => [q(toFloat(a) < toFloat(b) ? 0 : 1)],
  build: ({ a, b }) => {
    const less = val(a).n * val(b).d < val(b).n * val(a).d;
    const sign = less ? "<" : ">";
    const [lo, hi] = less ? [a, b] : [b, a];
    return {
      prompt: `Which sign makes this true?\n\n**${md(a)}  ◯  ${md(b)}**`,
      answer: { fields: [{ kind: "choice", options: ["<", ">"], correct: less ? 0 : 1 }] },
      answerText: `${tx(a)} ${sign} ${tx(b)}`,
      hints: [
        "Picture both numbers on a number line.",
        "On a number line, numbers get greater as you move to the right.",
        "For two negatives, the one closer to 0 is farther right.",
      ],
      solution: [`${tx(lo)} is to the left of ${tx(hi)} on the number line.`, `Farther right means greater, so **${tx(a)} ${sign} ${tx(b)}**.`],
    };
  },
}));

// ---------------------------------------------------------------- Set 13: order (#10–18)
type OrdP = { list: string[] };
const ORD_ITEMS: { n: number; base: string[]; v: [string[], string[]] }[] = [
  { n: 10, base: ["5", "-2", "-1", "4"], v: [["3", "-4", "6", "-1"], ["-5", "2", "0", "-3"]] },
  { n: 11, base: ["3.4", "7", "-3.5", "-3"], v: [["2.5", "-2.6", "6", "-2"], ["-4.5", "1.2", "-4", "5"]] },
  { n: 12, base: ["-2.1", "-2", "-3", "0"], v: [["-1.5", "-1", "-4", "0"], ["-5", "-3.2", "-3", "1"]] },
  { n: 13, base: ["-3/4", "-2", "-1/4", "2"], v: [["-1/3", "-3", "-2/3", "1"], ["3", "-1/2", "-4", "-1/5"]] },
  { n: 14, base: ["5", "0", "-6", "-0.1"], v: [["-0.5", "4", "-7", "0"], ["0", "-0.2", "8", "-3"]] },
  { n: 15, base: ["7.5", "-200", "-1.5", "-8"], v: [["-9", "6.5", "-2.5", "-40"], ["-1.5", "-30", "3.5", "-6"]] },
  { n: 16, base: ["1/2", "-1/2", "-1/3", "1/3"], v: [["-1/4", "1/5", "-1/5", "1/4"], ["2/3", "-3/4", "3/4", "-2/3"]] },
  { n: 17, base: ["1.2", "-2.1", "-21", "0.12"], v: [["-3.4", "0.34", "-34", "3.4"], ["-15", "1.5", "-1.5", "0.15"]] },
  { n: 18, base: ["0.1", "-0.2", "0.55", "-0.31"], v: [["-0.4", "0.25", "-0.15", "0.3"], ["0.6", "-0.45", "-0.5", "0.05"]] },
];
const LABELS = ["least", "2nd", "3rd", "greatest"];
const orders: Exercise<OrdP>[] = ORD_ITEMS.map(({ n, base, v }) => ({
  id: `ir-13-${n}`,
  title: `Line them up (${n})`,
  source: src(13, n, 20),
  domain: "NO",
  skill: "Comparing & ordering",
  cluster: "negatives",
  base: { list: base },
  variants: [{ list: v[0] }, { list: v[1] }],
  solve: ({ list }) => [...list].sort((x, y) => toFloat(x) - toFloat(y)).map((v) => q(list.indexOf(v))),
  build: ({ list }) => {
    const sorted = [...list].sort((x, y) => {
      const a = val(x), b = val(y);
      const l = a.n * b.d, r = b.n * a.d;
      return l < r ? -1 : l > r ? 1 : 0;
    });
    return {
      prompt: `Write these numbers in order from **least** to **greatest**:\n\n**${list.map(md).join(",  ")}**`,
      answer: { fields: sorted.map((s, i) => ({ kind: "choice" as const, label: LABELS[i], options: list.map(tx), correct: list.indexOf(s) })) },
      answerText: sorted.map(tx).join(", "),
      hints: [
        "Split them into negatives, zero, and positives first. Every negative is less than every positive.",
        "Among the negatives, the one farthest from 0 is the least.",
        "If decimals or fractions are mixed, compare how far each is from 0 before putting the sign back.",
      ],
      solution: [`Negatives first, farthest from 0 first; then positives from smallest up.`, `Least to greatest: **${sorted.map(tx).join(", ")}**.`],
    };
  },
}));

// ---------------------------------------------------------------- Set 13 #19
type NegP = { a: number; b: number };
const RULES = ["The one closer to 0 is greater", "The one farther from 0 is greater", "The one with the bigger digits is greater", "Negative numbers can't be compared"];
const ex13_19: Exercise<NegP> = {
  id: "ir-13-19",
  title: "Two negatives",
  source: src(13, 19, 20),
  domain: "NO",
  skill: "Comparing & ordering",
  cluster: "negatives",
  base: { a: -3, b: -8 },
  variants: [{ a: -12, b: -5 }, { a: -6, b: -15 }],
  // independent: the rule that agrees with the number line, then which written example is true
  solve: ({ a, b }) => [q(RULES.findIndex((r) => r.includes("closer"))), q(a > b ? 0 : 1)],
  build: ({ a, b }) => {
    const g = Math.max(a, b);
    return {
      prompt: `How can you tell which of two negative numbers is greater? Pick the rule, then pick an example that shows it.`,
      answer: { fields: [{ kind: "choice", label: "rule", options: RULES, correct: 0 }, { kind: "choice", label: "example", options: [`${fmt(a)} > ${fmt(b)}`, `${fmt(b)} > ${fmt(a)}`], correct: a > b ? 0 : 1 }] },
      answerText: `${fmt(g)}; the one closer to 0 is greater`,
      hints: ["Picture a thermometer below zero. Which temperature is warmer?", "On a number line, which of the two is farther right?", "Is the farther-right negative closer to 0 or farther from 0?"],
      solution: [`${fmt(g)} is closer to 0, so it sits to the right.`, `Right means greater: **${fmt(g)}** is greater.`, `Rule: of two negatives, **the one closer to 0 is greater**.`],
    };
  },
};

// ---------------------------------------------------------------- Set 14
type AbsP = { a: number; b: number };
const ex14_1: Exercise<AbsP> = {
  id: "ir-14-1",
  title: "Greater, or farther?",
  source: src(14, 1, 21),
  domain: "NO",
  skill: "Absolute value",
  cluster: "negatives",
  base: { a: -9, b: -4 },
  variants: [{ a: -11, b: -6 }, { a: -2, b: -7 }],
  solve: ({ a, b }) => [q(a > b ? 0 : 1), q(Math.abs(a) > Math.abs(b) ? 0 : 1)],
  build: ({ a, b }) => ({
    diagram: numberLine({ min: Math.min(a, b, 0) - 1, max: Math.max(a, b, 0) + 1, labels: [a, b, 0], points: [{ at: a }, { at: b }] }),
    prompt: `Answer the questions about this number line.\n\nWhich is greater, **${fmt(a)}** or **${fmt(b)}**?\n\nWhich is greater, **|${fmt(a)}|** or **|${fmt(b)}|**?`,
    answer: {
      fields: [
        { kind: "choice", label: `${fmt(a)} or ${fmt(b)}`, options: [fmt(a), fmt(b)], correct: a > b ? 0 : 1 },
        { kind: "choice", label: `|${fmt(a)}| or |${fmt(b)}|`, options: [`|${fmt(a)}|`, `|${fmt(b)}|`], correct: Math.abs(a) > Math.abs(b) ? 0 : 1 },
      ],
    },
    answerText: `${fmt(Math.max(a, b))} is greater; |${fmt(Math.abs(a) > Math.abs(b) ? a : b)}| is greater`,
    hints: ["Greater means farther right on the number line.", "Absolute value is just distance from 0, so it is never negative.", "The two questions can have different winners."],
    solution: [`${fmt(Math.max(a, b))} is farther right, so it's the greater number.`, `|${fmt(a)}| = ${Math.abs(a)} and |${fmt(b)}| = ${Math.abs(b)}, so |${fmt(Math.abs(a) > Math.abs(b) ? a : b)}| is greater.`],
  }),
};

const BETTER = ["Which play has the greatest absolute value?", "Which play is the greatest number?", "Which play is positive?", "Which play came first?"];
type PlaysP = { plays: number[]; big: number };
const ex14_2: Exercise<PlaysP> = {
  id: "ir-14-2",
  title: "The biggest play",
  source: src(14, 2, 21),
  domain: "NO",
  skill: "Absolute value",
  cluster: "negatives",
  base: { plays: [2, -1, 4, 3, -5], big: 4 },
  variants: [{ plays: [3, -2, 5, -7, 1], big: 5 }, { plays: [-8, 6, 1, -4, 2], big: 6 }],
  solve: ({ plays, big }) => {
    let g = -Infinity;
    for (const p of plays) if (p > g) g = p;
    const bigs = plays.filter((p) => p * p > big * big);
    return [q(g), q(BETTER.findIndex((s) => s.includes("absolute"))), q(bigs[0])];
  },
  build: ({ plays, big }) => {
    const g = Math.max(...plays);
    const bp = plays.find((p) => Math.abs(p) > big)!;
    return {
      prompt: `A football team's first five plays moved the ball **${plays.map(fmt).join(", ")}** yards (negative means backward).\n\nWhich number in the list is the greatest? What is a better question to ask to find out which play went the farthest from where the team started? The coach calls any play that moves the team more than **${big} yards** from where they started a *big play*. Which play(s) are big plays?`,
      answer: {
        fields: [
          { kind: "number", label: "greatest number", value: q(g) },
          { kind: "choice", label: "better question", options: BETTER, correct: 0 },
          { kind: "number", label: "big play(s)", value: q(bp) },
        ],
      },
      answerText: `${g}; which play has the greatest absolute value; ${fmt(bp)}`,
      hints: ["Greatest means farthest right on a number line, not farthest from the start.", "How far a play went doesn't care about direction. Which tool measures distance from 0?", "Compare each play's distance from 0 with the big-play limit. Moving backward counts too."],
      solution: [`Greatest number: **${g}**.`, `How far a play went is its distance from 0, so ask **which play has the greatest absolute value**.`, `|${fmt(bp)}| = ${Math.abs(bp)}, more than ${big}: the big play is **${fmt(bp)}**.`],
    };
  },
};

type WhenP = { scene: number };
const SCENES = [
  {
    prompt: "When does it make sense to compare the **absolute values** of numbers instead of the numbers themselves?",
    options: ["When only the size or distance matters, not the direction", "When you want to know which number is farther right", "Whenever both numbers are positive", "Never: absolute values can't be compared"],
    correct: 0,
    pts: [-6, 4],
  },
  {
    prompt: "A diver is at **−12 m** and a bird is at **9 m** above the water. Which question needs absolute value?",
    options: ["Which one is farther from the water's surface?", "Which one is higher up?", "Which one is below the surface?", "Which one moved first?"],
    correct: 0,
    pts: [-12, 9],
  },
  {
    prompt: "One account is at **−$15** and another at **$10**. Which question needs absolute value?",
    options: ["Which account has more money in it?", "Which balance is bigger in size, owed or saved?", "Which account is positive?", "Which account was opened first?"],
    correct: 1,
    pts: [-15, 10],
  },
];
const ex14_3: Exercise<WhenP> = {
  id: "ir-14-3",
  title: "When to use absolute value",
  source: src(14, 3, 21),
  domain: "NO",
  skill: "Absolute value",
  cluster: "negatives",
  base: { scene: 0 },
  variants: [{ scene: 1 }, { scene: 2 }],
  solve: ({ scene }) => [q(SCENES[scene].options.findIndex((o) => /farther|size/.test(o)))],
  build: ({ scene }) => {
    const s = SCENES[scene];
    return {
      prompt: s.prompt,
      answer: { fields: [{ kind: "choice", options: s.options, correct: s.correct }] },
      answerText: s.options[s.correct],
      hints: ["Absolute value measures distance from 0 and ignores the sign.", "Does the question care about up or down, owed or saved? Or only how much?", "Pick the question that would have the same answer if you flipped every sign."],
      solution: ["Absolute value throws away direction and keeps only distance from 0.", `So use it when only size matters: **${s.options[s.correct]}**`],
    };
  },
};

// ---------------------------------------------------------------- Set 15 coordinate plane (11 × 11 board, origin at hole 5,5)
const pt = (x: number, y: number) => `(${fmt(x)}, ${fmt(y)})`;
const QUADS = ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV", "x-axis", "y-axis"];
const quadOf = (x: number, y: number) => (y === 0 ? 4 : x === 0 ? 5 : x > 0 ? (y > 0 ? 0 : 3) : y > 0 ? 1 : 2);

type QP = { name: string; x: number; y: number };
const Q_ITEMS: { n: number; base: QP; v: [QP, QP] }[] = [
  { n: 1, base: { name: "A", x: -3, y: -2 }, v: [{ name: "A", x: -4, y: -1 }, { name: "A", x: -2, y: -5 }] },
  { n: 2, base: { name: "B", x: 4, y: -4 }, v: [{ name: "B", x: 2, y: -3 }, { name: "B", x: 5, y: -1 }] },
  { n: 3, base: { name: "C", x: 2, y: 3 }, v: [{ name: "C", x: 4, y: 1 }, { name: "C", x: 1, y: 5 }] },
  { n: 4, base: { name: "D", x: -2, y: 4 }, v: [{ name: "D", x: -5, y: 2 }, { name: "D", x: -1, y: 3 }] },
  { n: 5, base: { name: "E", x: 3, y: -3 }, v: [{ name: "E", x: 1, y: -4 }, { name: "E", x: 4, y: -2 }] },
  { n: 6, base: { name: "F", x: 4, y: 0 }, v: [{ name: "F", x: 0, y: -3 }, { name: "F", x: -2, y: 0 }] },
];
const quads: Exercise<QP>[] = Q_ITEMS.map(({ n, base, v }) => ({
  id: `ir-15-${n}`,
  title: `Where is point ${base.name}?`,
  source: src(15, n, 22),
  domain: "NO",
  skill: "Coordinate plane",
  cluster: "negatives",
  base,
  variants: v,
  solve: ({ x, y }) => {
    // independent: the quadrant/axis from the angle of the point
    if (x === 0 && y === 0) return [q(-1)];
    if (y === 0) return [q(4)];
    if (x === 0) return [q(5)];
    const deg = (Math.atan2(y, x) * 180) / Math.PI;
    return [q(deg > 0 && deg < 90 ? 0 : deg > 90 ? 1 : deg < -90 ? 2 : 3)];
  },
  build: ({ name, x, y }) => {
    const qd = quadOf(x, y);
    return {
      diagram: coordPlane({}),
      prompt: `Plot **${name}${pt(x, y)}**. Which quadrant is it in, or is it on an axis?`,
      answer: { fields: [{ kind: "choice", options: QUADS, correct: qd }] },
      answerText: QUADS[qd],
      hints: ["Start at the origin. The first number moves you left or right; the second moves you up or down.", "Quadrant I is upper right; the numbering goes counterclockwise: II upper left, III lower left, IV lower right.", "If one of the coordinates is 0, the point sits on an axis, not in a quadrant."],
      solution: [`x = ${fmt(x)}: ${x > 0 ? "right" : x < 0 ? "left" : "no move left or right"}. y = ${fmt(y)}: ${y > 0 ? "up" : y < 0 ? "down" : "no move up or down"}.`, `So ${name} is ${qd >= 4 ? "on the" : "in"} **${QUADS[qd]}**.`],
    };
  },
}));

type ReflP = { name: string; x: number; y: number; axis: "x" | "y" };
const ex15_7: Exercise<ReflP> = {
  id: "ir-15-7",
  title: "Flip it across an axis",
  source: src(15, 7, 22),
  domain: "NO",
  skill: "Coordinate plane",
  cluster: "negatives",
  base: { name: "E", x: 3, y: -3, axis: "x" },
  variants: [{ name: "P", x: -4, y: 2, axis: "x" }, { name: "R", x: 5, y: -1, axis: "y" }],
  solve: ({ x, y, axis }) => (axis === "x" ? [q(x), q(0 - y)] : [q(0 - x), q(y)]),
  build: ({ name, x, y, axis }) => {
    const [rx, ry] = axis === "x" ? [x, -y] : [-x, y];
    return {
      diagram: coordPlane({}),
      prompt: `Point **${name}${pt(x, y)}** is reflected across the **${axis}-axis**. What are the coordinates of its reflection?`,
      answer: { fields: [{ kind: "point", label: "reflection", x: q(rx), y: q(ry) }] },
      answerText: pt(rx, ry),
      hints: [`Reflecting across the ${axis}-axis is like folding the grid along that axis.`, `The point stays the same distance from the ${axis}-axis, just on the other side.`, `Only one coordinate changes: the one that measures distance ${axis === "x" ? "up or down" : "left or right"}. It flips its sign.`],
      solution: [`Across the ${axis}-axis, the ${axis === "x" ? "y" : "x"}-coordinate flips sign and the other stays.`, `${pt(x, y)} → **${pt(rx, ry)}**.`],
    };
  },
};

type CandP = { pts: { name: string; x: number; y: number }[] };
const ex15_8: Exercise<CandP> = {
  id: "ir-15-8",
  title: "Which flip lands in Quadrant II?",
  source: src(15, 8, 22),
  domain: "NO",
  skill: "Coordinate plane",
  cluster: "negatives",
  base: { pts: [{ name: "A", x: -3, y: -2 }, { name: "B", x: 4, y: -4 }, { name: "C", x: 2, y: 3 }, { name: "D", x: -2, y: 4 }, { name: "E", x: 3, y: -3 }, { name: "F", x: 4, y: 0 }] },
  variants: [
    { pts: [{ name: "P", x: 1, y: -4 }, { name: "Q", x: -5, y: -1 }, { name: "R", x: 3, y: 2 }] },
    { pts: [{ name: "G", x: 4, y: 1 }, { name: "H", x: -1, y: -3 }, { name: "J", x: 2, y: -5 }] },
  ],
  solve: ({ pts }) => {
    // independent: try both single reflections of every point, keep the first that lands in Quadrant II
    for (const pnt of pts) for (const [fx, fy] of [[1, -1], [-1, 1]]) {
      const x = pnt.x * fx, y = pnt.y * fy;
      if (x < 0 && y > 0) return [q(x), q(y)];
    }
    throw new Error("no reflection lands in Quadrant II");
  },
  build: ({ pts }) => {
    // every single reflection (across the x-axis or the y-axis) that lands in Quadrant II
    const found: { x: number; y: number; from: string; axis: string }[] = [];
    for (const pnt of pts) {
      const xr = { x: pnt.x, y: -pnt.y, from: `${pnt.name}${pt(pnt.x, pnt.y)}`, axis: "x" };
      const yr = { x: -pnt.x, y: pnt.y, from: `${pnt.name}${pt(pnt.x, pnt.y)}`, axis: "y" };
      for (const r of [xr, yr]) if (r.x < 0 && r.y > 0 && !found.some((f) => f.x === r.x && f.y === r.y)) found.push(r);
    }
    const [first, ...rest] = found;
    return {
      diagram: coordPlane({ points: pts.map((p) => ({ x: p.x, y: p.y, label: p.name })) }),
      prompt: `Here are some points: **${pts.map((p) => `${p.name}${pt(p.x, p.y)}`).join(", ")}**.\n\nImagine that one of these points has been reflected. The reflection is in **Quadrant II**. What are the possible coordinates of the reflected point?`,
      answer: { fields: [{ kind: "point", label: "One possible point", x: q(first.x), y: q(first.y), alts: rest.map((r) => [q(r.x), q(r.y)] as [Frac, Frac]) }] },
      answerText: found.map((f) => pt(f.x, f.y)).join(" or "),
      hints: [
        "Quadrant II is the upper left: x is negative and y is positive.",
        "Reflecting across the x-axis changes the sign of y. Reflecting across the y-axis changes the sign of x.",
        "Try each point: does one flip of a sign put it in the upper left?",
      ],
      solution: [
        ...found.map((f) => `${f.from} reflected across the ${f.axis}-axis is ${pt(f.x, f.y)}, which is in Quadrant II.`),
        `So the reflected point could be **${found.map((f) => pt(f.x, f.y)).join("** or **")}**. Any of these is correct.`,
      ],
    };
  },
};

type TwoP = { name: string; x: number; y: number; claim: string; cx: number; cy: number };
const ex15_9: Exercise<TwoP> = {
  id: "ir-15-9",
  title: "Two flips",
  source: src(15, 9, 22),
  domain: "NO",
  skill: "Coordinate plane",
  cluster: "negatives",
  base: { name: "B", x: 4, y: -4, claim: "D", cx: -2, cy: 4 },
  variants: [{ name: "P", x: 3, y: -2, claim: "Q", cx: -3, cy: 2 }, { name: "M", x: -1, y: -5, claim: "N", cx: 1, cy: -5 }],
  solve: ({ x, y, cx, cy }) => {
    const ax = 0 - x, ay = 0 - y; // y-axis flip negates x, x-axis flip negates y
    return [q(ax === cx && ay === cy ? 0 : 1)];
  },
  build: ({ name, x, y, claim, cx, cy }) => {
    const [mx, my] = [-x, y];
    const [fx, fy] = [mx, -my];
    const right = fx === cx && fy === cy;
    return {
      diagram: coordPlane({}),
      prompt: `Bradley says that if point **${name}${pt(x, y)}** is reflected across the **y-axis** and its reflection is then reflected across the **x-axis**, the result is point **${claim}${pt(cx, cy)}**.\n\nIs Bradley correct?`,
      answer: { fields: [{ kind: "choice", label: "Bradley is", options: ["correct", "not correct"], correct: right ? 0 : 1 }] },
      answerText: `Bradley is ${right ? "correct" : "not correct"}; it ends up at ${pt(fx, fy)}`,
      hints: ["Do one flip at a time and write down the point after each.", "Across the y-axis, the x-coordinate changes sign. Across the x-axis, the y-coordinate does.", `Compare where you land with ${claim}${pt(cx, cy)}.`],
      solution: [`Across the y-axis: ${pt(x, y)} → ${pt(mx, my)}.`, `Across the x-axis: ${pt(mx, my)} → **${pt(fx, fy)}**.`, `${pt(fx, fy)} ${right ? "is" : "is not"} ${claim}${pt(cx, cy)}, so Bradley is **${right ? "right" : "wrong"}**.`],
    };
  },
};

export const NEGATIVES: Exercise[] = [ex12_1, ex12_2, ex12_3, ex12_4, ex12_5, ...compares, ...orders, ex13_19, ex14_1, ex14_2, ex14_3, ...quads, ex15_7, ex15_8, ex15_9];
