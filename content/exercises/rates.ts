// i-Ready Grade 6 At-Home Activity Packet, Sets 1–6: ratios, rates, unit rates, unit conversion.
import { type Frac, add, cmp, div, eq, mul, q, sub, toNumber } from "../../lib/frac";
import type { Field } from "../../lib/check";
import type { Built, Exercise, Source } from "../../lib/types";
import { d, n, usd } from "../../lib/text";
import { type Diagram, table } from "../../lib/diagram";

type Num = number | string;
const Q = (x: Num, den: Num = 1) => div(q(x as any), q(den as any));
const UNV = "No teacher's key attached; computed and checked in code.";
const src = (ref: string): Source => ({ kind: "iReady", ref, key: "computed", unverified: UNV });
const fmt = (f: Frac) => {
  let den = f.d;
  while (den % 2n === 0n) den /= 2n;
  while (den % 5n === 0n) den /= 5n;
  return den === 1n ? d(f) : `≈ ${toNumber(f).toFixed(2)}`;
};
const money = (f: Frac) => {
  try {
    return usd(f);
  } catch {
    return `≈ $${toNumber(f).toFixed(4)}`;
  }
};
const ex = <P,>(e: Exercise<P>): Exercise => e as Exercise;
const YESNO = ["Yes", "No"];

// ------------------------------------------------------------------------------------------------
// Family: "a per b — find the amount for c"
interface ScaleP { a: Num; b: Num; c: Num }
interface ScaleWords {
  title: string;
  ref: string;
  skill: string;
  prompt: (p: ScaleP) => string;
  find: "A" | "B";
  labels: [string, string];
  u: { A: string; Aone: string; B: string; Bone: string };
  unit?: string;
  isMoney?: boolean;
  /** A, B, given; default A = a, B = b, given = c */
  rate?: (p: ScaleP) => [Frac, Frac, Frac];
  hints?: [string, string, string];
  /** steps shown before the unit-rate solution lines (e.g. a unit change) */
  preSolution?: (p: ScaleP) => string[];
  solution?: (p: ScaleP) => string[];
}
function scale(id: string, w: ScaleWords, base: ScaleP, v1: ScaleP, v2: ScaleP): Exercise {
  const rate = w.rate ?? ((p: ScaleP) => [Q(p.a), Q(p.b), Q(p.c)] as [Frac, Frac, Frac]);
  return ex<ScaleP>({
    id,
    title: w.title,
    source: src(w.ref),
    domain: "AAT",
    skill: w.skill,
    cluster: "rates",
    base,
    variants: [v1, v2],
    solve: (p) => {
      const [a, b, c] = rate(p);
      // cross-multiplication: answer / c = a / b (find A) or answer / c = b / a (find B)
      return w.find === "A" ? [div(mul(a, c), b)] : [div(mul(b, c), a)];
    },
    build: (p) => {
      const [a, b, c] = rate(p);
      const unitRate = w.find === "A" ? div(a, b) : div(b, a);
      const ans = mul(unitRate, c);
      const [num, den] = w.find === "A" ? [w.u.A, w.u.Bone] : [w.u.B, w.u.Aone];
      const [top, bot] = w.find === "A" ? [a, b] : [b, a];
      const showV = (f: Frac) => (w.isMoney ? money(f) : d(f));
      const field: Field = { kind: "number", value: ans, ...(w.unit ? { unit: w.unit } : {}) };
      return {
        prompt: w.prompt(p),
        answer: { fields: [field] },
        answerText: w.isMoney ? money(ans) : `${d(ans)} ${num}`,
        hints: w.hints ?? [
          `Start by finding the amount for just **one** ${den}.`,
          `"Per one ${den}" is a division: ${num} ÷ ${w.find === "A" ? w.u.B : w.u.A}, using the numbers you're given.`,
          `Now scale that one-${den} amount up to the size you're asked about.`,
        ],
        solution: w.solution ? w.solution(p) : [
          ...(w.preSolution ? w.preSolution(p) : []),
          `Unit rate: ${w.isMoney && w.find === "A" ? money(top) : d(top)} ÷ ${d(bot)} = ${w.isMoney ? showV(unitRate) : d(unitRate)} ${w.isMoney ? "" : num + " "}per ${den}.`.replace(/\s+/g, " "),
          `Scale up: ${w.isMoney ? showV(unitRate) : d(unitRate)} × ${d(c)} = **${showV(ans)}${w.isMoney ? "" : ` ${num}`}**.`,
        ],
      } satisfies Built;
    },
  });
}

// ------------------------------------------------------------------------------------------------
// Family: compare two rates
interface CmpP { x: [Num, Num]; y: [Num, Num] }
interface CmpWords {
  title: string;
  ref: string;
  names: [string, string];
  prompt: (p: CmpP) => string;
  question: string;
  /** true: the higher rate wins; false: the lower rate wins */
  higher: boolean;
  rateUnit: string;
  /** [what's counted, the unit it's per (singular), that unit plural] */
  labels: [string, string, string];
  isMoney?: boolean;
  /** the table the original question shows */
  table?: (p: CmpP) => Diagram;
}
function compare(id: string, w: CmpWords, base: CmpP, v1: CmpP, v2: CmpP): Exercise {
  const rates = (p: CmpP) => [div(Q(p.x[0]), Q(p.x[1])), div(Q(p.y[0]), Q(p.y[1]))];
  const show = (f: Frac) => (w.isMoney ? (fmt(f).startsWith("≈") ? `≈ $${toNumber(f).toFixed(3)}` : money(f)) : fmt(f));
  return ex<CmpP>({
    id,
    title: w.title,
    source: src(w.ref),
    domain: "AAT",
    skill: "Comparing rates",
    cluster: "rates",
    base,
    variants: [v1, v2],
    solve: (p) => {
      // cross-multiply instead of dividing: x0/x1 vs y0/y1  <=>  x0*y1 vs y0*x1
      const c = cmp(mul(Q(p.x[0]), Q(p.y[1])), mul(Q(p.y[0]), Q(p.x[1])));
      if (c === 0) return [q(2)];
      return [q((c > 0) === w.higher ? 0 : 1)];
    },
    build: (p) => {
      const [r1, r2] = rates(p);
      const c = cmp(r1, r2);
      const win = c === 0 ? 2 : (c > 0) === w.higher ? 0 : 1;
      return {
        diagram: w.table?.(p),
        prompt: w.prompt(p),
        answer: { fields: [{ kind: "choice", label: w.question, options: [w.names[0], w.names[1], "They're the same"], correct: win }] },
        answerText: win === 2 ? "they're the same" : w.names[win],
        hints: [
          `The two totals cover different amounts, so compare them for **one** of the same thing.`,
          `Divide each person's total by how much it took to get it. That gives each one's ${w.rateUnit}.`,
          `Now compare the two unit rates. Read the question again: do you want the bigger one or the smaller one?`,
        ],
        solution: [
          `${w.names[0]}: ${d(Q(p.x[0]))} ÷ ${d(Q(p.x[1]))} = ${show(r1)} ${w.rateUnit}.`,
          `${w.names[1]}: ${d(Q(p.y[0]))} ÷ ${d(Q(p.y[1]))} = ${show(r2)} ${w.rateUnit}.`,
          win === 2 ? "They're the same." : `${w.higher ? "Higher" : "Lower"} is better here, so the answer is **${w.names[win]}**.`,
        ],
      } satisfies Built;
    },
  });
}

