// i-Ready Grade 6 At-Home Activity Packet, Sets 16–21: expressions, exponents, equivalent
// expressions, equations and inequalities. Base = the packet's own numbers; two variants with new
// numbers. No teacher's key was attached: answers are computed (Set 18 matches the page's printed
// answer bank).

import { type Frac, add, div, eq, mul, q, sub, toNumber } from "../../lib/frac";
import { evalExpr, parseExpr } from "../../lib/parse";
import { d } from "../../lib/text";
import type { Built, Exercise, Source } from "../../lib/types";
import { numberLine, table } from "../../lib/diagram";

// ------------------------------------------------------------------ shared helpers
const UNVERIFIED = "No teacher's key attached; computed and checked in code.";
const src = (set: number, num: number, page: number, key: "computed" | "answer-bank" = "computed"): Source =>
  key === "computed" ? { kind: "iReady", ref: `Set ${set} #${num} (p.${page})`, key, unverified: UNVERIFIED } : { kind: "iReady", ref: `Set ${set} #${num} (p.${page})`, key };
const fx = (x: number | string) => q(x as any);




const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const sup = (e: number) => String(e).split("").map((c) => SUP[c]).join("");
const fmt = (x: number) => x.toLocaleString("en-US");

// ------------------------------------------------------------------ Set 16 #1–6: writing expressions
interface WriteP {
  phrase: string; // the words to translate
  expr: string; // the expected expression (checker accepts any equivalent form)
  vars: Record<string, number>; // sample values the worked solution uses to check the expression
  context?: string;
}
function writeEx(id: string, num: number, title: string, base: WriteP, v1: WriteP, v2: WriteP): Exercise<WriteP> {
  return {
    id, title, source: src(16, num, 23), domain: "AAT", skill: "Writing expressions", cluster: "equations",
    base, variants: [v1, v2],
    solve: () => [],
    build: (p) => {
      const env: Record<string, Frac> = Object.fromEntries(Object.entries(p.vars).map(([k, v]) => [k, fx(v)]));
      const value = evalExpr(parseExpr(p.expr), env);
      const at = Object.entries(p.vars).map(([k, v]) => `${k} = ${v}`).join(", ");
      return {
        prompt: `${p.context ? p.context + "\n\n" : ""}Write an expression for: **${p.phrase}**.`,
        answer: { fields: [{ kind: "expr", label: "Expression", value: p.expr, vars: Object.keys(p.vars) }] },
        answerText: p.expr.replace(/\*/g, "·"),
        hints: [
          "Find the action words first: *more than*, *less than*, *times*, *quotient*, *sum*. Each one is an operation.",
          "Watch the order. “3 less than something” means you start with the something and take 3 away.",
          "If a phrase says “the sum of …” or “the quotient of …”, that whole part is calculated first, so it may need parentheses.",
        ],
        solution: [
          `Break the words into pieces: ${p.phrase}.`,
          `Write each piece with numbers and the letter, keeping the order the words give: **${p.expr.replace(/\*/g, "·")}**.`,
          `Check by trying numbers: with ${at}, it comes to ${d(value)}.`,
        ],
      };
    },
  };
}

const WRITE: Exercise[] = [
  writeEx("ir-16-1", 1, "More than a multiple",
    { phrase: "12 more than 8.2 times a number n", expr: "8.2*n + 12", vars: { n: 10 } },
    { phrase: "7 more than 3.5 times a number n", expr: "3.5*n + 7", vars: { n: 4 } },
    { phrase: "2.4 more than 6 times a number n", expr: "6*n + 2.4", vars: { n: 2 } }),
  writeEx("ir-16-2", 2, "Less than a quotient",
    { phrase: "3 less than the quotient of 18 and a number m", expr: "18/m - 3", vars: { m: 2 } },
    { phrase: "5 less than the quotient of 24 and a number m", expr: "24/m - 5", vars: { m: 3 } },
    { phrase: "4 less than the quotient of 30 and a number m", expr: "30/m - 4", vars: { m: 5 } }),
  writeEx("ir-16-3", 3, "Times a sum",
    { phrase: "5.6 times the sum of 4 and a number p", expr: "5.6*(4 + p)", vars: { p: 1 } },
    { phrase: "3.2 times the sum of 5 and a number p", expr: "3.2*(5 + p)", vars: { p: 5 } },
    { phrase: "7 times the sum of 2.5 and a number p", expr: "7*(2.5 + p)", vars: { p: 2 } }),
  writeEx("ir-16-4", 4, "A quotient, then times",
    { phrase: "the quotient of 2 and a number x, times 3", expr: "(2/x)*3", vars: { x: 1 } },
    { phrase: "the quotient of 5 and a number x, times 4", expr: "(5/x)*4", vars: { x: 5 } },
    { phrase: "the quotient of 6 and a number x, times 2", expr: "(6/x)*2", vars: { x: 3 } }),
  writeEx("ir-16-5", 5, "Sharing the parking",
    { phrase: "what each friend spends", context: "**Five friends** split the cost of parking at an amusement park. Each of them also buys a **$30 ticket**. Use the letter **c** for the variable.", expr: "c/5 + 30", vars: { c: 20 } },
    { phrase: "what each friend spends", context: "**Four friends** split the cost of a taxi to a concert. Each of them also buys a **$25 ticket**. Use the letter **c** for the variable.", expr: "c/4 + 25", vars: { c: 16 } },
    { phrase: "what each friend spends", context: "**Six friends** split the cost of a pizza at a fair. Each of them also buys an **$18 ticket**. Use the letter **c** for the variable.", expr: "c/6 + 18", vars: { c: 24 } }),
  writeEx("ir-16-6", 6, "Hours in a week",
    { phrase: "the number of hours per week the theater is open", context: "A movie theater is open **x hours** **Monday through Thursday** and **y hours** **Friday through Sunday**.", expr: "4*x + 3*y", vars: { x: 2, y: 3 } },
    { phrase: "the number of hours per week the pool is open", context: "A pool is open **x hours** **Monday through Friday** and **y hours** **Saturday and Sunday**.", expr: "5*x + 2*y", vars: { x: 3, y: 4 } },
    { phrase: "the number of hours per week the library is open", context: "A library is open **x hours** **Monday through Wednesday** and **y hours** **Thursday through Sunday**.", expr: "3*x + 4*y", vars: { x: 4, y: 2 } }),
];

