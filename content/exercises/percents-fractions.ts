// i-Ready Grade 6 At-Home Activity Packet, Sets 7–11: percents and fraction division.
// ir-9-6 lives in pilot.ts.

import { type Frac, add, cmp, div, eq, mul, q, sub } from "../../lib/frac";
import type { Built, Exercise, Source } from "../../lib/types";
import { fr, n, plural } from "../../lib/text";
import * as Fig from "../diagrams/iready";

const UNVERIFIED = "No teacher's key attached; computed and checked in code.";
const src = (ref: string, key: Source["key"] = "computed"): Source => (key === "computed" ? { kind: "iReady", ref, key, unverified: UNVERIFIED } : { kind: "iReady", ref, key });
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** mixed number markup for prompts: 1 [[1/3]] */
const mx = (f: Frac) => {
  if (f.d === 1n || f.n < f.d) return fr(f);
  const w = f.n / f.d;
  const r = f.n % f.d;
  return r === 0n ? String(w) : `${w} [[${r}/${f.d}]]`;
};

// independent re-derivations (not the build formula)
/** part by counting bands */
const partByBands = (p: number, w: Frac) => {
  let total = q(0);
  const slice = div(w, q(100)); // 1%
  for (let i = 0; i < p; i++) total = add(total, slice);
  return total;
};
/** whole by searching for the number whose p% is the part */
const wholeBySearch = (p: number, part: Frac) => {
  for (let w = 1; w <= 200000; w++) if (eq(mul(q(w), q(p, 100)), part)) return q(w);
  return div(part, q(p, 100));
};

// ------------------------------------------------------------------ Set 7  Understanding Percents (p.13)
type Save = { goal: number; p: number };
const s7_1: Exercise<Save> = {
  id: "ir-7-1",
  title: "Saving for a bike",
  source: src("Set 7 #1 (p.13)"),
  domain: "AAT",
  skill: "Percent concepts",
  cluster: "percents",
  base: { goal: 300, p: 60 },
  variants: [{ goal: 250, p: 40 }, { goal: 360, p: 75 }],
  solve: ({ goal, p }) => [partByBands(p, q(goal))],
  build: ({ goal, p }) => {
    const part = mul(q(p, 100), q(goal));
    const step = p % 10 === 0 ? 10 : 5;
    const one = div(q(goal), q(100 / step));
    return {
      diagram: Fig.savingsBar(goal),
      prompt: `Ana is saving for a bike that costs **$${goal}**. So far she has saved **${p}%** of the money.\n\nHow many dollars has she saved?`,
      answer: { fields: [{ kind: "number", value: part, unit: "dollars", prefix: "$" }] },
      answerText: `$${n(part)}`,
      hints: [
        `${p}% means ${p} out of every 100. Here the whole is the bike's price.`,
        `Find ${step}% of $${goal} first: split it into ${100 / step} equal parts.`,
        `${p}% is ${p / step} of those ${step}% parts.`,
      ],
      solution: [`${step}% of $${goal} is $${goal} ÷ ${100 / step} = $${n(one)}.`, `${p}% is ${p / step} of those: ${p / step} × $${n(one)} = **$${n(part)}**.`],
    };
  },
};

type Left = { total: number; p: number };
const s7_2: Exercise<Left> = {
  id: "ir-7-2",
  title: "Drawings still to do",
  source: src("Set 7 #2 (p.13)"),
  domain: "AAT",
  skill: "Percent concepts",
  cluster: "percents",
  base: { total: 80, p: 40 },
  variants: [{ total: 60, p: 35 }, { total: 120, p: 55 }],
  solve: ({ total, p }) => [sub(q(total), partByBands(p, q(total)))],
  build: ({ total, p }) => {
    const done = mul(q(p, 100), q(total));
    const left = sub(q(total), done);
    return {
      prompt: `Jae is drawing **${total} pictures** for a comic book. **${p}%** of them are finished.\n\nHow many pictures does Jae still need to draw?`,
      answer: { fields: [{ kind: "number", value: left }] },
      answerText: `${n(left)} pictures`,
      hints: [
        `The question asks about the pictures that are *not* done yet.`,
        `If ${p}% are done, what percent are still left to draw?`,
        `Find that percent of ${total}. Splitting ${total} into 5% or 10% pieces can help.`,
      ],
      solution: [
        `${p}% are done, so 100% − ${p}% = ${100 - p}% are left.`,
        `${100 - p}% of ${total} = ${100 - p}/100 × ${total} = **${n(left)}** pictures.`,
        `Check: ${n(done)} done + ${n(left)} left = ${total} ✓`,
      ],
    };
  },
};