// ------------------------------------------------------------------------------------------------
// Set 1  Understanding Ratio Concepts (p.3)
type R11 = { balls: number; rackets: number };
const ir_1_1 = ex<R11>({
  id: "ir-1-1",
  title: "Balls and rackets",
  source: src("Set 1 #1 (p.3)"),
  domain: "AAT",
  skill: "Ratio language",
  cluster: "rates",
  base: { balls: 5, rackets: 3 },
  variants: [{ balls: 4, rackets: 7 }, { balls: 9, rackets: 2 }],
  solve: ({ balls, rackets }) => {
    // count it out: one group of the bin has `balls` balls and `rackets` rackets
    let total = 0;
    for (const _ of [...Array(balls)]) total++;
    for (const _ of [...Array(rackets)]) total++;
    return [q(balls, rackets), q(balls, total)];
  },
  build: ({ balls, rackets }) => ({
    prompt: `A coach keeps a bin of gear. For every **${balls} tennis balls** there are **${rackets} rackets**.\n\nWrite these ratios. (Type a ratio as a : b.)`,
    answer: {
      fields: [
        { kind: "number", label: "tennis balls to rackets", value: q(balls, rackets) },
        { kind: "number", label: "tennis balls to all the tennis gear", value: q(balls, balls + rackets) },
      ],
    },
    answerText: `${balls} : ${rackets} and ${balls} : ${balls + rackets}`,
    hints: [
      "A ratio compares two amounts in the order the words say them.",
      "The first one compares two parts: balls with rackets.",
      "\"All the gear\" means balls and rackets together. Add them up for the second number.",
    ],
    solution: [`Balls to rackets: ${balls} : ${rackets}, or ${balls}/${rackets}.`, `All the gear is ${balls} + ${rackets} = ${balls + rackets} pieces, so balls to all: **${balls} : ${balls + rackets}**.`],
  }),
});

type R12 = { total: number; tiger: number; sand: number };
const PAIRS_A: [string, string][] = [["tiger", "sand"], ["tiger", "all"], ["sand", "tiger"], ["bull", "all"]];
const PAIRS_B: [string, string][] = [["bull", "all"], ["bull", "tiger"], ["tiger", "all"], ["sand", "bull"]];
const NAME: Record<string, string> = { tiger: "tiger shark teeth", sand: "sand shark teeth", bull: "bull shark teeth", all: "all the teeth" };
const ir_1_2 = ex<R12>({
  id: "ir-1-2",
  title: "Shark teeth",
  source: src("Set 1 #2 (p.3)"),
  domain: "AAT",
  skill: "Ratio language",
  cluster: "rates",
  base: { total: 18, tiger: 6, sand: 8 },
  variants: [{ total: 20, tiger: 5, sand: 9 }, { total: 15, tiger: 7, sand: 3 }],
  solve: ({ total, tiger, sand }) => {
    const count: Record<string, number> = { tiger, sand, all: total, bull: total - tiger - sand };
    const match = (pairs: [string, string][], a: number, b: number) => pairs.findIndex(([x, y]) => count[x] === a && count[y] === b);
    return [q(match(PAIRS_A, tiger, sand)), q(match(PAIRS_B, total - tiger - sand, total))];
  },
  build: ({ total, tiger, sand }) => {
    const bull = total - tiger - sand;
    const opt = (pairs: [string, string][]) => pairs.map(([x, y]) => `${NAME[x]} to ${NAME[y]}`);
    return {
      prompt: `Jada collected **${total} shark teeth**: **${tiger} tiger shark**, **${sand} sand shark**, and the rest are bull shark teeth.`,
      answer: {
        fields: [
          { kind: "choice", label: `What does the ratio ${tiger} : ${sand} compare?`, options: opt(PAIRS_A), correct: 0 },
          { kind: "choice", label: `What does the ratio ${bull} : ${total} compare?`, options: opt(PAIRS_B), correct: 0 },
        ],
      },
      answerText: `${tiger} : ${sand} is tiger to sand; ${bull} : ${total} is bull to all the teeth`,
      hints: [
        "The bull shark teeth are whatever is left after the tiger and sand shark teeth.",
        "For each ratio, look at the two numbers and find which group has that many.",
        "If one number is the whole collection, the ratio is part to whole.",
      ],
      solution: [`Bull shark teeth: ${total} − ${tiger} − ${sand} = **${bull}**.`, `${tiger} : ${sand} matches ${tiger} tiger and ${sand} sand teeth: part to part.`, `${bull} : ${total} matches ${bull} bull teeth out of all ${total}: part to whole.`],
    };
  },
});

type R13 = { red: number; blue: number; perm: number[] };
const CONCEPT = [
  "Part-to-part compares one group with another group; part-to-whole compares one group with the total.",
  "Part-to-part ratios are always smaller than part-to-whole ratios.",
  "They are the same thing written two different ways.",
  "Part-to-whole compares two groups; part-to-part compares a group with the total.",
];
const ir_1_3 = ex<R13>({
  id: "ir-1-3",
  title: "Part to part, part to whole",
  source: { ...src("Set 1 #3 (p.3)"), unverified: "Explain item turned into a multiple-choice check." },
  domain: "AAT",
  skill: "Ratio language",
  cluster: "rates",
  base: { red: 3, blue: 5, perm: [0, 1, 2, 3] },
  variants: [{ red: 4, blue: 7, perm: [2, 0, 3, 1] }, { red: 6, blue: 1, perm: [3, 1, 0, 2] }],
  solve: ({ perm }) => [q(perm.indexOf(0))],
  build: ({ red, blue, perm }) => ({
    prompt: `How are part-to-part ratios different from part-to-whole ratios?`,
    answer: { fields: [{ kind: "choice", options: perm.map((i) => CONCEPT[i]), correct: perm.indexOf(0) }] },
    answerText: CONCEPT[0],
    hints: ["Say what each ratio's two numbers count.", "In the first ratio, both numbers are groups of marbles of one colour.", "In the second ratio, one number counts every marble in the bag."],
    solution: [`${red} : ${blue} is red to blue: two parts.`, `${red} : ${red + blue} is red to all the marbles: a part and the whole.`, `So: **part-to-part compares two groups; part-to-whole compares a group with the total.**`],
  }),
});