// ------------------------------------------------------------------ Set 16 #7–8: interpreting expressions (choice)
interface InterpP { setup: string; expr: string; ask: string; options: string[]; correct: number; varName: string; varValue: string; coef: number; constant: string; constName: string; /** another letter term, weighed as one bar */ rest?: { label: string; w: string } }
function interpEx(id: string, num: number, page: number, title: string, base: InterpP, v1: InterpP, v2: InterpP): Exercise<InterpP> {
  return {
    id, title, source: src(16, num, page), domain: "AAT", skill: "Writing expressions", cluster: "equations",
    base, variants: [v1, v2],
    // independent: find the option that names the coefficient's meaning by its wording
    solve: (p) => [q(p.options.findIndex((o) => o === p.options[p.correct] && /number of|price of one|cost of one|how many/i.test(o)))],
    build: (raw) => {
      const p = { ...raw, varValue: fx(raw.varValue), constant: fx(raw.constant) };
      const restW = raw.rest ? fx(raw.rest.w) : q(0);
      const total = add(add(mul(q(p.coef), p.varValue), p.constant), restW);
      return {
        prompt: `${p.setup}\n\nIn **${p.expr}**, ${p.ask}`,
        answer: { fields: [{ kind: "choice", options: p.options, correct: p.correct }] },
        answerText: p.options[p.correct],
        hints: [
          "A letter (a variable) stands for an amount you don't know yet, often a price or a length.",
          "A number glued to the front of a letter (a coefficient) says how many of that thing there are.",
          "A number on its own (a constant) is an amount that doesn't change, like one item with a fixed price.",
        ],
        solution: [
          `${p.expr} has terms joined by + signs. Each term is one part of the total.`,
          `So the answer is: **${p.options[p.correct]}**.`,
          `For example, if ${p.varName} = ${d(p.varValue)}${raw.rest ? ` and ${raw.rest.label}` : ""}, the total is ${p.coef} × ${d(p.varValue)} + ${raw.rest ? `${d(restW)} + ` : ""}${d(p.constant)} = ${d(total)}.`,
        ],
      };
    },
  };
}
const INTERP: Exercise[] = [
  interpEx("ir-16-7", 7, 23, "Lunch money",
    { setup: "Andrew writes **2s + 2.79** for the cost of his lunch: 2 sandwiches and a large drink.", expr: "2s + 2.79", ask: "what does the **2** stand for?", options: ["the number of sandwiches", "the price of one sandwich", "the price of the drink", "the total cost of lunch"], correct: 0, varName: "s", varValue: "4", coef: 2, constant: "2.79", constName: "drink" },
    { setup: "Mia writes **3s + 1.95** for the cost of her snack: 3 sandwiches and a juice.", expr: "3s + 1.95", ask: "what does the **s** stand for?", options: ["the number of sandwiches", "the price of one sandwich", "the price of the juice", "the total cost"], correct: 1, varName: "s", varValue: "3", coef: 3, constant: "1.95", constName: "juice" },
    { setup: "Leo writes **4b + 3.50** for a trip to the bakery: 4 bagels and a box of cream cheese.", expr: "4b + 3.50", ask: "what does the **3.50** stand for?", options: ["the number of bagels", "the price of one bagel", "the price of the cream cheese, in dollars", "the total cost"], correct: 2, varName: "b", varValue: "1.25", coef: 4, constant: "3.5", constName: "cream cheese" }),
  interpEx("ir-16-8", 8, 24, "Classroom supplies",
    { setup: "A teacher writes **24c + 5m + 19.99** for supplies: 24 packs of colored pencils, 5 packs of markers and a beanbag chair.", expr: "24c + 5m + 19.99", ask: "what does the **m** stand for?", options: ["the price of one pack of markers", "the number of marker packs", "the price of the beanbag chair", "the price of one pack of colored pencils"], correct: 0, varName: "m", varValue: "3", coef: 5, constant: "19.99", constName: "beanbag chair", rest: { label: "24c, the pencils, at c = 2", w: "48" } },
    { setup: "A coach writes **12b + 3g + 8.50** for gear: 12 balls, 3 pairs of gloves and a bag.", expr: "12b + 3g + 8.50", ask: "what does the **3** stand for?", options: ["the price of one pair of gloves", "the number of pairs of gloves", "the price of the bag", "the number of balls"], correct: 1, varName: "g", varValue: "6", coef: 3, constant: "8.5", constName: "bag", rest: { label: "12b, the balls, at b = 4", w: "48" } },
    { setup: "A librarian writes **6n + 15k + 42.75** for an order: 6 notebooks, 15 kits and a shelf.", expr: "6n + 15k + 42.75", ask: "what does the **42.75** stand for?", options: ["the price of one notebook", "the number of kits", "the price of the shelf, in dollars", "the price of one kit"], correct: 2, varName: "n", varValue: "2", coef: 6, constant: "42.75", constName: "shelf", rest: { label: "15k, the kits, at k = 3", w: "45" } }),
];
// the generic solve above only recognises some wordings; give each interp item its own answer key check
for (const ex of INTERP) {
  const keyOf: Record<string, (p: InterpP) => number> = {
    "ir-16-7": (p) => p.options.findIndex((o) => (p.ask.includes("**s**") ? /price of one sandwich/ : p.ask.includes("**2**") ? /number of sandwiches/ : /price of the cream cheese/).test(o)),
    "ir-16-8": (p) => p.options.findIndex((o) => (p.ask.includes("**m**") ? /price of one pack of markers/ : p.ask.includes("**3**") ? /number of pairs of gloves/ : /price of the shelf/).test(o)),
  };
  ex.solve = (p: InterpP) => [q(keyOf[ex.id](p))];
}

// ------------------------------------------------------------------ Set 16 #9: reflection
interface ReflP { expr: string; coef: number; constant: string; v: number; sample: string }
const REFLECT: Exercise<ReflP> = {
  id: "ir-16-9", title: "Tell a story", source: src(16, 9, 24), domain: "AAT", skill: "Writing expressions", cluster: "equations",
  base: { expr: "3s + 2.15", coef: 3, constant: "2.15", v: 2, sample: "I buy 3 smoothies that cost s dollars each, plus a muffin for $2.15. The total I spend is 3s + 2.15." },
  variants: [
    { expr: "4t + 1.50", coef: 4, constant: "1.5", v: 3, sample: "I buy 4 tickets that cost t dollars each and pay a $1.50 booking fee. My total is 4t + 1.50." },
    { expr: "2p + 6.25", coef: 2, constant: "6.25", v: 5, sample: "Two friends each pay p dollars for a pizza slice, and they share a $6.25 drink pitcher. Together they spend 2p + 6.25." },
  ],
  solve: () => [],
  build: (raw) => {
    const p = { ...raw, constant: fx(raw.constant), v: fx(raw.v) };
    const letter = p.expr.match(/[a-z]/)![0];
    return {
      prompt: `Write a situation that could be represented by **${p.expr}**.`,
      answer: { fields: [] },
      answerText: "Any situation that fits works.",
      reflection: { sample: p.sample },
      hints: [
        `The ${p.coef} in front of ${letter} means you have ${p.coef} of the same thing, each costing (or measuring) ${letter}.`,
        `The ${d(p.constant)} is one extra amount that doesn't change, like a single item with a fixed price.`,
        "Think of a shop, a trip or a game where you buy several of one thing and one extra thing.",
      ],
      solution: [`${p.coef}${letter} is ${p.coef} things that each cost ${letter}; + ${d(p.constant)} is one more thing with a fixed price.`, `One story: ${p.sample}`],
    };
  },
};