type Class = { size: number; p: number };
const s7_3: Exercise<Class> = {
  id: "ir-7-3",
  title: "Reading goals",
  source: src("Set 7 #3 (p.13)"),
  domain: "AAT",
  skill: "Percent concepts",
  cluster: "percents",
  base: { size: 28, p: 75 },
  variants: [{ size: 32, p: 25 }, { size: 40, p: 60 }],
  solve: ({ size, p }) => {
    // fraction by reducing p/100 with a loop, count by bands
    let a = p, b = 100;
    for (let k = 100; k > 1; k--) if (a % k === 0 && b % k === 0) { a /= k; b /= k; }
    return [partByBands(p, q(size)), q(a, b)];
  },
  build: ({ size, p }) => {
    const met = mul(q(p, 100), q(size));
    const f = q(p, 100);
    return {
      diagram: Fig.doubleLine(size, p),
      prompt: `There are **${size} students** in a class, and **${p}%** of them met their reading goal.\n\nHow many students met their reading goal? What fraction of the **${size} students** met their reading goal?`,
      answer: { fields: [{ kind: "number", label: "students", value: met, unit: "students" }, { kind: "number", label: "fraction", value: f, simplest: true }] },
      answerText: `${n(met)} students, ${n(f)} of the class`,
      hints: [
        `A percent is a fraction out of 100. Start by writing ${p}% as a fraction over 100.`,
        `Simplify that fraction: what's the biggest number that divides both the top and the bottom?`,
        `Now take that fraction of the ${size} students.`,
      ],
      solution: [`${p}% = ${p}/100, which simplifies to ${n(f)}.`, `${n(f)} of ${size}: ${size} ÷ ${Number(f.d)} × ${Number(f.n)} = **${n(met)} students**.`],
    };
  },
};

// ------------------------------------------------------------------ Set 8  Finding a Percent of a Quantity (p.14) — answer bank
type PctOf = { p: number; w: number };
const SET8: [PctOf, PctOf, PctOf][] = [
  [{ p: 40, w: 80 }, { p: 40, w: 65 }, { p: 30, w: 90 }],
  [{ p: 25, w: 60 }, { p: 25, w: 84 }, { p: 75, w: 48 }],
  [{ p: 10, w: 90 }, { p: 10, w: 70 }, { p: 20, w: 55 }],
  [{ p: 50, w: 70 }, { p: 50, w: 96 }, { p: 50, w: 130 }],
  [{ p: 80, w: 500 }, { p: 80, w: 350 }, { p: 60, w: 450 }],
  [{ p: 75, w: 80 }, { p: 75, w: 120 }, { p: 25, w: 140 }],
  [{ p: 90, w: 250 }, { p: 90, w: 150 }, { p: 70, w: 250 }],
  [{ p: 65, w: 400 }, { p: 65, w: 200 }, { p: 35, w: 400 }],
  [{ p: 85, w: 800 }, { p: 85, w: 600 }, { p: 15, w: 800 }],
  [{ p: 55, w: 140 }, { p: 55, w: 180 }, { p: 45, w: 140 }],
  [{ p: 45, w: 160 }, { p: 45, w: 120 }, { p: 35, w: 160 }],
  [{ p: 95, w: 180 }, { p: 95, w: 240 }, { p: 5, w: 180 }],
  [{ p: 70, w: 720 }, { p: 70, w: 360 }, { p: 30, w: 720 }],
  [{ p: 15, w: 220 }, { p: 15, w: 180 }, { p: 15, w: 340 }],
  [{ p: 65, w: 200 }, { p: 65, w: 300 }, { p: 85, w: 200 }],
];
const BANK8 = [32, 15, 9, 35, 400, 60, 225, 260, 680, 77, 72, 171, 504, 33, 130];