// ------------------------------------------------------------------------------------------------
// Set 2  Using Equivalent Ratios (p.4)
const MIN = { A: "minutes", Aone: "minute", B: "miles", Bone: "mile" };
const set2: Exercise[] = [
  scale("ir-2-1", { title: "Training run", ref: "Set 2 #1 (p.4)", skill: "Equivalent ratios", find: "A", labels: ["minutes", "miles"], u: MIN, unit: "minutes",
    prompt: (p) => `Josie is training for a race. The ratio of the number of minutes she runs to the number of miles she runs is **${p.a} to ${p.b}**. She plans to run **${p.c} miles**. How many minutes will it take her?` },
    { a: 24, b: 3, c: 10 }, { a: 18, b: 2, c: 7 }, { a: 30, b: 4, c: 6 }),
  scale("ir-2-2", { title: "Soup for the banquet", ref: "Set 2 #2 (p.4)", skill: "Equivalent ratios", find: "A", labels: ["cups of soup", "guests"], u: { A: "cups", Aone: "cup", B: "guests", Bone: "guest" }, unit: "cups",
    prompt: (p) => `A chef planning for a large banquet thinks that **${p.a} out of every ${p.b} dinner guests** will order his soup appetizer. He expects **${p.c} guests** at the banquet. Estimate how many cups of soup he should prepare.` },
    { a: 2, b: 5, c: 800 }, { a: 3, b: 8, c: 640 }, { a: 3, b: 4, c: 500 }),
  scale("ir-2-3", { title: "Fruit salad", ref: "Set 2 #3 (p.4)", skill: "Equivalent ratios", find: "A", labels: ["cups of peaches", "cups of salad"], u: { A: "cups of peaches", Aone: "cup of peaches", B: "cups of salad", Bone: "cup of salad" }, unit: "cups",
    prompt: (p) => `Fred is making a fruit salad. The ratio of cups of peaches to cups of cherries is **${p.a} to ${p.b}**. How many cups of peaches will Fred need to make **${p.c} cups** of fruit salad?`,
    rate: (p) => [Q(p.a), add(Q(p.a), Q(p.b)), Q(p.c)],
    hints: ["The salad is peaches and cherries together. How many cups make one small batch?", "Find what fraction of each batch is peaches.", "Take that fraction of the whole salad."] },
    { a: 2, b: 3, c: 60 }, { a: 3, b: 5, c: 48 }, { a: 4, b: 1, c: 35 }),
  scale("ir-2-4", { title: "Plant giveaway", ref: "Set 2 #4 (p.4)", skill: "Equivalent ratios", find: "A", labels: ["plants", "families"], u: { A: "plants", Aone: "plant", B: "families", Bone: "family" }, unit: "plants",
    prompt: (p) => `Last spring a garden center gave **${p.a} plants to ${p.b} families**. At the same rate, how many plants does it need for **${p.c} families**?` },
    { a: 150, b: 50, c: 65 }, { a: 120, b: 40, c: 55 }, { a: 96, b: 32, c: 45 }),
  scale("ir-2-5", { title: "Shelter dogs", ref: "Set 2 #5 (p.4)", skill: "Equivalent ratios", find: "A", labels: ["dogs", "cats"], u: { A: "dogs", Aone: "dog", B: "cats", Bone: "cat" }, unit: "dogs",
    prompt: (p) => `An animal shelter has **${p.a} dogs and ${p.b} cats**. The ratio of dogs to cats stays the same all month. Later there are **${p.c} cats**. How many dogs are there?` },
    { a: 49, b: 28, c: 20 }, { a: 45, b: 27, c: 15 }, { a: 36, b: 24, c: 10 }),
  scale("ir-2-6", { title: "Ivy centerpieces", ref: "Set 2 #6 (p.4)", skill: "Equivalent ratios", find: "A", labels: ["ivy stems", "centerpieces"], u: { A: "stems", Aone: "stem", B: "centerpieces", Bone: "centerpiece" },
    prompt: (p) => `A planner uses **${p.a} ivy stems for ${p.b} centerpieces**. She now needs only **${p.c} centerpieces**. How many stems keep the same ratio?` },
    { a: 72, b: 18, c: 16 }, { a: 60, b: 12, c: 9 }, { a: 84, b: 21, c: 15 }),
];

// ------------------------------------------------------------------------------------------------
// Set 3  Understanding Rate Concepts (p.5–6)
type R31 = { m: [number, number]; a: [number, number] };
const ir_3_1 = ex<R31>({
  id: "ir-3-1",
  title: "Puzzle race",
  source: src("Set 3 #1 (p.5)"),
  domain: "AAT",
  skill: "Unit rates",
  cluster: "rates",
  base: { m: [30, 5], a: [28, 4] },
  variants: [{ m: [36, 6], a: [25, 5] }, { m: [40, 8], a: [42, 6] }],
  solve: ({ m, a }) => {
    // minutes per puzzle by repeated subtraction
    const per = ([min, puz]: [number, number]) => {
      let k = 0;
      while ((k + 1) * puz <= min) k++;
      return k * puz === min ? q(k) : q(min, puz);
    };
    const pm = per(m), pa = per(a);
    return [pm, pa, q(cmp(pm, pa) < 0 ? 0 : cmp(pm, pa) > 0 ? 1 : 2)];
  },
  build: ({ m, a }) => {
    const pm = q(m[0], m[1]), pa = q(a[0], a[1]);
    const win = cmp(pm, pa) < 0 ? 0 : cmp(pm, pa) > 0 ? 1 : 2;
    return {
      prompt: `Maya solves **${m[1]} logic puzzles in ${m[0]} minutes**. Amy solves **${a[1]} puzzles in ${a[0]} minutes**.`,
      answer: {
        fields: [
          { kind: "number", label: "Maya: minutes per puzzle", value: pm, unit: "minutes" },
          { kind: "number", label: "Amy: minutes per puzzle", value: pa, unit: "minutes" },
          { kind: "choice", label: "With the same pile of puzzles, who finishes first?", options: ["Maya", "Amy", "They tie"], correct: win },
        ],
      },
      answerText: `Maya ${d(pm)} min, Amy ${d(pa)} min per puzzle; ${["Maya", "Amy", "they tie"][win]}`,
      hints: ["Minutes per puzzle means: how long does ONE puzzle take each girl?", "Share each girl's minutes equally among her puzzles.", "Fewer minutes per puzzle means faster."],
      solution: [`Maya: ${m[0]} ÷ ${m[1]} = ${d(pm)} minutes per puzzle.`, `Amy: ${a[0]} ÷ ${a[1]} = ${d(pa)} minutes per puzzle.`, win === 2 ? "Same speed: they tie." : `**${["Maya", "Amy"][win]}** needs fewer minutes per puzzle, so she finishes first.`],
    };
  },
});