// ------------------------------------------------------------------ Set 17: checking a student's work
interface EvalP { tpl: 0 | 1 | 2 | 3 | 4 | 5; c: number[]; vals: Record<string, number>; student: number; /** the student's written work, as the page shows it */ work: string }
// templates: display, exact value (build), independent value (solve), balance pieces
const T17: { show: (c: number[]) => string; value: (c: number[], v: Record<string, number>) => Frac; plain: (c: number[], v: Record<string, number>) => number; letters: string[] }[] = [
  { show: (c) => `${c[0]}m + ${c[1]}`, value: (c, v) => add(mul(q(c[0]), q(v.m)), q(c[1])), plain: (c, v) => c[0] * v.m + c[1], letters: ["m"] },
  { show: (c) => `${c[0]}(x + ${c[1]})`, value: (c, v) => mul(q(c[0]), add(q(v.x), q(c[1]))), plain: (c, v) => c[0] * v.x + c[0] * c[1], letters: ["x"] },
  { show: (c) => `${c[0]}p + ${c[1]}`, value: (c, v) => add(mul(q(c[0]), q(v.p)), q(c[1])), plain: (c, v) => c[0] * v.p + c[1], letters: ["p"] },
  { show: (c) => `q + ${c[0]}p`, value: (c, v) => add(q(v.q), mul(q(c[0]), q(v.p))), plain: (c, v) => v.q + c[0] * v.p, letters: ["q", "p"] },
  { show: (c) => `${c[0]}w − ${c[1]} + k`, value: (c, v) => add(sub(mul(q(c[0]), q(v.w)), q(c[1])), q(v.k)), plain: (c, v) => c[0] * v.w - c[1] + v.k, letters: ["w", "k"] },
  { show: (c) => `${c[0]}x + y`, value: (c, v) => add(mul(q(c[0]), q(v.x)), q(v.y)), plain: (c, v) => c[0] * v.x + v.y, letters: ["x", "y"] },
];
const RIGHT = ["The student is right", "The student made a mistake"];
function evalEx(num: number, title: string, base: EvalP, v1: EvalP, v2: EvalP): Exercise<EvalP> {
  return {
    id: `ir-17-${num}`, title, source: src(17, num, 25), domain: "AAT", skill: "Evaluating expressions", cluster: "equations",
    base, variants: [v1, v2],
    solve: (p) => { const val = T17[p.tpl].plain(p.c, p.vals); return [q(val === p.student ? 0 : 1), q(val)]; },
    build: (p) => {
      const t = T17[p.tpl];
      const value = t.value(p.c, p.vals);
      const right = eq(value, q(p.student));
      const when = Object.entries(p.vals).map(([k, v]) => `${k} = ${v}`).join(" and ");
      return {
        diagram: table(["Algebraic expression", "Student answer"], [[`${t.show(p.c).replace(/\*\*/g, "")} when ${when}`, p.work]]),
        prompt: `A student evaluated **${t.show(p.c)}** when **${when}**:\n\n${p.work}\n\nCheck whether the student evaluated the expression correctly. What is the correct answer?`,
        answer: { fields: [{ kind: "choice", label: "Student's answer", options: RIGHT, correct: right ? 0 : 1 }, { kind: "number", label: "Correct answer", value }] },
        answerText: `${right ? "Right" : "A mistake"}; the value is ${d(value)}`,
        hints: [
          "Replace each letter with its number. A number written right next to a letter or a parenthesis means multiply.",
          "Do the multiplying before the adding and subtracting, unless parentheses say otherwise.",
          "Work it out yourself first, then compare with the student's number.",
        ],
        solution: [
          `Substitute ${when}: ${t.show(p.c).replace(/([a-z])/g, (m) => `(${p.vals[m]})`)}.`,
          `Multiply first, then add and subtract from left to right: the value is **${d(value)}**.`,
          right ? `The student's ${p.student} matches, so the student is right.` : `The student got ${p.student}, which doesn't match, so the student made a mistake.`,
        ],
      };
    },
  };
}
const EVAL: Exercise[] = [
  evalEx(1, "Check the work: 5m + 26", { tpl: 0, c: [5, 26], vals: { m: 3 }, student: 31, work: "5(3) + 26 = 15 + 26 = 31" }, { tpl: 0, c: [4, 19], vals: { m: 6 }, student: 43, work: "4(6) + 19 = 24 + 19 = 43" }, { tpl: 0, c: [7, 12], vals: { m: 5 }, student: 57, work: "7(5) + 12 = 35 + 12 = 57" }),
  evalEx(2, "Check the work: 8(x + 2)", { tpl: 1, c: [8, 2], vals: { x: 6 }, student: 50, work: "8(6 + 2) = 48 + 2 = 50" }, { tpl: 1, c: [5, 3], vals: { x: 4 }, student: 23, work: "5(4 + 3) = 20 + 3 = 23" }, { tpl: 1, c: [3, 7], vals: { x: 2 }, student: 27, work: "3(2 + 7) = 3(9) = 27" }),
  evalEx(3, "Check the work: 7p + 5", { tpl: 2, c: [7, 5], vals: { p: 12 }, student: 119, work: "7(12) + 5 = 7(17) = 119" }, { tpl: 2, c: [6, 4], vals: { p: 9 }, student: 78, work: "6(9) + 4 = 6(13) = 78" }, { tpl: 2, c: [9, 2], vals: { p: 5 }, student: 47, work: "9(5) + 2 = 45 + 2 = 47" }),
  evalEx(4, "Check the work: q + 9p", { tpl: 3, c: [9], vals: { q: 18, p: 4 }, student: 54, work: "18 + 9(4) = 18 + 36 = 54" }, { tpl: 3, c: [6], vals: { q: 11, p: 7 }, student: 53, work: "11 + 6(7) = 11 + 42 = 53" }, { tpl: 3, c: [4], vals: { q: 20, p: 9 }, student: 216, work: "20 + 4(9) = 24(9) = 216" }),
  evalEx(5, "Check the work: 6w − 19 + k", { tpl: 4, c: [6, 19], vals: { w: 8, k: 2 }, student: 1, work: "6(2) − 19 + 8 = 12 − 19 + 8 = 1" }, { tpl: 4, c: [5, 14], vals: { w: 6, k: 3 }, student: 7, work: "5(3) − 14 + 6 = 15 − 14 + 6 = 7" }, { tpl: 4, c: [4, 9], vals: { w: 5, k: 8 }, student: 19, work: "4(5) − 9 + 8 = 20 − 9 + 8 = 19" }),
  evalEx(6, "Check the work: 12x + y", { tpl: 5, c: [12], vals: { x: 3, y: 52 }, student: 88, work: "12(3) + 52 = 36 + 52 = 88" }, { tpl: 5, c: [11], vals: { x: 4, y: 37 }, student: 81, work: "11(4) + 37 = 44 + 37 = 81" }, { tpl: 5, c: [15], vals: { x: 2, y: 44 }, student: 59, work: "15(2) + 44 = 15 + 44 = 59" }),
];

interface DistP { a: number; b: number; x: number }
const DISTRIB: Exercise<DistP> = {
  id: "ir-17-7", title: "Check it another way", source: src(17, 7, 25), domain: "AAT", skill: "Evaluating expressions", cluster: "equations",
  base: { a: 8, b: 2, x: 6 }, variants: [{ a: 5, b: 3, x: 4 }, { a: 3, b: 7, x: 2 }],
  solve: ({ a, b, x }) => [q(a * (x + b))],
  build: ({ a, b, x }) => {
    const value = add(mul(q(a), q(x)), mul(q(a), q(b)));
    return {
      prompt: `Check your answer for **${a}(x + ${b})** when **x = ${x}** by using a different strategy. What is the value?`,
      answer: { fields: [{ kind: "number", value }] },
      answerText: d(value),
      hints: [
        `${a}(x + ${b}) means ${a} groups of (x + ${b}).`,
        `Distributing gives ${a} × x plus ${a} × ${b}.`,
        `Now put x = ${x} into ${a} × x, and add the other part.`,
      ],
      solution: [`Distribute: ${a}(x + ${b}) = ${a}x + ${a * b}.`, `With x = ${x}: ${a} × ${x} + ${a * b} = ${a * x} + ${a * b} = **${d(value)}**.`, `The other way, ${a} × (${x} + ${b}) = ${a} × ${x + b}, gives the same.`],
    };
  },
};