function pctOfBuild({ p, w }: PctOf): Built {
  const part = mul(q(p, 100), q(w));
  const band = gcd(p, 100);
  const nb = p / band;
  const all = 100 / band;
  const each = div(q(w), q(all));
  return {
    prompt: `Find **${p}%** of **${w}**.`,
    answer: { fields: [{ kind: "number", value: part }] },
    answerText: n(part),
    hints: [
      `${p}% means ${p} out of every 100 parts of ${w}.`,
      `Cut ${w} into ${all} equal pieces; each piece is ${band}% of it. How big is one piece?`,
      `${p}% is ${plural(nb, "piece")} of ${band}%. Put them together.`,
    ],
    solution: [`${band}% of ${w} is ${w} ÷ ${all} = ${n(each)}.`, `${p}% is ${nb} of those: ${nb} × ${n(each)} = **${n(part)}**.`],
  };
}
const set8: Exercise<PctOf>[] = SET8.map(([base, v1, v2], i) => ({
  id: `ir-8-${i + 1}`,
  title: `${base.p}% of ${base.w}`,
  source: src(`Set 8 #${i + 1} (p.14)`, "answer-bank"),
  domain: "AAT",
  skill: "Percent of a quantity",
  cluster: "percents",
  base,
  variants: [v1, v2],
  official: [q(BANK8[i])],
  solve: ({ p, w }) => [partByBands(p, q(w))],
  build: pctOfBuild,
}));

// ------------------------------------------------------------------ Set 9  Finding the Whole (p.15)
type Whole = { p: number; part: number };
const SET9: [number, [Whole, Whole, Whole]][] = [
  [1, [{ p: 25, part: 13 }, { p: 25, part: 17 }, { p: 20, part: 13 }]],
  [2, [{ p: 50, part: 140 }, { p: 50, part: 95 }, { p: 25, part: 140 }]],
  [3, [{ p: 10, part: 60 }, { p: 10, part: 45 }, { p: 20, part: 60 }]],
  [4, [{ p: 5, part: 12 }, { p: 5, part: 9 }, { p: 15, part: 12 }]],
  [5, [{ p: 30, part: 72 }, { p: 30, part: 54 }, { p: 60, part: 72 }]],
  [7, [{ p: 95, part: 57 }, { p: 95, part: 76 }, { p: 85, part: 51 }]],
  [8, [{ p: 75, part: 66 }, { p: 75, part: 45 }, { p: 25, part: 66 }]],
  [9, [{ p: 85, part: 102 }, { p: 85, part: 68 }, { p: 15, part: 102 }]],
  [10, [{ p: 45, part: 63 }, { p: 45, part: 36 }, { p: 35, part: 63 }]],
];
function wholeBuild({ p, part }: Whole): Built {
  const whole = div(q(part), q(p, 100));
  const band = gcd(p, 100);
  const nb = p / band;
  const all = 100 / band;
  const each = div(q(part), q(nb));
  return {
    prompt: `**${p}%** of a number is **${part}**.\n\nWhat is the number?`,
    answer: { fields: [{ kind: "number", value: whole }] },
    answerText: n(whole),
    hints: [
      `${part} is only ${p}% of the number, so the number itself is bigger.`,
      `${p}% is ${plural(nb, "piece")} of ${band}%. How much is in one ${band}% piece?`,
      `The whole number is 100%. How many ${band}% pieces make 100%?`,
    ],
    solution: [
      `${p}% is ${nb} pieces of ${band}%, so one piece is ${part} ÷ ${nb} = ${n(each)}.`,
      `100% is ${all} pieces: ${all} × ${n(each)} = **${n(whole)}**.`,
      `Check: ${p}% of ${n(whole)} = ${n(mul(q(p, 100), whole))} ✓`,
    ],
  };
}
const set9: Exercise<Whole>[] = SET9.map(([k, [base, v1, v2]]) => ({
  id: `ir-9-${k}`,
  title: `${base.p}% of what is ${base.part}?`,
  source: src(`Set 9 #${k} (p.15)`),
  domain: "AAT",
  skill: "Finding the whole",
  cluster: "percents",
  base,
  variants: [v1, v2],
  solve: ({ p, part }) => [wholeBySearch(p, q(part))],
  build: wholeBuild,
}));