type R32 = { gal: number; min: number; t: number };
const ir_3_2 = ex<R32>({
  id: "ir-3-2",
  title: "Garden hose",
  source: src("Set 3 #2 (p.5)"),
  domain: "AAT",
  skill: "Unit rates",
  cluster: "rates",
  base: { gal: 36, min: 3, t: 10 },
  variants: [{ gal: 45, min: 5, t: 8 }, { gal: 28, min: 4, t: 6 }],
  solve: ({ gal, min, t }) => {
    // table of equivalent ratios: scale both by t, then divide by min
    const g = div(mul(q(gal), q(t)), q(min));
    return [div(q(gal), q(min)), div(q(min), q(gal)), g];
  },
  build: ({ gal, min, t }) => {
    const gpm = q(gal, min), mpg = q(min, gal), tot = mul(gpm, q(t));
    return {
      prompt: `A garden hose pours **${gal} gallons in ${min} minutes**.`,
      answer: {
        fields: [
          { kind: "number", label: "gallons per minute", value: gpm },
          { kind: "number", label: "minutes per gallon", value: mpg },
          { kind: "number", label: `gallons in ${t} minutes`, value: tot, unit: "gallons" },
        ],
      },
      answerText: `${d(gpm)} gal/min, ${n(mpg)} min/gal, ${d(tot)} gallons`,
      hints: ["\"Per minute\" means: how much in ONE minute? Share the gallons among the minutes.", "\"Minutes per gallon\" flips it: how long does ONE gallon take?", "For the last part, use the gallons-per-minute rate for the longer time."],
      solution: [`Gallons per minute: ${gal} ÷ ${min} = ${d(gpm)}.`, `Minutes per gallon: ${min} ÷ ${gal} = ${n(mpg)}.`, `In ${t} minutes: ${d(gpm)} × ${t} = **${d(tot)} gallons**.`],
    };
  },
});

type R33 = { d: number; h: number; stops: number; stopMin: number; deadline: Num };
const ir_3_3 = ex<R33>({
  id: "ir-3-3",
  title: "Road trip with stops",
  source: src("Set 3 #3 (p.6)"),
  domain: "AAT",
  skill: "Unit rates",
  cluster: "rates",
  base: { d: 216, h: 4, stops: 2, stopMin: 10, deadline: 4 },
  variants: [{ d: 180, h: 3, stops: 2, stopMin: 10, deadline: "3.5" }, { d: 150, h: 3, stops: 3, stopMin: 10, deadline: 3 }],
  solve: ({ d: dist, h, stops, stopMin, deadline }) => {
    // minutes needed vs minutes available, in whole minutes
    const speed = div(q(dist), q(h));
    const needMin = add(div(mul(q(dist), q(60)), speed), q(stops * stopMin));
    const haveMin = mul(Q(deadline), q(60));
    return [speed, q(cmp(needMin, haveMin) <= 0 ? 0 : 1)];
  },
  build: ({ d: dist, h, stops, stopMin, deadline }) => {
    const speed = q(dist, h);
    const drive = sub(Q(deadline), q(stops * stopMin, 60));
    const reach = mul(speed, drive);
    const yes = cmp(reach, q(dist)) >= 0;
    return {
      prompt: `Max drives **${dist} miles in ${h} hours** at a steady speed.\n\nNext time he drives the same ${dist} miles at the same speed, but makes **${stops} stops of ${stopMin} minutes** each. He wants to arrive within **${d(Q(deadline))} hours** of leaving.`,
      answer: {
        fields: [
          { kind: "number", label: "His speed", value: speed, unit: "mph" },
          { kind: "choice", label: "Can he arrive in time?", options: YESNO, correct: yes ? 0 : 1 },
        ],
      },
      answerText: `${d(speed)} mph; ${yes ? "yes" : "no"}`,
      hints: ["Speed in miles per hour: how many miles in ONE hour?", "The stops eat into his time. How much driving time is left?", "At his speed, how far can he get in that driving time? Is it enough?"],
      solution: [`Speed: ${dist} ÷ ${h} = ${d(speed)} miles per hour.`, `Stops: ${stops} × ${stopMin} = ${stops * stopMin} minutes, leaving ${n(drive)} hours of driving.`, `${d(speed)} × ${n(drive)} = ${d(reach)} miles, ${yes ? "enough" : `short of ${dist}`}. So **${yes ? "yes" : "no"}**.`],
    };
  },
});