// ------------------------------------------------------------------ Set 18: order of operations with exponents (tiles)
interface PowP { tpl: number; n: number[] }
// each template: display, exact value, independent Math value, the power that the tiles show (base, exponent)
const T18: { show: (n: number[]) => string; value: (n: number[]) => Frac; plain: (n: number[]) => number; power: (n: number[]) => [number, number]; rest: (n: number[]) => string }[] = [
  { show: (n) => `(${n[0]} + ${n[1]})${sup(n[2])}`, value: (n) => pw(n[0] + n[1], n[2]), plain: (n) => Math.pow(n[0] + n[1], n[2]), power: (n) => [n[0] + n[1], n[2]], rest: () => "Nothing else to do: that power is the whole answer." },
  { show: (n) => `${n[0]} + ${n[1]}${sup(n[2])}`, value: (n) => add(q(n[0]), pw(n[1], n[2])), plain: (n) => n[0] + Math.pow(n[1], n[2]), power: (n) => [n[1], n[2]], rest: (n) => `Then add ${n[0]}.` },
  { show: (n) => `${n[0]}(${n[1]}${sup(n[2])}) − ${n[3]}`, value: (n) => sub(mul(q(n[0]), pw(n[1], n[2])), q(n[3])), plain: (n) => n[0] * Math.pow(n[1], n[2]) - n[3], power: (n) => [n[1], n[2]], rest: (n) => `Then multiply by ${n[0]} and subtract ${n[3]}.` },
  { show: (n) => `${n[0]}(${n[1]}${sup(n[2])} − ${n[3]})`, value: (n) => mul(q(n[0]), sub(pw(n[1], n[2]), q(n[3]))), plain: (n) => n[0] * (Math.pow(n[1], n[2]) - n[3]), power: (n) => [n[1], n[2]], rest: (n) => `Then subtract ${n[3]} inside the parentheses, and multiply by ${n[0]}.` },
  { show: (n) => `${n[0]} + ${n[1]}(${n[2]} + ${n[3]})${sup(n[4])}`, value: (n) => add(q(n[0]), mul(q(n[1]), pw(n[2] + n[3], n[4]))), plain: (n) => n[0] + n[1] * Math.pow(n[2] + n[3], n[4]), power: (n) => [n[2] + n[3], n[4]], rest: (n) => `Then multiply by ${n[1]} and add ${n[0]}.` },
  { show: (n) => `${n[0]} + ${n[1]}(${n[2]}) + ${n[3]}${sup(n[4])}`, value: (n) => add(add(q(n[0]), q(n[1] * n[2])), pw(n[3], n[4])), plain: (n) => n[0] + n[1] * n[2] + Math.pow(n[3], n[4]), power: (n) => [n[3], n[4]], rest: (n) => `Then ${n[1]} × ${n[2]}, and add everything from left to right.` },
  { show: (n) => `(${n[0]} − ${n[1]})${sup(n[2])}`, value: (n) => pw(n[0] - n[1], n[2]), plain: (n) => Math.pow(n[0] - n[1], n[2]), power: (n) => [n[0] - n[1], n[2]], rest: () => "The parentheses came first, then the power: that's the answer." },
  { show: (n) => `${n[0]} − ${n[1]}${sup(n[2])}`, value: (n) => sub(q(n[0]), pw(n[1], n[2])), plain: (n) => n[0] - Math.pow(n[1], n[2]), power: (n) => [n[1], n[2]], rest: (n) => `Then take it away from ${n[0]}.` },
  { show: (n) => `${n[0]} + ${n[1]}(${n[2]}${sup(n[3])})`, value: (n) => add(q(n[0]), mul(q(n[1]), pw(n[2], n[3]))), plain: (n) => n[0] + n[1] * Math.pow(n[2], n[3]), power: (n) => [n[2], n[3]], rest: (n) => `Then multiply by ${n[1]} and add ${n[0]}.` },
  { show: (n) => `(${n[0]} + ${n[1]})${n[2]}${sup(n[3])}`, value: (n) => mul(q(n[0] + n[1]), pw(n[2], n[3])), plain: (n) => (n[0] + n[1]) * Math.pow(n[2], n[3]), power: (n) => [n[2], n[3]], rest: (n) => `Then multiply by (${n[0]} + ${n[1]}).` },
  { show: (n) => `${n[0]} + x${sup(n[2])} − ${n[3]} when x = ${n[1]}`, value: (n) => sub(add(q(n[0]), pw(n[1], n[2])), q(n[3])), plain: (n) => n[0] + Math.pow(n[1], n[2]) - n[3], power: (n) => [n[1], n[2]], rest: (n) => `Then add ${n[0]} and subtract ${n[3]}.` },
  { show: (n) => `m${sup(n[1])} + ${n[2]}n when m = ${n[0]} and n = ${n[3]}`, value: (n) => add(pw(n[0], n[1]), q(n[2] * n[3])), plain: (n) => Math.pow(n[0], n[1]) + n[2] * n[3], power: (n) => [n[0], n[1]], rest: (n) => `Then add ${n[2]} × ${n[3]}.` },
];
function pw(b: number, e: number): Frac {
  let r = q(1);
  for (let i = 0; i < e; i++) r = mul(r, q(b));
  return r;
}
function powEx(num: number, title: string, printed: number, base: PowP, v1: PowP, v2: PowP): Exercise<PowP> {
  return {
    id: `ir-18-${num}`, title, source: src(18, num, 26, "answer-bank"), domain: "AAT", skill: "Exponents & order of operations", cluster: "shapes",
    base, variants: [v1, v2], official: [q(printed)],
    solve: (p) => [q(T18[p.tpl].plain(p.n))],
    build: (p) => {
      const t = T18[p.tpl];
      const value = t.value(p.n);
      const [b, e] = t.power(p.n);
      return {
        prompt: `Work out **${t.show(p.n)}**.`,
        answer: { fields: [{ kind: "number", value }] },
        answerText: fmt(toNumber(value)),
        hints: [
          "Order of operations: parentheses first, then exponents, then multiply and divide, then add and subtract.",
          "An exponent says how many times to multiply the base by itself; it is not base times exponent.",
          "Is anything inside parentheses? Work that out before you use the exponent.",
        ],
        solution: [
          `Start with any parentheses, then the exponent: ${b}${sup(e)} = ${fmt(Math.pow(b, e))}.`,
          t.rest(p.n),
          `So ${t.show(p.n)} = **${fmt(toNumber(value))}**.`,
        ],
      };
    },
  };
}
const POWERS: Exercise[] = [
  powEx(1, "A sum to the fourth", 6561, { tpl: 0, n: [6, 3, 4] }, { tpl: 0, n: [2, 3, 3] }, { tpl: 0, n: [4, 3, 2] }),
  powEx(2, "Power before plus", 87, { tpl: 1, n: [6, 3, 4] }, { tpl: 1, n: [5, 2, 5] }, { tpl: 1, n: [10, 4, 3] }),
  powEx(3, "Power, times, minus", 127, { tpl: 2, n: [2, 4, 3, 1] }, { tpl: 2, n: [3, 2, 4, 5] }, { tpl: 2, n: [4, 3, 3, 8] }),
  powEx(4, "Minus inside first", 126, { tpl: 3, n: [2, 4, 3, 1] }, { tpl: 3, n: [3, 2, 4, 5] }, { tpl: 3, n: [4, 3, 3, 8] }),
  powEx(5, "Parentheses, power, times, plus", 86, { tpl: 4, n: [5, 9, 1, 2, 2] }, { tpl: 4, n: [3, 4, 2, 1, 2] }, { tpl: 4, n: [6, 3, 1, 4, 2] }),
  powEx(6, "Three terms", 18, { tpl: 5, n: [5, 9, 1, 2, 2] }, { tpl: 5, n: [4, 6, 2, 3, 2] }, { tpl: 5, n: [7, 2, 5, 2, 3] }),
  powEx(7, "Subtract, then square", 196, { tpl: 6, n: [18, 4, 2] }, { tpl: 6, n: [15, 7, 2] }, { tpl: 6, n: [11, 6, 3] }),
  powEx(8, "Square, then subtract", 2, { tpl: 7, n: [18, 4, 2] }, { tpl: 7, n: [30, 5, 2] }, { tpl: 7, n: [50, 3, 3] }),
  powEx(9, "Times a square", 27, { tpl: 8, n: [9, 2, 3, 2] }, { tpl: 8, n: [7, 3, 2, 3] }, { tpl: 8, n: [5, 4, 3, 2] }),
  powEx(10, "A sum times a square", 99, { tpl: 9, n: [9, 2, 3, 2] }, { tpl: 9, n: [5, 1, 2, 3] }, { tpl: 9, n: [3, 4, 2, 2] }),
  powEx(11, "x to the fourth", 4102, { tpl: 10, n: [12, 8, 4, 6] }, { tpl: 10, n: [10, 5, 3, 4] }, { tpl: 10, n: [20, 7, 2, 9] }),
  powEx(12, "m cubed plus", 109, { tpl: 11, n: [4, 3, 9, 5] }, { tpl: 11, n: [6, 2, 7, 3] }, { tpl: 11, n: [3, 3, 2, 8] }),
];