type Quarter = { p: number; part: number };
const s9_11: Exercise<Quarter> = {
  id: "ir-9-11",
  title: "From one part to the whole",
  source: src("Set 9 #11 (p.15)"),
  domain: "AAT",
  skill: "Finding the whole",
  cluster: "percents",
  base: { p: 25, part: 12 },
  variants: [{ p: 20, part: 12 }, { p: 50, part: 18 }],
  solve: ({ p }) => {
    let m = 1;
    while (m * p !== 100) m++;
    const opts = optionsFor(p);
    return [q(opts.indexOf(`Multiply it by ${m}`))];
  },
  build: ({ p, part }) => {
    const k = 100 / p;
    const opts = optionsFor(p);
    const whole = q(part * k);
    return {
      prompt: `How could you use **${p}%** of a number to find the number?`,
      answer: { fields: [{ kind: "choice", options: opts, correct: opts.indexOf(`Multiply it by ${k}`) }] },
      answerText: `multiply it by ${k}`,
      hints: [
        `How many ${p}% pieces fit into 100%?`,
        `The whole is made of that many copies of the ${p}% amount.`,
        `Making several copies of an amount is which operation?`,
      ],
      solution: [`${p}% fits into 100% exactly ${k} times, because ${k} × ${p} = 100.`, `So multiply the ${p}% amount by ${k}: ${part} × ${k} = **${n(whole)}**.`],
    };
  },
};
function optionsFor(p: number) {
  const k = 100 / p;
  return [`Add ${p} to it`, `Divide it by ${k}`, `Multiply it by ${k}`, `Multiply it by ${p}`].sort();
}

// ------------------------------------------------------------------ Set 10  Understanding Division with Fractions (p.16)
/** count how many times b fits into a by repeated subtraction (exact) */
const countFits = (a: Frac, b: Frac): Frac => {
  let left = a;
  let k = 0;
  while (cmp(left, b) >= 0) { left = sub(left, b); k++; }
  return add(q(k), div(left, b));
};

type Ribbon = { tn: number; td: number; s: number };
const s10_1: Exercise<Ribbon> = {
  id: "ir-10-1",
  title: "How many fifths?",
  source: src("Set 10 #1 (p.16)"),
  domain: "NO",
  skill: "Dividing fractions",
  cluster: "fracdiv",
  base: { tn: 14, td: 10, s: 5 },
  variants: [{ tn: 12, td: 8, s: 4 }, { tn: 15, td: 9, s: 3 }],
  solve: ({ tn, td, s }) => {
    const k = countFits(q(tn, td), q(1, s));
    return [k, div(q(tn, td), k), k];
  },
  build: ({ tn, td, s }) => {
    const total = q(tn, td);
    const piece = q(1, s);
    const count = div(total, piece);
    return {
      diagram: Fig.ribbonBar(tn, td, s),
      prompt: `Use the bar model. How many [[1/${s}]]s make [[${tn}/${td}]]?\n\nThen complete the equations.`,
      answer: {
        fields: [
          { kind: "number", label: `How many [[1/${s}]]s make [[${tn}/${td}]]?`, value: count },
          { kind: "number", label: `[[${tn}/${td}]] ÷ ___ = ${n(count)}`, value: piece },
          { kind: "number", label: `___ · [[1/${s}]] = [[${tn}/${td}]]`, value: count },
        ],
      },
      answerText: `${n(count)}; [[${tn}/${td}]] ÷ [[1/${s}]] = ${n(count)}; ${n(count)} · [[1/${s}]] = [[${tn}/${td}]]`,
      hints: [
        `The question is "how many [[1/${s}]]s fit in [[${tn}/${td}]]?" That's a division.`,
        `It's easier when both fractions have the same denominator. Can you rename [[${tn}/${td}]] with denominator ${s}?`,
        `Once it's written in ${s}ths, the top number tells you how many [[1/${s}]] pieces there are.`,
      ],
      solution: [
        `Divide top and bottom of [[${tn}/${td}]] by ${td / s}: [[${tn}/${td}]] = [[${tn / (td / s)}/${s}]], which is already in simplest form: ${n(total)}.`,
        `[[${tn / (td / s)}/${s}]] is ${tn / (td / s)} pieces of [[1/${s}]], so you get **${n(count)} pieces**.`,
      ],
    };
  },
};