// ------------------------------------------------------------------------------------------------
// Set 4  Using Unit Rates to Find Equivalent Ratios (p.7–8)
const set4: Exercise[] = [
  scale("ir-4-1", { title: "Mowing lawns", ref: "Set 4 #1 (p.7)", skill: "Unit rates", find: "A", labels: ["lawns", "hours"], u: { A: "lawns", Aone: "lawn", B: "hours", Bone: "hour" }, unit: "lawns",
    prompt: (p) => `Rachel mows **${p.a} lawns in ${p.b} hours**. At that rate, how many lawns can she mow in **${p.c} hours**?` },
    { a: 5, b: 8, c: 40 }, { a: 6, b: 10, c: 25 }, { a: 7, b: 6, c: 30 }),
  scale("ir-4-2", { title: "New roof", ref: "Set 4 #2 (p.7)", skill: "Unit rates", find: "A", labels: ["dollars", "square feet"], u: { A: "dollars", Aone: "dollar", B: "square feet", Bone: "square foot" }, unit: "dollars", isMoney: true,
    prompt: (p) => `A roofer charges **$${Number(p.a).toLocaleString("en-US")} for every ${p.b} square feet**. What does **${Number(p.c).toLocaleString("en-US")} square feet** cost?` },
    { a: 1200, b: 100, c: 1100 }, { a: 950, b: 100, c: 600 }, { a: 1500, b: 100, c: 800 }),
  scale("ir-4-3", { title: "Long run", ref: "Set 4 #3 (p.7)", skill: "Unit rates", find: "A", labels: ["miles", "hours"], u: { A: "miles", Aone: "mile", B: "hours", Bone: "hour" }, unit: "miles",
    prompt: (p) => `Jill runs **${p.a} miles in ${p.b} hours**. At that pace, how far could she run in **${p.c} hours**?` },
    { a: "14.5", b: 2, c: 3 }, { a: "12.5", b: 2, c: 5 }, { a: "9.6", b: 3, c: 4 }),
  scale("ir-4-4", { title: "Catches per game", ref: "Set 4 #4 (p.7)", skill: "Unit rates", find: "A", labels: ["passes", "games"], u: { A: "passes", Aone: "pass", B: "games", Bone: "game" }, unit: "passes",
    prompt: (p) => `Bobby catches **${p.a} passes in ${p.b} games**. At that rate, how many does he catch in **${p.c} games**?` },
    { a: 8, b: 3, c: 15 }, { a: 10, b: 4, c: 14 }, { a: 6, b: 5, c: 20 }),
  scale("ir-4-5", { title: "Cracker boxes", ref: "Set 4 #5 (p.7)", skill: "Unit rates", find: "A", labels: ["dollars", "boxes"], u: { A: "dollars", Aone: "dollar", B: "boxes", Bone: "box" }, unit: "dollars", isMoney: true,
    prompt: (p) => `**${p.b} boxes** of crackers cost **$${p.a}**. How much do **${p.c} boxes** cost?` },
    { a: 9, b: 5, c: 20 }, { a: 7, b: 4, c: 12 }, { a: 15, b: 6, c: 10 }),
  scale("ir-4-6", { title: "Jet flight", ref: "Set 4 #6 (p.7)", skill: "Unit rates", find: "A", labels: ["miles", "hours"], u: { A: "miles", Aone: "mile", B: "hours", Bone: "hour" }, unit: "miles",
    prompt: (p) => `A jet flies **${Number(p.a).toLocaleString("en-US")} miles in ${p.b} hours**. At that speed, how far does it fly in **${p.c} hours**?` },
    { a: 1100, b: 2, c: 8 }, { a: 1240, b: 2, c: 5 }, { a: 1350, b: 3, c: 7 }),
  scale("ir-4-7", { title: "Homework pages", ref: "Set 4 #7 (p.8)", skill: "Unit rates", find: "A", labels: ["pages", "minutes"], u: { A: "pages", Aone: "page", B: "minutes", Bone: "minute" }, unit: "pages",
    prompt: (p) => `Dan finishes **${p.a} pages of math in ${p.b} minutes**. At that rate, how many pages does he finish in **${p.c} minutes**?` },
    { a: 2, b: 32, c: 200 }, { a: 3, b: 40, c: 100 }, { a: 5, b: 45, c: 72 }),
  scale("ir-4-8", { title: "Paycheck", ref: "Set 4 #8 (p.8)", skill: "Unit rates", find: "A", labels: ["dollars", "days"], u: { A: "dollars", Aone: "dollar", B: "days", Bone: "day" }, unit: "dollars", isMoney: true,
    prompt: (p) => `Kendra earns **$${p.a} for ${p.b} days** of work. At that rate, what does she earn for **${p.c} days**?` },
    { a: 300, b: 5, c: 24 }, { a: 280, b: 4, c: 15 }, { a: 450, b: 6, c: 22 }),
  scale("ir-4-9", { title: "Laying a floor", ref: "Set 4 #9 (p.8)", skill: "Unit rates", find: "B", labels: ["square feet", "minutes"], u: { A: "square feet", Aone: "square foot", B: "minutes", Bone: "minute" }, unit: "minutes",
    prompt: (p) => `Tim lays **${p.a} square feet of floor in ${p.b} minutes**. How many minutes does **${p.c} square feet** take?` },
    { a: 45, b: 50, c: 495 }, { a: 36, b: 40, c: 252 }, { a: 60, b: 75, c: 420 }),
  scale("ir-4-10", { title: "Tea leaves", ref: "Set 4 #10 (p.8)", skill: "Unit rates", find: "A", labels: ["dollars", "ounces"], u: { A: "dollars", Aone: "dollar", B: "ounces", Bone: "ounce" }, unit: "dollars", isMoney: true,
    prompt: (p) => `**${p.b} ounces** of tea leaves cost **$${p.a}**. How much do **${p.c} ounces** cost?` },
    { a: "2.35", b: 5, c: 12 }, { a: "3.15", b: 7, c: 10 }, { a: "1.92", b: 4, c: 9 }),
];

type R411 = { oz: number; price: string; cash: number; perm: number[] };
const ir_4_11 = ex<R411>({
  id: "ir-4-11",
  title: "Turn the question around",
  source: { ...src("Set 4 #11 (p.8)"), unverified: "Explain item turned into a multiple-choice check." },
  domain: "AAT",
  skill: "Unit rates",
  cluster: "rates",
  base: { oz: 5, price: "2.35", cash: 10, perm: [0, 1, 2, 3] },
  variants: [{ oz: 7, price: "3.15", cash: 20, perm: [1, 0, 3, 2] }, { oz: 4, price: "1.92", cash: 12, perm: [2, 3, 0, 1] }],
  solve: ({ oz, price, cash, perm }) => {
    // the right method is the one whose result r satisfies r × (price ÷ oz) = cash
    const results = [div(mul(q(oz), q(cash)), Q(price)), mul(Q(price), q(cash)), mul(div(Q(price), q(oz)), q(cash)), div(q(cash), q(oz))];
    const good = results.findIndex((r) => eq(mul(r, div(Q(price), q(oz))), q(cash)));
    return [q(perm.indexOf(good))];
  },
  build: ({ oz, price, cash, perm }) => {
    const P = Q(price);
    const right = div(mul(q(oz), q(cash)), P);
    const opts = [
      `Find ounces per dollar (${oz} ÷ ${price}), then multiply by ${cash}: about ${toNumber(right).toFixed(1)} oz`,
      `Multiply ${price} by ${cash}: ${d(mul(P, q(cash)))} oz`,
      `Find dollars per ounce (${price} ÷ ${oz}), then multiply by ${cash}: ${d(mul(div(P, q(oz)), q(cash)))} oz`,
      `Divide ${cash} by ${oz}: ${d(q(cash, oz))} oz`,
    ];
    return {
      prompt: `**${oz} ounces** of tea cost **$${price}**. This time the question is: how many ounces can you buy with **$${cash}**?\n\nWhich method works?`,
      answer: { fields: [{ kind: "choice", options: perm.map((i) => opts[i]), correct: perm.indexOf(0) }] },
      answerText: opts[0],
      hints: ["Now the dollars are given and the ounces are unknown.", "So you want a rate with ounces on top: ounces for ONE dollar.", "Check each method: does the answer, priced at the store's rate, cost the money you have?"],
      solution: [`Ounces per dollar: ${oz} ÷ ${price} ≈ ${toNumber(div(q(oz), P)).toFixed(3)}.`, `Times ${cash}: about **${toNumber(right).toFixed(1)} ounces**.`, `Check: ${toNumber(right).toFixed(2)} oz × $${toNumber(div(P, q(oz))).toFixed(3)} per oz ≈ $${cash}.`],
    };
  },
});