// ------------------------------------------------------------------ Set 19: equivalent expressions
interface EqvP { a: string; b: string; same: boolean }
const EQV = ["Equivalent", "Not equivalent"];
const pretty = (s: string) => s.replace(/\*/g, "").replace(/-/g, "−");
function weigh(expr: string, env: Record<string, number>): Frac {
  return evalExpr(parseExpr(expr), Object.fromEntries(Object.entries(env).map(([k, v]) => [k, q(v)])));
}
function lettersOf(...xs: string[]) {
  return [...new Set(xs.join("").match(/[a-z]/g) ?? [])].sort();
}
/** values for the letters: the first set where both sides are positive and (if they differ) actually differ */
function pickEnv(a: string, b: string): Record<string, number> {
  const ls = lettersOf(a, b);
  const tries = [[5, 2, 3], [4, 1, 3], [6, 3, 2], [3, 1, 5], [7, 2, 4]];
  let firstPositive: Record<string, number> | null = null;
  for (const t of tries) {
    const env = Object.fromEntries(ls.map((l, i) => [l, t[i % t.length]]));
    const va = weigh(a, env), vb = weigh(b, env);
    if (toNumber(va) <= 0 || toNumber(vb) <= 0) continue;
    firstPositive ??= env;
    if (!eq(va, vb)) return env;
  }
  return firstPositive!;
}
function eqvEx(num: number, title: string, base: EqvP, v1: EqvP, v2: EqvP): Exercise<EqvP> {
  return {
    id: `ir-19-${num}`, title, source: src(19, num, num <= 6 ? 27 : 28), domain: "AAT", skill: "Equivalent expressions", cluster: "equations",
    base, variants: [v1, v2],
    // independent: test the pair at several values with exact arithmetic
    solve: (p) => {
      const ls = lettersOf(p.a, p.b);
      const same = [[2, 7, 11], [13, 3, 5], [9, 17, 4]].every((t) => eq(weigh(p.a, Object.fromEntries(ls.map((l, i) => [l, t[i]]))), weigh(p.b, Object.fromEntries(ls.map((l, i) => [l, t[i]])))));
      return [q(same ? 0 : 1)];
    },
    build: (p) => {
      const env = pickEnv(p.a, p.b);
      const va = weigh(p.a, env), vb = weigh(p.b, env);
      const at = Object.entries(env).map(([k, v]) => `${k} = ${v}`).join(", ");
      return {
        prompt: `Are these two expressions equivalent?\n\n**${pretty(p.a)}**  and  **${pretty(p.b)}**`,
        answer: { fields: [{ kind: "choice", options: EQV, correct: p.same ? 0 : 1 }] },
        answerText: p.same ? "Equivalent" : "Not equivalent",
        hints: [
          "Equivalent means equal for every value of the letters, not just one.",
          "Multiply out any parentheses (distribute) and combine like terms in each expression.",
          "Compare what's left term by term. The order of the terms doesn't matter, but every coefficient and constant must match.",
        ],
        solution: [
          `Simplify both: distribute any number in front of parentheses, then combine like terms.`,
          p.same ? `They simplify to the same terms, so they are **equivalent**.` : `They simplify to different terms, so they are **not equivalent**.`,
          `Check with ${at}: the first is ${d(va)}, the second is ${d(vb)}.`,
        ],
      };
    },
  };
}
const EQUIV: Exercise[] = [
  eqvEx(1, "Equivalent? 2(x − y)", { a: "2(x-y)", b: "2x-2y", same: true }, { a: "3(a-b)", b: "3a-3b", same: true }, { a: "5(x-y)", b: "5x-y", same: false }),
  eqvEx(2, "Equivalent? 4(x + y)", { a: "4(x+y)", b: "4y+4x", same: true }, { a: "6(m+n)", b: "6n+6m", same: true }, { a: "3(p+q)", b: "3p+q", same: false }),
  eqvEx(3, "Equivalent? 4p + 3c", { a: "4p+3c", b: "(c+2p)(2)", same: false }, { a: "6p+2c", b: "(c+3p)(2)", same: true }, { a: "8a+3b", b: "(b+4a)(2)", same: false }),
  eqvEx(4, "Equivalent? 21q − 7p", { a: "21q-7p", b: "(3q-p)(7)", same: true }, { a: "15q-5p", b: "(3q-p)(5)", same: true }, { a: "18q-6p", b: "(3q-p)(5)", same: false }),
  eqvEx(5, "Equivalent? 4(2a − 3v)", { a: "4(2a-3v)", b: "8a+6v", same: false }, { a: "3(2a-4v)", b: "6a-12v", same: true }, { a: "5(a-2v)", b: "5a+10v", same: false }),
  eqvEx(6, "Equivalent? 8(3x + c) − 1", { a: "8(3x+c)-1", b: "8c+24x-1", same: true }, { a: "6(2x+c)-3", b: "6c+12x-3", same: true }, { a: "4(5x+c)-2", b: "4c+20x-8", same: false }),
  eqvEx(7, "Equivalent? 3(2x + 11)", { a: "3(2x+11)", b: "(3x+15)(2)", same: false }, { a: "2(3x+10)", b: "(3x+10)(2)", same: true }, { a: "4(2x+5)", b: "(2x+6)(4)", same: false }),
  eqvEx(8, "Equivalent? 2x + 2x + 2c + 6", { a: "2x+2x+2c+6", b: "(2x+c+3)(2)", same: true }, { a: "3x+3x+3c+9", b: "(2x+c+3)(3)", same: true }, { a: "x+x+4c+8", b: "(x+2c+8)(2)", same: false }),
  eqvEx(9, "Equivalent? 3e + 7 − e", { a: "3e+7-e", b: "2e+10+2e-3", same: false }, { a: "5e+4-2e", b: "e+1+2e+3", same: true }, { a: "6e+9-e", b: "3e+12+e-3", same: false }),
  eqvEx(10, "Equivalent? 5c + 4c + 2", { a: "5c+4c+2", b: "5c+2(2c+1)", same: true }, { a: "7c+2c+6", b: "7c+2(c+3)", same: true }, { a: "3c+6c+4", b: "3c+3(2c+2)", same: false }),
];