type Juice = { a: number; b: number; s: number };
const JUICE: [Juice, Juice, Juice] = [{ a: 2, b: 3, s: 12 }, { a: 3, b: 4, s: 8 }, { a: 5, b: 6, s: 12 }];
const s10_2: Exercise<Juice> = {
  id: "ir-10-2",
  title: "Jumps on a number line",
  source: src("Set 10 #2 (p.16)"),
  domain: "NO",
  skill: "Dividing fractions",
  cluster: "fracdiv",
  base: JUICE[0],
  variants: [JUICE[1], JUICE[2]],
  solve: ({ a, b, s }) => [countFits(q(a, b), q(1, s))],
  build: ({ a, b, s }) => {
    const total = q(a, b);
    const cup = q(1, s);
    const count = div(total, cup);
    return {
      diagram: Fig.toFraction(a, b),
      prompt: `Use the number line to show [[${a}/${b}]] ÷ [[1/${s}]].\n\nWhat is the quotient?`,
      answer: { fields: [{ kind: "number", value: count }] },
      answerText: n(count),
      hints: [
        `You're finding how many [[1/${s}]]s fit into [[${a}/${b}]], so this is [[${a}/${b}]] ÷ [[1/${s}]].`,
        `Rename [[${a}/${b}]] as a number of ${s}ths.`,
        `Each cup is one ${s}th, so count the ${s}ths.`,
      ],
      solution: [`[[${a}/${b}]] = [[${(a * s) / b}/${s}]] (multiply top and bottom by ${s / b}).`, `Each cup is [[1/${s}]] liter, so [[${a}/${b}]] ÷ [[1/${s}]] = **${n(count)} cups**.`],
    };
  },
};

const s10_3: Exercise<Juice> = {
  id: "ir-10-3",
  title: "Bar or number line?",
  source: src("Set 10 #3 (p.16)"),
  domain: "NO",
  skill: "Dividing fractions",
  cluster: "fracdiv",
  base: JUICE[0],
  variants: [JUICE[1], JUICE[2]],
  solve: () => [],
  build: ({ a, b, s }) => {
    const count = div(q(a, b), q(1, s));
    return {
      prompt: `Which type of model do you like better, the bar model or the number line? Explain.\n\nThere's no wrong answer: think it through, or write a sentence.`,
      answer: { fields: [] },
      answerText: "Your own answer",
      reflection: { sample: `"I like the number line. I start at 0 and jump [[1/${s}]] at a time until I reach [[${a}/${b}]]. I count ${n(count)} jumps, so [[${a}/${b}]] ÷ [[1/${s}]] = ${n(count)}."` },
      hints: [
        `Try drawing both quickly. Which one let you see the answer faster?`,
        `In the bar, you count small pieces. On the number line, you count jumps.`,
        `A good answer names the picture and says one thing it helps you see.`,
      ],
      solution: [`Name the model you prefer (bar or number line).`, `Say what it shows you: for example, how many [[1/${s}]] pieces or jumps fit in [[${a}/${b}]].`],
    };
  },
};

// ------------------------------------------------------------------ Set 11  Using Multiplication to Divide by a Fraction (p.17)
type Div = { a: [number, number]; b: [number, number] };
const SET11: [Div, Div, Div][] = [
  [{ a: [1, 2], b: [2, 3] }, { a: [1, 3], b: [3, 4] }, { a: [3, 4], b: [2, 5] }],
  [{ a: [4, 5], b: [1, 4] }, { a: [2, 3], b: [1, 5] }, { a: [5, 6], b: [1, 3] }],
  [{ a: [2, 5], b: [3, 4] }, { a: [3, 7], b: [2, 3] }, { a: [1, 6], b: [4, 5] }],
  [{ a: [5, 6], b: [5, 12] }, { a: [3, 4], b: [3, 8] }, { a: [2, 3], b: [2, 9] }],
  [{ a: [3, 4], b: [5, 7] }, { a: [2, 3], b: [4, 7] }, { a: [5, 8], b: [3, 5] }],
  [{ a: [4, 3], b: [3, 7] }, { a: [5, 4], b: [2, 5] }, { a: [5, 3], b: [3, 8] }],
  [{ a: [9, 2], b: [2, 5] }, { a: [7, 2], b: [3, 4] }, { a: [11, 4], b: [1, 3] }],
  [{ a: [7, 2], b: [7, 8] }, { a: [5, 2], b: [5, 6] }, { a: [9, 4], b: [3, 8] }],
  [{ a: [5, 3], b: [9, 4] }, { a: [3, 2], b: [7, 3] }, { a: [5, 4], b: [5, 2] }],
  [{ a: [18, 5], b: [7, 4] }, { a: [12, 5], b: [3, 2] }, { a: [13, 4], b: [5, 3] }],
];
const NOTES11 = ["", "", "", "", "", "", " (the packet hides the 1 in 4 [[1/2]])", " (the packet hides the 7 in [[7/8]])", "", " (the packet hides the 4 in 1 [[3/4]])"];