// ------------------------------------------------------------------------------------------------
// Set 5  Using Unit Rates to Compare Ratios (p.9–10)
const set5: Exercise[] = [
  compare("ir-5-1", { title: "Car sales", ref: "Set 5 #1 (p.9)", names: ["Shawn", "Brett"], question: "Who sells more cars per week?", higher: true, rateUnit: "cars per week", labels: ["cars", "week", "weeks"],
    prompt: (p) => `Shawn sells **${p.x[0]} cars in ${p.x[1]} weeks**. Brett sells **${p.y[0]} cars in ${p.y[1]} weeks**.` },
    { x: [36, 4], y: [56, 7] }, { x: [30, 5], y: [42, 6] }, { x: [45, 5], y: [32, 4] }),
  compare("ir-5-2", { title: "Gas mileage", ref: "Set 5 #2 (p.9)", names: ["Pickup truck", "Minivan"], question: "Which vehicle travels more miles per gallon?", higher: true, rateUnit: "miles per gallon", labels: ["miles", "gallon", "gallons"],
    prompt: () => `The table shows the gas mileage of two vehicles.`,
    table: (p) => table(["Car", "Miles", "Gallons"], [["Pickup Truck", p.x[0], p.x[1]], ["Minivan", p.y[0], p.y[1]]]) },
    { x: [120, 8], y: [180, 10] }, { x: [150, 6], y: [168, 8] }, { x: [132, 6], y: [230, 10] }),
  compare("ir-5-3", { title: "Mowing prices", ref: "Set 5 #3 (p.9)", names: ["Joe", "Chris"], question: "Who charges more per acre?", higher: true, rateUnit: "dollars per acre", labels: ["dollars", "acre", "acres"], isMoney: true,
    prompt: (p) => `Joe charges **$${p.x[0]} to mow ${p.x[1]} acres**. Chris charges **$${p.y[0]} to mow ${p.y[1]} acres**.` },
    { x: [40, 2], y: [30, "1.2"] }, { x: [45, "1.5"], y: [52, 2] }, { x: [36, 2], y: [33, "1.5"] }),
  compare("ir-5-4", { title: "Sprint", ref: "Set 5 #4 (p.9)", names: ["Ellen", "Lindsay"], question: "Who ran faster?", higher: true, rateUnit: "meters per second", labels: ["meters", "second", "seconds"],
    prompt: () => `The table shows the time it took two athletes to run different races.`,
    table: (p) => table(["Athlete", "Seconds", "Meters"], [["Ellen", p.x[1], p.x[0]], ["Lindsay", p.y[1], p.y[0]]]) },
    { x: [200, 28], y: [400, 60] }, { x: [100, 16], y: [200, 30] }, { x: [400, 64], y: [800, 130] }),
  compare("ir-5-5", { title: "Yards per carry", ref: "Set 5 #5 (p.10)", names: ["Branden", "Pete"], question: "Who runs farther per carry?", higher: true, rateUnit: "yards per carry", labels: ["yards", "carry", "carries"],
    prompt: (p) => `Branden runs for **${p.x[0]} yards on ${p.x[1]} carries**. Pete runs for **${p.y[0]} yards on ${p.y[1]} carries**.` },
    { x: [550, 75], y: [380, 42] }, { x: [480, 60], y: [300, 40] }, { x: [350, 50], y: [264, 33] }),
  compare("ir-5-6", { title: "Cereal boxes", ref: "Set 5 #6 (p.10)", names: ["Brand A", "Brand B"], question: "Which is the better price per ounce?", higher: false, rateUnit: "dollars per ounce", labels: ["dollars", "ounce", "ounces"], isMoney: true,
    prompt: () => `The table shows the price of two cereal brands and the number of ounces per box.`,
    table: (p) => table(["Cereal", "Ounces", "Price"], [["Brand A", p.x[1], `$${p.x[0]}`], ["Brand B", p.y[1], `$${p.y[0]}`]]) },
    { x: ["2.50", 18], y: ["3.50", 24] }, { x: ["3.20", 16], y: ["3.60", 20] }, { x: ["2.40", 12], y: ["4.50", 18] }),
];

type R57 = { A: [number, string]; B: [number, string]; low: string; high: string; aLow: string; small: number; perm: number[] };
const ir_5_7 = ex<R57>({
  id: "ir-5-7",
  title: "Flip the better buy",
  source: { ...src("Set 5 #7 (p.10)"), unverified: "Open item turned into a 'which change flips the answer' check." },
  domain: "AAT",
  skill: "Comparing rates",
  cluster: "rates",
  base: { A: [18, "2.50"], B: [24, "3.50"], low: "3.20", high: "3.60", aLow: "2.40", small: 22, perm: [0, 1, 2, 3] },
  variants: [
    { A: [16, "3.20"], B: [20, "4.40"], low: "3.80", high: "4.60", aLow: "3.00", small: 18, perm: [2, 0, 1, 3] },
    { A: [12, "2.40"], B: [18, "4.50"], low: "3.42", high: "4.80", aLow: "2.16", small: 16, perm: [3, 2, 0, 1] },
  ],
  solve: (p) => {
    // try each change and see whether B now costs less per ounce than A (cross-multiplied)
    const bBetter = (aOz: number, aPrice: Frac, bOz: number, bPrice: Frac) => cmp(mul(bPrice, q(aOz)), mul(aPrice, q(bOz))) < 0;
    const changes = [
      bBetter(p.A[0], Q(p.A[1]), p.B[0], Q(p.low)),
      bBetter(p.A[0], Q(p.A[1]), p.B[0], Q(p.high)),
      bBetter(p.A[0], Q(p.aLow), p.B[0], Q(p.B[1])),
      bBetter(p.A[0], Q(p.A[1]), p.small, Q(p.B[1])),
    ];
    return [q(p.perm.indexOf(changes.indexOf(true)))];
  },
  build: (p) => {
    const ra = div(Q(p.A[1]), q(p.A[0]));
    const rbNow = div(Q(p.B[1]), q(p.B[0]));
    const rbLow = div(Q(p.low), q(p.B[0]));
    const opts = [`Lower Brand B's price to $${p.low}`, `Raise Brand B's price to $${p.high}`, `Lower Brand A's price to $${p.aLow}`, `Shrink Brand B's box to ${p.small} ounces, same price`];
    const c3 = (f: Frac) => `$${toNumber(f).toFixed(3)}`;
    return {
      diagram: table(["Cereal", "Ounces", "Price"], [["Brand A", p.A[0], `$${p.A[1]}`], ["Brand B", p.B[0], `$${p.B[1]}`]]),
      prompt: `The table shows the price of two cereal brands and the number of ounces per box.\n\nWhich change to the table would change the answer to “Which is the better price per ounce?”`,
      answer: { fields: [{ kind: "choice", options: p.perm.map((i) => opts[i]), correct: p.perm.indexOf(0) }] },
      answerText: opts[0],
      hints: ["Better buy = fewer dollars for each ounce.", "To make B win, B's price per ounce has to drop below A's, or A's has to rise above B's.", "Work out the price per ounce after each change and compare."],
      solution: [`Now: A ≈ ${c3(ra)} per ounce, B ≈ ${c3(rbNow)} per ounce.`, `At $${p.low}, B costs ≈ ${c3(rbLow)} per ounce, less than A.`, `The other changes make B dearer or A cheaper, so A stays ahead. Answer: **${opts[0]}**.`],
    };
  },
});