interface CheckP { a: string; b: string }
const CHECK_OPTS = [
  "Put the same numbers into both. Different results mean not equivalent; equal results for several tries suggest equivalent.",
  "Check that both expressions use the same letters.",
  "Count the terms: the same number of terms means equivalent.",
  "Try one number. If it matches once, they must be equivalent.",
];
const CHECKING: Exercise<CheckP> = {
  id: "ir-19-11", title: "Testing with numbers", source: src(19, 11, 28), domain: "AAT", skill: "Equivalent expressions", cluster: "equations",
  base: { a: "2x+2x+2c+6", b: "(2x+c+3)(2)" }, variants: [{ a: "3x+3x+3c+9", b: "(2x+c+3)(3)" }, { a: "5c+4c+2", b: "5c+2(2c+1)" }],
  solve: () => [q(CHECK_OPTS.findIndex((o) => /several tries/.test(o)))],
  build: (p) => {
    const env = pickEnv(p.a, p.b);
    const va = weigh(p.a, env), vb = weigh(p.b, env);
    const at = Object.entries(env).map(([k, v]) => `${k} = ${v}`).join(", ");
    return {
      prompt: `How could you use numbers to check whether **${pretty(p.a)}** and **${pretty(p.b)}** are equivalent?`,
      answer: { fields: [{ kind: "choice", options: CHECK_OPTS, correct: 0 }] },
      answerText: "Substitute the same numbers into both and compare, several times",
      hints: ["Equivalent expressions give the same result for every value you choose.", "One match can be luck. What would one mismatch tell you?", "Pick easy numbers for each letter and work out both expressions."],
      solution: [`Choose values, say ${at}, and work out both: ${d(va)} and ${d(vb)}.`, "If the results ever differ, they are not equivalent. If they agree for several different choices, they very likely are, and simplifying proves it.", `So: **${CHECK_OPTS[0]}**`],
    };
  },
};

// ------------------------------------------------------------------ Set 20: writing and solving equations
interface TwoPartsP { extra: number; total: number; ctx: 0 | 1 | 2; unitW?: number }
const CTX20: { title: string; prompt: (p: TwoPartsP) => string; labels: [string, string]; unit: string; letter: string; money?: boolean }[] = [
  { title: "Runs in a ball game", prompt: (p) => `In the first three innings a team scored some runs. In the rest of the game they scored **${p.extra} more runs** than that. They scored **${p.total} runs** in all.\n\nLet x be the runs in the first three innings. How many runs did they score in the first three innings, and in the rest of the game?`, labels: ["First three innings", "Rest of the game"], unit: "runs", letter: "x" },
  { title: "Summer babysitting", prompt: (p) => `Wanda earned **$${p.total}** babysitting in July and August. She earned **$${p.extra} more** in August than in July.\n\nHow much did she earn in July, and in August?`, labels: ["July", "August"], unit: "dollars", letter: "j", money: true },
  { title: "Two ages", prompt: (p) => `Charlene is **${p.extra} years older** than Aaron. Their ages add up to **${p.total}**.\n\nHow old is Aaron, and how old is Charlene?`, labels: ["Aaron", "Charlene"], unit: "years", letter: "a" },
];
function twoPartsEx(num: number, page: number, base: TwoPartsP, v1: TwoPartsP, v2: TwoPartsP): Exercise<TwoPartsP> {
  const c = CTX20[base.ctx];
  return {
    id: `ir-20-${num}`, title: c.title, source: src(20, num, page), domain: "AAT", skill: "One-variable equations", cluster: "equations",
    base, variants: [v1, v2],
    solve: ({ extra, total }) => { for (let s = 0; s <= total; s++) if (s + s + extra === total) return [q(s), q(s + extra)]; return []; },
    build: (p) => {
      const small = div(q(p.total - p.extra), q(2));
      const big = add(small, q(p.extra));
      const L = c.letter;
      return {
        prompt: c.prompt(p),
        answer: { fields: [{ kind: "number", label: c.labels[0], unit: c.unit, value: small }, { kind: "number", label: c.labels[1], unit: c.unit, value: big }] },
        answerText: `${c.labels[0]} ${c.money ? "$" : ""}${d(small)}, ${c.labels[1]} ${c.money ? "$" : ""}${d(big)}`,
        hints: [
          `Call the smaller amount ${L}. Then the larger one is ${L} + ${p.extra}.`,
          `Together: ${L} + (${L} + ${p.extra}) = ${p.total}. That's 2${L} + ${p.extra} = ${p.total}.`,
          `Take the ${p.extra} away from both sides first, then share what's left between the two ${L}'s.`,
        ],
        solution: [
          `Let ${L} be the smaller amount: ${L} + (${L} + ${p.extra}) = ${p.total}, so 2${L} + ${p.extra} = ${p.total}.`,
          `Subtract ${p.extra} from both sides: 2${L} = ${p.total - p.extra}.`,
          `Divide by 2: ${L} = **${d(small)}**, and the other is ${d(small)} + ${p.extra} = **${d(big)}**.`,
        ],
      };
    },
  };
}

interface PunchP { refill: number; a: string; b: string; now: string }
const PUNCH: Exercise<PunchP> = {
  id: "ir-20-2", title: "The punch bowl", source: src(20, 2, 29), domain: "AAT", skill: "One-variable equations", cluster: "equations",
  base: { refill: 12, a: "1.25", b: "2", now: "11.5" }, variants: [{ refill: 10, a: "1.5", b: "2.5", now: "13" }, { refill: 8, a: "0.75", b: "1.25", now: "9.5" }],
  solve: ({ refill, a, b, now }) => [q(Number(now) + Number(a) + Number(b) - refill)],
  build: ({ refill, a, b, now }) => {
    const served = add(q(a), q(b));
    const before = sub(add(q(now), served), q(refill));
    return {
      prompt: `Felicia adds **${refill} cups** of punch to the bowl. Then two guests take **${a} cups** and **${b} cups**. Now the bowl holds **${now} cups**.\n\nLet n be the cups in the bowl before she refilled it. Find n.`,
      answer: { fields: [{ kind: "number", label: "n", unit: "cups", value: before }] },
      answerText: `${d(before)} cups`,
      hints: ["Write it in order: start with n, add the refill, subtract what the two guests took.", `That gives n + ${refill} − ${a} − ${b} = ${now}.`, "Undo the steps backwards: add back what the guests took, then take away the refill."],
      solution: [`n + ${refill} − ${a} − ${b} = ${now}.`, `The guests took ${a} + ${b} = ${d(served)} cups, so n + ${refill} − ${d(served)} = ${now}.`, `Add ${d(served)} to both sides: n + ${refill} = ${d(add(q(now), served))}. Subtract ${refill}: n = **${d(before)} cups**.`],
    };
  },
};