function divBuild({ a, b }: Div): Built {
  const A = q(a[0], a[1]);
  const B = q(b[0], b[1]);
  const flip = q(b[1], b[0]);
  const quo = mul(A, flip);
  return {
    prompt: `Write ${mx(A)} ÷ ${mx(B)} as a multiplication to make the equation true.\n\nGive the fraction you multiply by, then the answer.`,
    answer: { fields: [{ kind: "number", label: "multiply by", value: flip }, { kind: "number", label: "answer", value: quo, simplest: true }] },
    answerText: `× ${n(flip)}, answer ${n(quo)}`,
    hints: [
      `Mixed numbers first: rewrite any whole-and-a-fraction number as an improper fraction.`,
      `Dividing by a fraction is the same as multiplying by its reciprocal: flip only the second number, top to bottom.`,
      `Multiply the tops, multiply the bottoms, then simplify if you can.`,
    ],
    solution: [
      ...(A.n > A.d && A.d !== 1n ? [`${mx(A)} = [[${A.n}/${A.d}]].`] : []),
      ...(B.n > B.d && B.d !== 1n ? [`${mx(B)} = [[${B.n}/${B.d}]].`] : []),
      `Flip the divisor: [[${B.n}/${B.d}]] becomes ${fr(flip)}.`,
      `[[${A.n}/${A.d}]] × ${fr(flip)} = [[${A.n * flip.n}/${A.d * flip.d}]] = **${n(quo)}**.`,
    ],
  };
}
const set11: Exercise<Div>[] = SET11.map(([base, v1, v2], i) => ({
  id: `ir-11-${i + 1}`,
  title: `${n(q(base.a[0], base.a[1]))} ÷ ${n(q(base.b[0], base.b[1]))}`,
  source: src(`Set 11 #${i + 1} (p.17)${NOTES11[i].replace(/\[\[(\d+)\/(\d+)\]\]/g, "$1/$2")}`),
  domain: "NO",
  skill: "Dividing fractions",
  cluster: "fracdiv",
  base,
  variants: [v1, v2],
  solve: ({ a, b }) => {
    // common-denominator method: (a0·b1)/(a1·b1) ÷ (b0·a1)/(b1·a1) = (a0·b1)/(b0·a1)
    const top = a[0] * b[1];
    const bottom = b[0] * a[1];
    return [div(q(1), q(b[0], b[1])), q(top, bottom)];
  },
  build: divBuild,
}));

type Story = { a: [number, number]; b: [number, number] };
const s11_11: Exercise<Story> = {
  id: "ir-11-11",
  title: "Write a word problem",
  source: src("Set 11 #11 (p.17)"),
  domain: "NO",
  skill: "Dividing fractions",
  cluster: "fracdiv",
  base: { a: [7, 2], b: [7, 8] },
  variants: [{ a: [5, 2], b: [5, 6] }, { a: [9, 4], b: [3, 8] }],
  solve: () => [],
  build: ({ a, b }) => {
    const A = q(a[0], a[1]);
    const B = q(b[0], b[1]);
    const quo = div(A, B);
    return {
      prompt: `Write a short word problem that ${mx(A)} ÷ ${mx(B)} = ${n(quo)} could answer.\n\nThere's no single right answer: think it through, or write it down.`,
      answer: { fields: [] },
      answerText: "Your own story",
      reflection: { sample: `"A trail is ${mx(A)} miles long. There's a water stop every ${mx(B)} mile. How many stretches of trail are there between stops? Answer: ${n(quo)}."` },
      hints: [
        `Division by a fraction asks "how many of these fit into that?"`,
        `Pick a thing you can measure: a ribbon, a trail, a jug of juice.`,
        `Make ${mx(A)} the whole amount and ${mx(B)} the size of each piece.`,
      ],
      solution: [`Start with a whole amount of ${mx(A)} (miles, liters, meters...).`, `Ask how many pieces of size ${mx(B)} fit into it. The answer is ${n(quo)}.`],
    };
  },
};

export const PERCENTS_FRACTIONS: Exercise[] = [s7_1, s7_2, s7_3, ...set8, ...set9, s9_11, s10_1, s10_2, s10_3, ...set11, s11_11];
void eq;