// ------------------------------------------------------------------------------------------------
// Set 6  Using Unit Rates to Convert Measurements (p.11–12)
type R61 = { len: number; need: number };
const ir_6_1 = ex<R61>({
  id: "ir-6-1",
  title: "Is the board long enough?",
  source: src("Set 6 #1 (p.11)"),
  domain: "AAT",
  skill: "Unit conversion",
  cluster: "rates",
  base: { len: 12, need: 29 },
  variants: [{ len: 10, need: 26 }, { len: 15, need: 38 }],
  solve: ({ len, need }) => [q(254 * len >= 100 * need ? 0 : 1)], // compare in hundredths of a cm
  build: ({ len, need }) => {
    const cm = mul(q(len), Q("2.54"));
    const yes = cmp(cm, q(need)) >= 0;
    return {
      prompt: `Susan has a **${len}-inch** board. The plans call for a piece **${need} centimeters** long. (1 inch = 2.54 cm)\n\nIs her board long enough?`,
      answer: { fields: [{ kind: "choice", options: YESNO, correct: yes ? 0 : 1 }] },
      answerText: `${yes ? "Yes" : "No"}: ${d(cm)} cm`,
      hints: ["Put both lengths in the same unit before you compare.", "Each inch is 2.54 centimeters.", "Multiply, then compare with what the plans need."],
      solution: [`${len} × 2.54 = ${d(cm)} cm.`, `${d(cm)} is ${yes ? "at least" : "less than"} ${need}, so **${yes ? "yes" : "no"}**.`],
    };
  },
});

const set6numbers: Exercise[] = [
  scale("ir-6-2", { title: "All-purpose cleaner", ref: "Set 6 #2 (p.11)", skill: "Unit conversion", find: "A", labels: ["fl oz of soap", "cups of water"], u: { A: "fluid ounces of soap", Aone: "fluid ounce of soap", B: "cups of water", Bone: "cup of water" }, unit: "fl oz",
    prompt: (p) => `Kevin uses **${p.c} fluid ounces of water** to make an all-purpose cleaner. The directions call for **${p.a} fluid ounces of soap for every ${p.b} cups of water**. How many fluid ounces of soap should he use? (1 cup = 8 fl oz)`,
    rate: (p) => [Q(p.a), Q(p.b), div(Q(p.c), q(8))],
    hints: ["The recipe counts water in cups, but Kevin's water is in fluid ounces. Change it to cups first.", "Then find how much soap goes with ONE cup of water.", "Scale that up to Kevin's cups."],
    preSolution: (p) => [`Kevin's water in cups: ${p.c} ÷ 8 = ${d(div(Q(p.c), q(8)))} cups.`] },
    { a: 4, b: 3, c: 84 }, { a: 3, b: 4, c: 96 }, { a: 5, b: 3, c: 72 }),
  scale("ir-6-3", { title: "Kilometers to miles", ref: "Set 6 #3 (p.11)", skill: "Unit conversion", find: "B", labels: ["kilometers", "miles"], u: { A: "kilometers", Aone: "kilometer", B: "miles", Bone: "mile" }, unit: "mph",
    prompt: (p) => `Shannon test-drives a car in Germany at **${p.c} kilometers per hour**. What is that in miles per hour? (1 km ≈ 0.62 mile)`,
    rate: (p) => [q(1), Q("0.62"), Q(p.c)],
    hints: ["Every kilometer is a bit more than half a mile.", "So each of her kilometers per hour is worth 0.62 miles per hour.", "Multiply her speed by that conversion rate."] },
    { a: 1, b: "0.62", c: 95 }, { a: 1, b: "0.62", c: 80 }, { a: 1, b: "0.62", c: 110 }),
];

type R64 = { kh: number; kd: number; m: number };
const ir_6_4 = ex<R64>({
  id: "ir-6-4",
  title: "Who works longer?",
  source: src("Set 6 #4 (p.11)"),
  domain: "AAT",
  skill: "Unit conversion",
  cluster: "rates",
  base: { kh: 8, kd: 5, m: 2250 },
  variants: [{ kh: 7, kd: 5, m: 2160 }, { kh: 6, kd: 4, m: 1380 }],
  solve: ({ kh, kd, m }) => {
    // compare in hours instead of minutes
    const c = cmp(q(kh * kd), q(m, 60));
    return [q(c > 0 ? 0 : c < 0 ? 1 : 2)];
  },
  build: ({ kh, kd, m }) => {
    const kmin = kh * kd * 60;
    const win = kmin > m ? 0 : kmin < m ? 1 : 2;
    return {
      prompt: `Keith works **${kh} hours a day, ${kd} days a week**. Melba works **${m.toLocaleString("en-US")} minutes a week**.`,
      answer: { fields: [{ kind: "choice", label: "Who spends more time at work each week?", options: ["Keith", "Melba", "The same"], correct: win }] },
      answerText: ["Keith", "Melba", "the same"][win],
      hints: ["The two times are in different units. Pick one unit for both.", "Find Keith's hours for the whole week first.", "There are 60 minutes in an hour."],
      solution: [`Keith: ${kh} × ${kd} = ${kh * kd} hours = ${kh * kd} × 60 = ${kmin.toLocaleString("en-US")} minutes.`, `Melba: ${m.toLocaleString("en-US")} minutes.`, win === 2 ? "The same." : `**${["Keith", "Melba"][win]}** works longer.`],
    };
  },
});