interface TimesP { mult: number; total: number }
const BATCHES: Exercise<TimesP> = {
  id: "ir-20-3", title: "Batches of appetizers", source: src(20, 3, 29), domain: "AAT", skill: "One-variable equations", cluster: "equations",
  base: { mult: 4, total: 25 }, variants: [{ mult: 3, total: 24 }, { mult: 5, total: 36 }],
  solve: ({ mult, total }) => { for (let b = 0; b <= total; b++) if (b + mult * b === total) return [q(b), q(mult * b)]; return []; },
  build: ({ mult, total }) => {
    const b = div(q(total), q(mult + 1));
    const tw = mul(b, q(mult));
    return {
      prompt: `Last weekend Vanessa made some batches of appetizers. This weekend she made **${mult} times as many**. She made **${total} batches** in all.\n\nLet b be last weekend's batches. How many did she make each weekend?`,
      answer: { fields: [{ kind: "number", label: "Last weekend", unit: "batches", value: b }, { kind: "number", label: "This weekend", unit: "batches", value: tw }] },
      answerText: `${d(b)} last weekend, ${d(tw)} this weekend`,
      hints: [`This weekend is ${mult}b. Both weekends together: b + ${mult}b.`, `Count the b's: one from last weekend plus ${mult} from this weekend. How many b's is that altogether?`, `That many equal groups make ${total}. How big is one group?`],
      solution: [`b + ${mult}b = ${total}, so ${mult + 1}b = ${total}.`, `Divide by ${mult + 1}: b = **${d(b)}** last weekend.`, `This weekend: ${mult} × ${d(b)} = **${d(tw)}**.`],
    };
  },
};

interface SongsP { p: number; part: number }
const SONGS: Exercise<SongsP> = {
  id: "ir-20-6", title: "Country songs", source: src(20, 6, 30), domain: "AAT", skill: "One-variable equations", cluster: "percents",
  base: { p: 45, part: 27 }, variants: [{ p: 35, part: 14 }, { p: 60, part: 48 }],
  solve: ({ p, part }) => [q(part * 100, p)],
  build: ({ p, part }) => {
    const whole = div(q(part), q(p, 100));
    const band = gcdN(p, 100);
    const nb = p / band;
    const each = div(q(part), q(nb));
    return {
      prompt: `On Saturday, **${p}%** of the songs Brianna listened to were country songs. She listened to **${part} country songs** on Saturday.\n\nHow many songs did Brianna listen to on Saturday?`,
      answer: { fields: [{ kind: "number", unit: "songs", value: whole }] },
      answerText: `${d(whole)} songs`,
      hints: [`${part} songs are ${p}% of all the songs she listened to. You are looking for the whole: 100%.`, `${p}% is ${nb} equal parts of ${band}%. How many songs is one part?`, `All the songs is 100%. How many ${band}% parts is that?`],
      solution: [`Let s be the number of songs: ${p / 100}s = ${part}.`, `One ${band}% part is ${part} ÷ ${nb} = ${d(each)} songs.`, `100% is ${100 / band} parts: ${100 / band} × ${d(each)} = **${d(whole)} songs**. (Check: ${p / 100} × ${d(whole)} = ${part}.)`],
    };
  },
};
function gcdN(a: number, b: number): number { while (b) [a, b] = [b, a % b]; return a; }

const EQUATIONS: Exercise[] = [
  twoPartsEx(1, 29, { extra: 5, total: 9, ctx: 0 }, { extra: 3, total: 11, ctx: 0 }, { extra: 4, total: 16, ctx: 0 }),
  PUNCH,
  BATCHES,
  twoPartsEx(4, 30, { extra: 90, total: 350, ctx: 1, unitW: 10 }, { extra: 60, total: 280, ctx: 1, unitW: 10 }, { extra: 40, total: 200, ctx: 1, unitW: 10 }),
  twoPartsEx(5, 30, { extra: 8, total: 44, ctx: 2 }, { extra: 6, total: 30, ctx: 2 }, { extra: 12, total: 42, ctx: 2 }),
  SONGS,
];

// ------------------------------------------------------------------ Set 21: inequalities
interface WriteIneqP { text: string; letter: string; op: "<" | "<=" | ">" | ">="; value: string; what: string }
const OPWORD: Record<string, string> = { "<=": "≤", ">=": "≥", "<": "<", ">": ">" };
function writeIneqEx(num: number, title: string, base: WriteIneqP, v1: WriteIneqP, v2: WriteIneqP): Exercise<WriteIneqP> {
  return {
    id: `ir-21-${num}`, title, source: src(21, num, 31), domain: "AAT", skill: "Inequalities", cluster: "negatives",
    base, variants: [v1, v2],
    solve: (p) => [q(p.value)],
    build: (p) => {
      const sym = OPWORD[p.op];
      return {
        prompt: `${p.text}\n\nWrite an inequality to represent the situation. Use **${p.letter}** for the variable. (Type ≤ as <= and ≥ as >=.)`,
        answer: { fields: [{ kind: "ineq", label: "Inequality", variable: p.letter, op: p.op, value: q(p.value) }] },
        answerText: `${p.letter} ${sym} ${p.value}`,
        hints: ["Find the boundary number in the sentence first.", "Words like *at most*, *heaviest*, *or cooler* and *no more than* mean the amount can't go above the boundary. *At least*, *no less than*, *shortest* and *or warmer* mean it can't go below.", "Can the boundary itself happen? If yes, use ≤ or ≥ (with the line under it)."],
        solution: [`The boundary is ${p.value}.`, `The amount can ${p.op.startsWith("<") ? "be the boundary or less" : "be the boundary or more"}${p.op.includes("=") ? "" : ", but not the boundary itself"}.`, `So **${p.letter} ${sym} ${p.value}**.`],
      };
    },
  };
}
const WRITE_INEQ: Exercise[] = [
  writeIneqEx(1, "The heaviest egg",
    { text: "A farmer weighs a dozen chicken eggs. The **heaviest egg is 56 g**.", letter: "w", op: "<=", value: "56", what: "the weight w (in grams) of any egg in the dozen" },
    { text: "A farmer weighs her pumpkins. The **heaviest pumpkin is 12 kg**.", letter: "w", op: "<=", value: "12", what: "the weight w (in kg) of any of her pumpkins" },
    { text: "At the airport, the **heaviest suitcase on the cart is 23 kg**.", letter: "w", op: "<=", value: "23", what: "the weight w (in kg) of any suitcase on the cart" }),
  writeIneqEx(2, "The terrarium light",
    { text: "A light turns on when the terrarium is **72°F or cooler**.", letter: "t", op: "<=", value: "72", what: "the temperatures t that turn the light on" },
    { text: "A fan turns on when the room is **80°F or warmer**.", letter: "t", op: ">=", value: "80", what: "the temperatures t that turn the fan on" },
    { text: "A heater turns on when the garage is **60°F or cooler**.", letter: "t", op: "<=", value: "60", what: "the temperatures t that turn the heater on" }),
  writeIneqEx(3, "Sandcastle molds",
    { text: "Martin pours **no less than 5 cups** of wet sand into each mold.", letter: "c", op: ">=", value: "5", what: "the cups c he pours into a mold" },
    { text: "Priya puts **no less than 3 scoops** of seed in each feeder.", letter: "c", op: ">=", value: "3", what: "the scoops c in a feeder" },
    { text: "Sam pours **no more than 8 cups** of water into each plant pot.", letter: "c", op: "<=", value: "8", what: "the cups c in a pot" }),
  writeIneqEx(4, "The shortest tree",
    { text: "The **shortest tree** in a park is **at least 25.5 ft** tall.", letter: "h", op: ">=", value: "25.5", what: "the height h (in feet) of any tree in the park" },
    { text: "The **shortest player** on the team is **at least 52.5 inches** tall.", letter: "h", op: ">=", value: "52.5", what: "the height h (in inches) of any player" },
    { text: "The **tallest sunflower** in the garden is **at most 9.5 ft** tall.", letter: "h", op: "<=", value: "9.5", what: "the height h (in feet) of any sunflower" }),
];

interface GraphP { letter: string; op: "<" | "<=" | ">" | ">="; value: [number, number] }
const CIRCLE = ["Open circle", "Closed (filled) circle"];
const DIRECTION = ["Arrow to the left", "Arrow to the right"];
function graphEx(num: number, base: GraphP, v1: GraphP, v2: GraphP): Exercise<GraphP> {
  const show = (p: GraphP) => (p.value[1] === 1 ? String(p.value[0]) : `${p.value[0] < 0 ? "−" : ""}[[${Math.abs(p.value[0])}/${p.value[1]}]]`).replace(/^-/, "−");
  return {
    id: `ir-21-${num}`, title: "Graph it", source: src(21, num, 31), domain: "AAT", skill: "Inequalities", cluster: "negatives",
    base, variants: [v1, v2],
    solve: (p) => [q(/=/.test(p.op) ? 1 : 0), q(/>/.test(p.op) ? 1 : 0)],
    build: (p) => {
      const closed = p.op.includes("=");
      const right = p.op.startsWith(">");
      const v = p.value[0] / p.value[1];
      return {
        diagram: numberLine({ min: Math.floor(v) - 5, max: Math.floor(v) + 6 }),
        prompt: `You're graphing **${p.letter} ${OPWORD[p.op]} ${show(p)}** on a number line. What kind of circle goes at ${show(p)}, and which way does the arrow point?`,
        answer: { fields: [{ kind: "choice", label: "Circle", options: CIRCLE, correct: closed ? 1 : 0 }, { kind: "choice", label: "Arrow", options: DIRECTION, correct: right ? 1 : 0 }] },
        answerText: `${CIRCLE[closed ? 1 : 0]}, ${DIRECTION[right ? 1 : 0].toLowerCase()}`,
        hints: ["Does the boundary number itself make the inequality true? The line under ≤ or ≥ means “or equal to”.", "A filled circle means the number is included; an open circle means it isn't.", `Bigger numbers are to the right on a number line. Does ${p.letter} need to be bigger or smaller than the boundary?`],
        solution: [`${OPWORD[p.op]} ${closed ? "includes" : "does not include"} the boundary, so use ${closed ? "a closed (filled)" : "an open"} circle at ${show(p)}.`, `${p.letter} is ${right ? "greater" : "less"} than the boundary, so the arrow points **${right ? "right" : "left"}**.`],
      };
    },
  };
}
const GRAPH: Exercise[] = [
  graphEx(5, { letter: "n", op: ">=", value: [-2, 1] }, { letter: "n", op: ">", value: [3, 1] }, { letter: "n", op: "<=", value: [-4, 1] }),
  graphEx(6, { letter: "h", op: "<=", value: [5, 1] }, { letter: "h", op: "<", value: [-1, 1] }, { letter: "h", op: ">=", value: [2, 1] }),
  graphEx(7, { letter: "t", op: "<=", value: [71, 10] }, { letter: "t", op: ">", value: [9, 2] }, { letter: "t", op: "<=", value: [-5, 2] }),
  graphEx(8, { letter: "r", op: ">=", value: [-2, 3] }, { letter: "r", op: "<", value: [1, 2] }, { letter: "r", op: ">=", value: [-3, 4] }),
];
// show decimals as decimals for the t ≤ 7.1 family
for (const ex of GRAPH.filter((e) => e.id === "ir-21-7")) {
  const build = ex.build;
  ex.build = (p: GraphP) => {
    const b = build(p);
    const dec = String(p.value[0] / p.value[1]).replace("-", "−");
    const frac = `${p.value[0] < 0 ? "−" : ""}[[${Math.abs(p.value[0])}/${p.value[1]}]]`;
    b.prompt = b.prompt.split(frac).join(dec);
    b.solution = b.solution.map((s) => s.split(frac).join(dec));
    return b;
  };
}

interface DiffP { op: "<=" | ">=" | "<" | ">"; v: number }
const DIFF_OPTS = (p: DiffP) => {
  const sym = OPWORD[p.op];
  const side = p.op.startsWith("<") ? "less" : "greater";
  return [
    p.op.includes("=")
      ? `x = ${p.v} has exactly one solution, ${p.v}. x ${sym} ${p.v} is true for ${p.v} and every number ${side} than ${p.v}.`
      : `x = ${p.v} has exactly one solution, ${p.v}. x ${sym} ${p.v} is true for every number ${side} than ${p.v}, but not ${p.v} itself.`,
    `They mean the same thing; both are true only for ${p.v}.`,
    `x ${sym} ${p.v} has no solutions, because ${p.v} doesn't work.`,
    `x = ${p.v} has many solutions, and x ${sym} ${p.v} has just one.`,
  ];
};
const DIFF: Exercise<DiffP> = {
  id: "ir-21-9", title: "Inequality or equation?", source: src(21, 9, 31), domain: "AAT", skill: "Inequalities", cluster: "negatives",
  base: { op: "<=", v: 5 }, variants: [{ op: ">=", v: 8 }, { op: "<", v: 3 }],
  solve: (p) => [q(DIFF_OPTS(p).findIndex((o) => o.startsWith(`x = ${p.v} has exactly one`)))],
  build: (p) => {
    const opts = DIFF_OPTS(p);
    return {
      prompt: `What is the difference between the inequality **x ${OPWORD[p.op]} ${p.v}** and the equation **x = ${p.v}**?`,
      answer: { fields: [{ kind: "choice", options: opts, correct: 0 }] },
      answerText: opts[0],
      hints: ["How many numbers make x = something true?", `Try a few numbers in x ${OPWORD[p.op]} ${p.v}: one bigger than ${p.v}, one smaller, and ${p.v} itself.`, "Does the inequality's symbol include “or equal to”?"],
      solution: [`x = ${p.v} is true for one number only.`, `x ${OPWORD[p.op]} ${p.v} is true for a whole ray of numbers on the number line${p.op.includes("=") ? `, including ${p.v}` : `, not including ${p.v}`}.`, `So: **${opts[0]}**`],
    };
  },
};

// ------------------------------------------------------------------ export
export const ALGEBRA: Exercise[] = [...WRITE, ...INTERP, REFLECT, ...EVAL, DISTRIB, ...POWERS, ...EQUIV, CHECKING, ...EQUATIONS, ...WRITE_INEQ, ...GRAPH, DIFF];
void (null as unknown as Built);