const set6more: Exercise[] = [
  scale("ir-6-5", { title: "Minutes per mile", ref: "Set 6 #5 (p.12)", skill: "Unit conversion", find: "A", labels: ["minutes", "yards"], u: { A: "minutes", Aone: "minute", B: "yards", Bone: "yard" }, unit: "minutes",
    prompt: (p) => `Jason runs **${p.b} yards in ${p.a} seconds**. At that pace, how many **minutes** does a mile take? (1 mile = 1,760 yards)`,
    // answer in minutes: seconds per yard × 1760 ÷ 60  →  express as (a/60 minutes) per b yards, given 1760
    rate: (p) => [div(Q(p.a), q(60)), Q(p.b), q(1760)],
    hints: ["How many of his stretches fit into one mile?", "Each stretch takes the same number of seconds.", "Change the total seconds into minutes at the end."],
    solution: (p) => {
      const k = div(q(1760), Q(p.b)), sec = mul(k, Q(p.a)), min = div(sec, q(60));
      return [`Stretches in a mile: 1,760 ÷ ${p.b} = ${d(k)}.`, `Time: ${d(k)} × ${p.a} = ${d(sec)} seconds.`, `In minutes: ${d(sec)} ÷ 60 = **${d(min)} minutes**.`];
    },},
    { a: 75, b: 440, c: 0 }, { a: 90, b: 440, c: 1 }, { a: 210, b: 880, c: 2 }),
  scale("ir-6-6", { title: "Granola price per pound", ref: "Set 6 #6 (p.12)", skill: "Unit conversion", find: "A", labels: ["dollars", "ounces"], u: { A: "dollars", Aone: "dollar", B: "ounces", Bone: "ounce" }, unit: "dollars", isMoney: true,
    prompt: (p) => `Granola is on sale: **${p.b} boxes for $${p.a}**. Each box holds **${p.c} ounces**. What is the unit price in **dollars per pound**?`,
    rate: (p) => [Q(p.a), mul(Q(p.b), Q(p.c)), q(16)],
    hints: ["First find how many ounces you get for the sale price.", "Then the price of ONE ounce.", "A pound is 16 ounces."],
    preSolution: (p) => [`Ounces for the sale price: ${p.b} × ${p.c} = ${d(mul(Q(p.b), Q(p.c)))} ounces.`] },
    { a: "4.50", b: 2, c: 12 }, { a: "7.20", b: 3, c: 8 }, { a: "6.75", b: 3, c: 10 }),
];

type R67 = { n: number; kg: number; limit: number };
const ir_6_7 = ex<R67>({
  id: "ir-6-7",
  title: "Elevator limit",
  source: src("Set 6 #7 (p.12)"),
  domain: "AAT",
  skill: "Unit conversion",
  cluster: "rates",
  base: { n: 2, kg: 105, limit: 1000 },
  variants: [{ n: 2, kg: 240, limit: 1000 }, { n: 3, kg: 140, limit: 1000 }],
  solve: ({ n: count, kg, limit }) => [q(count * kg * 22 <= limit * 10 ? 0 : 1)], // tenths of a pound
  build: ({ n: count, kg, limit }) => {
    const lb = mul(q(count * kg), Q("2.2"));
    const yes = cmp(lb, q(limit)) <= 0;
    return {
      prompt: `Sam is delivering **${count} refrigerators** that weigh **${kg} kilograms each**. The elevator holds at most **${limit.toLocaleString("en-US")} pounds**. (1 kg ≈ 2.2 lb)\n\nCan he take them all in one trip?`,
      answer: { fields: [{ kind: "choice", options: YESNO, correct: yes ? 0 : 1 }] },
      answerText: `${yes ? "Yes" : "No"}: ${d(lb)} pounds`,
      hints: ["Find the total weight first.", "The limit is in pounds, so change kilograms to pounds.", "Compare with the limit."],
      solution: [`Total: ${count} × ${kg} = ${count * kg} kg.`, `${count * kg} × 2.2 = ${d(lb)} pounds.`, `${d(lb)} is ${yes ? "within" : "over"} the ${limit} lb limit, so **${yes ? "yes" : "no"}**.`],
    };
  },
});

type R68 = { turns: number; ft: number; mi: number };
const ir_6_8 = ex<R68>({
  id: "ir-6-8",
  title: "Wheel turns",
  source: src("Set 6 #8 (p.12)"),
  domain: "AAT",
  skill: "Unit conversion",
  cluster: "rates",
  base: { turns: 20, ft: 140, mi: 5 },
  variants: [{ turns: 15, ft: 105, mi: 2 }, { turns: 25, ft: 200, mi: 3 }],
  solve: ({ turns, ft, mi }) => [div(mul(q(mi * 5280), q(turns)), q(ft))],
  build: ({ turns, ft, mi }) => {
    const feet = q(mi * 5280);
    const per = q(turns, ft);
    const v = mul(feet, per);
    const about = Math.round(toNumber(v));
    return {
      prompt: `Kelly's bike wheels turn **${turns} times every ${ft} feet**. About how many times do they turn in **${mi} miles**? (1 mile = 5,280 feet)`,
      answer: { fields: [{ kind: "number", value: v, within: q(1), unit: "turns" }] },
      answerText: `about ${about.toLocaleString("en-US")} turns`,
      hints: ["Change the miles to feet first.", "How many turns for ONE foot? Or: how many stretches of the given length fit in the ride?", "Round to a whole number of turns."],
      solution: [`${mi} miles = ${mi} × 5,280 = ${(mi * 5280).toLocaleString("en-US")} feet.`, `Turns per foot: ${turns} ÷ ${ft} = ${n(per)}.`, `${(mi * 5280).toLocaleString("en-US")} × ${n(per)} = ${n(v)}, about **${about.toLocaleString("en-US")} turns**.`],
    };
  },
});

export const RATES: Exercise[] = [
  ir_1_1, ir_1_2, ir_1_3,
  ...set2,
  ir_3_1, ir_3_2, ir_3_3,
  ...set4, ir_4_11,
  ...set5, ir_5_7,
  ir_6_1, ...set6numbers, ir_6_4, ...set6more, ir_6_7, ir_6_8,
];
void eq;
