// Stage 1 inventory: every exercise in the source files, tagged, with its answer.
// `stated` is the answer as I transcribed/solved it by hand; `compute` re-derives it in exact
// arithmetic, and `printed` is the official key / printed answer bank where one exists.
// scripts/inventory.ts checks stated == compute (== printed) for every row.

import { type Frac, add, div, mul, sub, q, frac, cmp, absF, pow } from "../lib/frac";
import type { Cluster, Domain, KeySource } from "../lib/types";

export type InputKind = "number" | "fraction" | "multi" | "choice" | "expression" | "inequality" | "point" | "order" | "ftin" | "reflection";

export interface Row {
  id: string;
  src: "CML" | "iReady";
  ref: string;
  page?: number;
  summary: string;
  domain: Domain;
  skill: string;
  cluster: Cluster;
  input: InputKind;
  stated: string;
  /** exact values that must match `stated` (numeric rows only) */
  compute?: () => Frac[];
  statedValues?: Frac[];
  printed?: Frac[];
  key: KeySource;
  status: "pilot" | "planned" | "reflection" | "duplicate";
  note?: string;
}

const Q = q;
const sum = (...xs: Frac[]) => xs.reduce((a, b) => add(a, b), frac(0));

// ---------------------------------------------------------------- CML (answers: official solutions, page 2)
const cml: Row[] = [
  { id: "cml-p5-1-1", src: "CML", ref: "P 5-1 #1", summary: "Custom operation ⟨a,b,c⟩ = [(a×b)+(a×c)]÷(b×c); evaluate ⟨8,4,2⟩", domain: "AAT", skill: "Evaluating expressions", cluster: "equations", input: "number", stated: "6",
    compute: () => [div(add(mul(Q(8), Q(4)), mul(Q(8), Q(2))), mul(Q(4), Q(2)))], statedValues: [Q(6)], printed: [Q(6)], key: "official", status: "planned" },
  { id: "cml-p5-1-2", src: "CML", ref: "P 5-1 #2", summary: "Map scale 1 in = 150 mi; towns 3 in and 3½ in apart; least and greatest possible distance", domain: "AAT", skill: "Scale & ratios", cluster: "rates", input: "multi", stated: "75 and 975",
    compute: () => [mul(sub(Q(7, 2), Q(3)), Q(150)), mul(add(Q(7, 2), Q(3)), Q(150))], statedValues: [Q(75), Q(975)], printed: [Q(75), Q(975)], key: "official", status: "planned",
    note: "Official answer assumes the three towns need not be on one line (triangle inequality). Both parts needed." },
  { id: "cml-p5-1-3", src: "CML", ref: "P 5-1 #3", summary: "2nd row from front & 4th from back; 4th from left & 3rd from right; how many students", domain: "NO", skill: "Logic & counting", cluster: "logic", input: "number", stated: "30",
    compute: () => [mul(Q(2 + 4 - 1), Q(4 + 3 - 1))], statedValues: [Q(30)], printed: [Q(30)], key: "official", status: "planned" },
  { id: "cml-p5-1-4", src: "CML", ref: "P 5-1 #4", summary: "The two numbers twice as far from 15 as from 24", domain: "NO", skill: "Distance on the number line", cluster: "negatives", input: "multi", stated: "21 and 33 (any order)",
    compute: () => [div(sub(mul(Q(2), Q(24)), Q(15)), Q(1)), div(add(mul(Q(2), Q(24)), Q(15)), Q(3))].sort(cmp), statedValues: [Q(21), Q(33)], printed: [Q(21), Q(33)], key: "official", status: "pilot" },
  { id: "cml-p5-1-5", src: "CML", ref: "P 5-1 #5", summary: "4 lemons + 1 carrot = 1 potato; 2 carrots + 1 potato = 10 lemons; lemons per potato", domain: "AAT", skill: "Equations by substitution", cluster: "equations", input: "number", stated: "6",
    compute: () => { const c = div(sub(Q(10), Q(4)), Q(3)); return [add(Q(4), c)]; }, statedValues: [Q(6)], printed: [Q(6)], key: "official", status: "pilot" },
  { id: "cml-p5-1-6", src: "CML", ref: "P 5-1 #6", summary: "Pour paint between 20-gal A, 12-gal B, 9-gal C in a fixed sequence; gallons left in A", domain: "NO", skill: "Logic & counting", cluster: "logic", input: "number", stated: "14",
    compute: () => [Q(simulatePour())], statedValues: [Q(14)], printed: [Q(14)], key: "official", status: "planned" },

  { id: "cml-p6-3-1", src: "CML", ref: "P 6-3 #1", summary: "Two numbers sum to 14, one is 9; product", domain: "NO", skill: "Whole-number operations", cluster: "equations", input: "number", stated: "45",
    compute: () => [mul(Q(9), sub(Q(14), Q(9)))], statedValues: [Q(45)], printed: [Q(45)], key: "official", status: "planned" },
  { id: "cml-p6-3-2", src: "CML", ref: "P 6-3 #2 (= P 7-3 #2)", summary: "a@b=(a+b)/(a×b), a#b=(a×b)/(a+b); a#b = 7⅔; find a@b", domain: "NO", skill: "Fractions & reciprocals", cluster: "fracdiv", input: "fraction", stated: "3/23",
    compute: () => [div(Q(1), Q(23, 3))], statedValues: [Q(3, 23)], printed: [Q(3, 23)], key: "official", status: "planned" },
  { id: "cml-p6-3-3", src: "CML", ref: "P 6-3 #3", summary: "2×2 grid of rectangles, areas A=55, B=15, C=30; area of D", domain: "G", skill: "Area of rectangles", cluster: "shapes", input: "number", stated: "110",
    compute: () => [div(mul(Q(55), Q(30)), Q(15))], statedValues: [Q(110)], printed: [Q(110)], key: "official", status: "planned" },
  { id: "cml-p6-3-4", src: "CML", ref: "P 6-3 #4", summary: "Second set of three single-digit numbers with product 72 and sum 14 (other than 6,6,2)", domain: "NO", skill: "Factors & multiples", cluster: "logic", input: "multi", stated: "8, 3, 3 (any order)",
    compute: () => factorTriples().filter((t) => t.join() !== "2,6,6")[0].map((v) => Q(v)), statedValues: [Q(3), Q(3), Q(8)], printed: [Q(3), Q(3), Q(8)], key: "official", status: "planned" },
  { id: "cml-p6-3-5", src: "CML", ref: "P 6-3 #5", summary: "Out and back at 10 mph for 3½ h, closest 25 mi to town; distance to town", domain: "AAT", skill: "Rate, time & distance", cluster: "rates", input: "number", stated: "42 1/2",
    compute: () => [add(div(mul(Q(10), Q(7, 2)), Q(2)), Q(25))], statedValues: [Q(85, 2)], printed: [Q(85, 2)], key: "official", status: "planned" },
  { id: "cml-p6-3-6", src: "CML", ref: "P 6-3 #6", summary: "Largest postage NOT makeable with 5¢ and 9¢ stamps", domain: "NO", skill: "Factors & multiples", cluster: "logic", input: "number", stated: "31",
    compute: () => [Q(largestUnmakeable(5, 9))], statedValues: [Q(31)], printed: [Q(31)], key: "official", status: "planned" },

  { id: "cml-e6-4-1", src: "CML", ref: "E 6-4 #1", summary: "Divided by 13 gives 8 R3; the dividend", domain: "NO", skill: "Division with remainders", cluster: "equations", input: "number", stated: "107",
    compute: () => [add(mul(Q(13), Q(8)), Q(3))], statedValues: [Q(107)], printed: [Q(107)], key: "official", status: "planned" },
  { id: "cml-e6-4-2", src: "CML", ref: "E 6-4 #2", summary: "|a c; b d| = ad − bc; find x if |x 5; 4 3| = 22", domain: "AAT", skill: "One-variable equations", cluster: "equations", input: "number", stated: "14",
    compute: () => [div(add(Q(22), mul(Q(5), Q(4))), Q(3))], statedValues: [Q(14)], printed: [Q(14)], key: "official", status: "planned" },
  { id: "cml-e6-4-3", src: "CML", ref: "E 6-4 #3", summary: "$28 for 2 h 20 min; pay for 3½ h at the same rate", domain: "AAT", skill: "Unit rates", cluster: "rates", input: "number", stated: "$42",
    compute: () => [mul(div(Q(28), Q(7, 3)), Q(7, 2))], statedValues: [Q(42)], printed: [Q(42)], key: "official", status: "planned" },
  { id: "cml-e6-4-4", src: "CML", ref: "E 6-4 #4", summary: "Cross-shaped figure of 9 equal squares, area 144; perimeter", domain: "G", skill: "Area & perimeter", cluster: "shapes", input: "number", stated: "80",
    compute: () => [mul(Q(polyominoPerimeter(E64_CELLS)), Q(4))], statedValues: [Q(80)], printed: [Q(80)], key: "official", status: "planned",
    note: "Figure transcribed as cells (col,row): (1,0) (0,1)(1,1)(2,1) (1,2) (0,3)(1,3)(2,3) (1,4); perimeter counted in code = 20 sides." },
  { id: "cml-e6-4-5", src: "CML", ref: "E 6-4 #5", summary: "Mean of 8 numbers is 45; with 4 more the mean is 55; mean of the 4", domain: "MD", skill: "Mean (average)", cluster: "data", input: "number", stated: "75",
    compute: () => [div(sub(mul(Q(12), Q(55)), mul(Q(8), Q(45))), Q(4))], statedValues: [Q(75)], printed: [Q(75)], key: "official", status: "planned" },
  { id: "cml-e6-4-6", src: "CML", ref: "E 6-4 #6", summary: "Sold 5/6 of watermelons at $4.50, 7 left; money taken in", domain: "NO", skill: "Fractions of a whole", cluster: "percents", input: "number", stated: "$157.50",
    compute: () => [mul(mul(div(Q(7), Q(1, 6)), Q(5, 6)), Q("4.50"))], statedValues: [Q("157.5")], printed: [Q("157.5")], key: "official", status: "planned" },

  { id: "cml-p7-3-1", src: "CML", ref: "P 7-3 #1", summary: "Sum of 19 hundreds and 11 tens", domain: "NO", skill: "Place value", cluster: "rates", input: "number", stated: "2010",
    compute: () => [add(mul(Q(19), Q(100)), mul(Q(11), Q(10)))], statedValues: [Q(2010)], printed: [Q(2010)], key: "official", status: "planned" },
  { id: "cml-p7-3-2", src: "CML", ref: "P 7-3 #2", summary: "Same question as P 6-3 #2", domain: "NO", skill: "Fractions & reciprocals", cluster: "fracdiv", input: "fraction", stated: "3/23", key: "official", status: "duplicate",
    note: "Word-for-word repeat of P 6-3 #2; built once, tagged with both sources." },
  { id: "cml-p7-3-3", src: "CML", ref: "P 7-3 #3", summary: "10 is twice as far from 6 as from 12; the other such point", domain: "NO", skill: "Distance on the number line", cluster: "negatives", input: "number", stated: "18",
    compute: () => [add(mul(Q(2), Q(12)), mul(Q(-1), Q(6)))], statedValues: [Q(18)], printed: [Q(18)], key: "official", status: "planned" },
  { id: "cml-p7-3-4", src: "CML", ref: "P 7-3 #4", summary: "1-ft cube cut into 1-in cubes, stacked; height in feet", domain: "MD", skill: "Volume & unit conversion", cluster: "shapes", input: "number", stated: "144",
    compute: () => [div(pow(Q(12), 3), Q(12))], statedValues: [Q(144)], printed: [Q(144)], key: "official", status: "planned" },
  { id: "cml-p7-3-5", src: "CML", ref: "P 7-3 #5", summary: "Perimeter of a stepped (rectilinear) figure, top 12, left side 12, a notch 7 deep", domain: "G", skill: "Area & perimeter", cluster: "shapes", input: "number", stated: "62",
    compute: () => [sum(Q(12), Q(12), Q(12), Q(12), Q(7), Q(7))], statedValues: [Q(62)], printed: [Q(62)], key: "official", status: "planned",
    note: "UNSURE TRANSCRIPTION: hand-drawn figure, only 12, 12 and 7 are labelled. I read it as a 12×12 outline whose right side has one notch 7 deep (adds 7 twice), matching the official 12+12+12+12+7+7. The online version redraws it cleanly with those numbers." },
  { id: "cml-p7-3-6", src: "CML", ref: "P 7-3 #6", summary: "ABCD × 4 = EBEA, different digits; find ABCD", domain: "NO", skill: "Logic & place value", cluster: "logic", input: "number", stated: "2348",
    compute: () => [Q(cryptarithm())], statedValues: [Q(2348)], printed: [Q(2348)], key: "official", status: "planned" },

  { id: "cml-e7-1-1", src: "CML", ref: "E 7-1 #1", summary: "3-digit palindrome, digits sum to 7, greatest digit product", domain: "NO", skill: "Logic & place value", cluster: "logic", input: "number", stated: "232",
    compute: () => [Q(bestPalindrome())], statedValues: [Q(232)], printed: [Q(232)], key: "official", status: "planned" },
  { id: "cml-e7-1-2", src: "CML", ref: "E 7-1 #2", summary: "k · 5/9 = 1/6 · 2/3; find k", domain: "NO", skill: "Dividing fractions", cluster: "fracdiv", input: "fraction", stated: "1/5",
    compute: () => [div(mul(Q(1, 6), Q(2, 3)), Q(5, 9))], statedValues: [Q(1, 5)], printed: [Q(1, 5)], key: "official", status: "planned" },
  { id: "cml-e7-1-3", src: "CML", ref: "E 7-1 #3", summary: "Jump 4 ft 9¾ in longer than the other; together 39 ft 6¾ in; the longer jump", domain: "MD", skill: "Measurement: feet & inches", cluster: "equations", input: "ftin", stated: "22 ft 2 1/4 in",
    compute: () => [div(add(add(mul(Q(39), Q(12)), Q(27, 4)), add(mul(Q(4), Q(12)), Q(39, 4))), Q(2))], statedValues: [add(mul(Q(22), Q(12)), Q(9, 4))], printed: [add(mul(Q(22), Q(12)), Q(9, 4))], key: "official", status: "planned",
    note: "The '39 ft. 6¾ in.' total is partly under the SAMPLE stamp on page 1; read from the solutions page." },
  { id: "cml-e7-1-4", src: "CML", ref: "E 7-1 #4", summary: "Triangle areas: SRP = ½ RST, RUS = ⅓ RST, RSQ = 9, RUQ = 3; area of PQUT", domain: "G", skill: "Area of triangles", cluster: "shapes", input: "number", stated: "15",
    compute: () => { const rst = mul(Q(3), add(Q(9), Q(3))); return [sub(div(rst, Q(2)), Q(3))]; }, statedValues: [Q(15)], printed: [Q(15)], key: "official", status: "planned" },
  { id: "cml-e7-1-5", src: "CML", ref: "E 7-1 #5", summary: "75% overall; 80% on first 25; 7 wrong on the rest; correct on the rest", domain: "AAT", skill: "Percent problems", cluster: "percents", input: "number", stated: "16",
    compute: () => { const wrong = add(mul(Q(25), Q(1, 5)), Q(7)); const total = div(wrong, Q(1, 4)); return [sub(sub(total, Q(25)), Q(7))]; }, statedValues: [Q(16)], printed: [Q(16)], key: "official", status: "planned" },
  { id: "cml-e7-1-6", src: "CML", ref: "E 7-1 #6", summary: "Routes from A to B on a 3×2 grid moving only right or up", domain: "NO", skill: "Logic & counting", cluster: "logic", input: "number", stated: "10",
    compute: () => [Q(gridRoutes(3, 2))], statedValues: [Q(10)], printed: [Q(10)], key: "official", status: "planned" },
];

// ---------------------------------------------------------------- i-Ready (no teacher key attached: answers computed)
const iR = (set: number, n: number | string, page: number, summary: string, domain: Domain, skill: string, cluster: Cluster, input: InputKind, stated: string, ...extras: Partial<Row>[]): Row => ({
  id: `ir-${set}-${n}`,
  src: "iReady",
  ref: `Set ${set} #${n} (p.${page})`,
  page,
  summary,
  domain,
  skill,
  cluster,
  input,
  stated,
  key: "computed",
  status: "planned",
  ...Object.assign({}, ...extras),
});
const C = (fn: () => Frac[], vals: Frac[]) => ({ compute: fn, statedValues: vals });

const ratio = (a: number, b: number, scaleFrom: number, scaleTo: number) => mul(div(Q(a), Q(b)), Q(scaleTo)); // a per b, times scaleTo
const pctOf = (p: number, w: number) => mul(Q(p, 100), Q(w));
const whole = (p: number, part: number) => div(Q(part), Q(p, 100));

const iready: Row[] = [
  // Set 1  Understanding Ratio Concepts (p3)
  iR(1, 1, 3, "5 tennis balls for every 3 rackets: balls:rackets and balls:total", "AAT", "Ratio language", "rates", "multi", "5:3 and 5:8", C(() => [Q(5, 3), Q(5, 8)], [Q(5, 3), Q(5, 8)])),
  iR(1, 2, 3, "18 shark teeth (6 tiger, 8 sand, rest bull): what 6:8 and 4:18 mean", "AAT", "Ratio language", "rates", "choice", "6:8 = tiger to sand (part to part); 4:18 = bull to all teeth (part to whole)", C(() => [sub(sub(Q(18), Q(6)), Q(8))], [Q(4)])),
  iR(1, 3, 3, "How part-to-part ratios differ from part-to-whole ratios", "AAT", "Ratio language", "rates", "choice", "Part-to-part compares two groups; part-to-whole compares one group to the total", { note: "Explain item, turned into a multiple-choice concept check." }),
  // Set 2  Using Equivalent Ratios (p4)
  iR(2, 1, 4, "24 min : 3 mi; minutes for 10 mi", "AAT", "Equivalent ratios", "rates", "number", "80 min", C(() => [ratio(24, 3, 3, 10)], [Q(80)])),
  iR(2, 2, 4, "2 of every 5 guests want soup; 800 guests", "AAT", "Equivalent ratios", "rates", "number", "320", C(() => [ratio(2, 5, 5, 800)], [Q(320)])),
  iR(2, 3, 4, "Peaches:cherries 2:3; peaches in 60 cups of salad", "AAT", "Equivalent ratios", "rates", "number", "24", C(() => [mul(Q(2, 5), Q(60))], [Q(24)])),
  iR(2, 4, 4, "150 plants for 50 families; plants for 65 families", "AAT", "Equivalent ratios", "rates", "number", "195", C(() => [ratio(150, 50, 50, 65)], [Q(195)])),
  iR(2, 5, 4, "49 dogs : 28 cats; dogs when there are 20 cats", "AAT", "Equivalent ratios", "rates", "number", "35", C(() => [ratio(49, 28, 28, 20)], [Q(35)])),
  iR(2, 6, 4, "72 ivy stems for 18 centerpieces; stems for 16", "AAT", "Equivalent ratios", "rates", "number", "64", C(() => [ratio(72, 18, 18, 16)], [Q(64)])),
  // Set 3  Understanding Rate Concepts (p5-6)
  iR(3, 1, 5, "Maya 5 puzzles/30 min, Amy 4 puzzles/28 min: minutes per puzzle each, who finishes first", "AAT", "Unit rates", "rates", "multi", "Maya 6, Amy 7, Maya first", C(() => [div(Q(30), Q(5)), div(Q(28), Q(4))], [Q(6), Q(7)])),
  iR(3, 2, 5, "Hose: 36 gal in 3 min; gal/min, min/gal, gallons in 10 min", "AAT", "Unit rates", "rates", "multi", "12 gal/min, 1/12 min/gal, 120 gal", C(() => [div(Q(36), Q(3)), div(Q(3), Q(36)), mul(div(Q(36), Q(3)), Q(10))], [Q(12), Q(1, 12), Q(120)])),
  iR(3, 3, 6, "216 mi in 4 h: mph; with two 10-min stops can he still arrive in 4 h at that speed?", "AAT", "Unit rates", "rates", "multi", "54 mph; No (he'd cover only 198 mi)", C(() => [div(Q(216), Q(4)), mul(div(Q(216), Q(4)), sub(Q(4), Q(1, 3)))], [Q(54), Q(198)])),
  // Set 4  Using Unit Rates to Find Equivalent Ratios (p7-8)
  iR(4, 1, 7, "5 lawns in 8 h; lawns in 40 h", "AAT", "Unit rates", "rates", "number", "25", C(() => [mul(div(Q(5), Q(8)), Q(40))], [Q(25)])),
  iR(4, 2, 7, "$1,200 per 100 sq ft; cost of 1,100 sq ft", "AAT", "Unit rates", "rates", "number", "$13,200", C(() => [mul(div(Q(1200), Q(100)), Q(1100))], [Q(13200)])),
  iR(4, 3, 7, "14.5 mi in 2 h; miles in 3 h", "AAT", "Unit rates", "rates", "number", "21.75", C(() => [mul(div(Q("14.5"), Q(2)), Q(3))], [Q("21.75")])),
  iR(4, 4, 7, "8 passes in 3 games; passes in 15 games", "AAT", "Unit rates", "rates", "number", "40", C(() => [mul(div(Q(8), Q(3)), Q(15))], [Q(40)])),
  iR(4, 5, 7, "5 boxes cost $9; cost of 20 boxes", "AAT", "Unit rates", "rates", "number", "$36", C(() => [mul(div(Q(9), Q(5)), Q(20))], [Q(36)])),
  iR(4, 6, 7, "1,100 mi in 2 h; miles in 8 h", "AAT", "Unit rates", "rates", "number", "4,400", C(() => [mul(div(Q(1100), Q(2)), Q(8))], [Q(4400)])),
  iR(4, 7, 8, "2 pages in 32 min; pages in 200 min", "AAT", "Unit rates", "rates", "number", "12.5", C(() => [mul(div(Q(2), Q(32)), Q(200))], [Q(25, 2)])),
  iR(4, 8, 8, "$300 for 5 days; pay for 24 days", "AAT", "Unit rates", "rates", "number", "$1,440", C(() => [mul(div(Q(300), Q(5)), Q(24))], [Q(1440)])),
  iR(4, 9, 8, "45 sq ft in 50 min; minutes for 495 sq ft", "AAT", "Unit rates", "rates", "number", "550", C(() => [mul(div(Q(50), Q(45)), Q(495))], [Q(550)])),
  iR(4, 10, 8, "5 oz for $2.35; cost of 12 oz", "AAT", "Unit rates", "rates", "number", "$5.64", C(() => [mul(div(Q("2.35"), Q(5)), Q(12))], [Q("5.64")])),
  iR(4, 11, 8, "How problem 10 changes if asked how many ounces $10 buys", "AAT", "Unit rates", "rates", "choice", "Use ounces per dollar (5 ÷ 2.35) and multiply by 10, about 21.3 oz", C(() => [mul(div(Q(5), Q("2.35")), Q(10))], [Q(1000, 47)]), { note: "Explain item, turned into a multiple-choice check (with the number shown)." }),
  // Set 5  Using Unit Rates to Compare Ratios (p9-10)
  iR(5, 1, 9, "Shawn 36 cars/4 wk vs Brett 56/7 wk; who sells more per week", "AAT", "Comparing rates", "rates", "choice", "Shawn (9 vs 8)", C(() => [div(Q(36), Q(4)), div(Q(56), Q(7))], [Q(9), Q(8)])),
  iR(5, 2, 9, "Pickup 120 mi/8 gal vs minivan 180/10; more miles per gallon", "AAT", "Comparing rates", "rates", "choice", "Minivan (18 vs 15)", C(() => [div(Q(120), Q(8)), div(Q(180), Q(10))], [Q(15), Q(18)])),
  iR(5, 3, 9, "Joe $40/2 acres vs Chris $30/1.2 acres; who charges more per acre", "AAT", "Comparing rates", "rates", "choice", "Chris ($25 vs $20)", C(() => [div(Q(40), Q(2)), div(Q(30), Q("1.2"))], [Q(20), Q(25)])),
  iR(5, 4, 9, "Ellen 200 m in 28 s vs Lindsay 400 m in 60 s; who ran faster", "AAT", "Comparing rates", "rates", "choice", "Ellen (50/7 ≈ 7.14 vs 20/3 ≈ 6.67 m/s)", C(() => [div(Q(200), Q(28)), div(Q(400), Q(60))], [Q(50, 7), Q(20, 3)])),
  iR(5, 5, 10, "Branden 550 yd/75 carries vs Pete 380/42; farther per carry", "AAT", "Comparing rates", "rates", "choice", "Pete (≈9.05 vs ≈7.33)", C(() => [div(Q(550), Q(75)), div(Q(380), Q(42))], [Q(22, 3), Q(190, 21)])),
  iR(5, 6, 10, "Brand A 18 oz/$2.50 vs Brand B 24 oz/$3.50; better price per ounce", "AAT", "Comparing rates", "rates", "choice", "Brand A (≈13.9¢ vs ≈14.6¢ per oz)", C(() => [div(Q("2.50"), Q(18)), div(Q("3.50"), Q(24))], [Q(5, 36), Q(7, 48)])),
  iR(5, 7, 10, "Two ways to change the table so the answer to #6 flips", "AAT", "Comparing rates", "rates", "choice", "e.g. lower B's price below $3.33 or raise A's price above $2.63", { note: "Open item, turned into 'which change flips the answer' multiple choice. Thresholds: B < 24×(2.50/18) = $3.33…, A > 18×(3.50/24) = $2.625." }),
  // Set 6  Using Unit Rates to Convert Measurements (p11-12)
  iR(6, 1, 11, "12-in board, need 29 cm (1 in = 2.54 cm); long enough?", "AAT", "Unit conversion", "rates", "choice", "Yes (30.48 cm)", C(() => [mul(Q(12), Q("2.54"))], [Q("30.48")])),
  iR(6, 2, 11, "84 fl oz water; 4 fl oz soap per 3 cups (1 cup = 8 fl oz); soap", "AAT", "Unit conversion", "rates", "number", "14 fl oz", C(() => [mul(div(div(Q(84), Q(8)), Q(3)), Q(4))], [Q(14)])),
  iR(6, 3, 11, "95 km/h in mph (1 km ≈ 0.62 mi)", "AAT", "Unit conversion", "rates", "number", "58.9 mph", C(() => [mul(Q(95), Q("0.62"))], [Q("58.9")])),
  iR(6, 4, 11, "Keith 8 h × 5 days vs Melba 2,250 min/week; who works more", "AAT", "Unit conversion", "rates", "choice", "Keith (2,400 min)", C(() => [mul(mul(Q(8), Q(5)), Q(60))], [Q(2400)])),
  iR(6, 5, 12, "440 yd in 75 s; minutes per mile (1 mi = 1,760 yd)", "AAT", "Unit conversion", "rates", "number", "5 min", C(() => [div(mul(div(Q(1760), Q(440)), Q(75)), Q(60))], [Q(5)])),
  iR(6, 6, 12, "Granola 2 boxes for $4.50, 12 oz each; dollars per pound", "AAT", "Unit conversion", "rates", "number", "$3.00", C(() => [mul(div(div(Q("4.50"), Q(2)), Q(12)), Q(16))], [Q(3)])),
  iR(6, 7, 12, "Two 105-kg fridges, 1,000-lb elevator limit (1 kg ≈ 2.2 lb); one trip?", "AAT", "Unit conversion", "rates", "choice", "Yes (462 lb)", C(() => [mul(mul(Q(2), Q(105)), Q("2.2"))], [Q(462)])),
  iR(6, 8, 12, "Wheel turns 20 times per 140 ft; about how many turns in 5 mi", "AAT", "Unit conversion", "rates", "number", "about 3,771 (exactly 3,771 3/7)", C(() => [mul(div(mul(Q(5), Q(5280)), Q(140)), Q(20))], [Q(26400, 7)]), { note: "\"About\": the checker accepts 3,771 ± 1." }),
  // Set 7  Understanding Percents (p13)
  iR(7, 1, 13, "60% of a $300 goal; money saved", "AAT", "Percent concepts", "percents", "number", "$180", C(() => [pctOf(60, 300)], [Q(180)])),
  iR(7, 2, 13, "80 illustrations, 40% done; how many still to make", "AAT", "Percent concepts", "percents", "number", "48", C(() => [sub(Q(80), pctOf(40, 80))], [Q(48)])),
  iR(7, 3, 13, "75% of 28 students; how many, and what fraction", "AAT", "Percent concepts", "percents", "multi", "21 students; 3/4", C(() => [pctOf(75, 28), Q(3, 4)], [Q(21), Q(3, 4)])),
  // Set 8  Finding a Percent of a Quantity (p14) — printed answer bank on the page
  ...([[40, 80, 32], [25, 60, 15], [10, 90, 9], [50, 70, 35], [80, 500, 400], [75, 80, 60], [90, 250, 225], [65, 400, 260], [85, 800, 680], [55, 140, 77], [45, 160, 72], [95, 180, 171], [70, 720, 504], [15, 220, 33], [65, 200, 130]] as const).map(([p, w, a], i) =>
    iR(8, i + 1, 14, `${p}% of ${w}`, "AAT", "Percent of a quantity", "percents", "number", String(a), { ...C(() => [pctOf(p, w)], [Q(a)]), printed: [Q(a)], key: "answer-bank" as KeySource })),
  // Set 9  Finding the Whole (p15)
  ...([[25, 13, 52], [50, 140, 280], [10, 60, 600], [5, 12, 240], [30, 72, 240], [70, 56, 80], [95, 57, 60], [75, 66, 88], [85, 102, 120], [45, 63, 140]] as const).map(([p, part, a], i) =>
    iR(9, i + 1, 15, `${p}% of what number is ${part}?`, "AAT", "Finding the whole", "percents", "number", String(a), { ...C(() => [whole(p, part)], [Q(a)]), status: i === 5 ? ("pilot" as const) : ("planned" as const) })),
  iR(9, 11, 15, "How to use 25% of a number to find the number", "AAT", "Finding the whole", "percents", "choice", "Multiply by 4 (25% is one quarter)", { note: "Explain item, turned into a multiple-choice concept check." }),
  // Set 10  Understanding Division with Fractions (p16)
  iR(10, 1, 16, "How many 1/5s make 14/10; fill 14/10 ÷ __ = 7 and __ · 1/5 = 14/10", "NO", "Dividing fractions", "fracdiv", "multi", "7; 1/5; 7", C(() => [div(Q(14, 10), Q(1, 5)), Q(1, 5), Q(7)], [Q(7), Q(1, 5), Q(7)])),
  iR(10, 2, 16, "2/3 ÷ 1/12 on a number line", "NO", "Dividing fractions", "fracdiv", "number", "8", C(() => [div(Q(2, 3), Q(1, 12))], [Q(8)])),
  iR(10, 3, 16, "Which model do you like better, bar or number line?", "NO", "Dividing fractions", "fracdiv", "reflection", "(opinion)", { status: "reflection", note: "No right answer; shown as an unscored reflection card." }),
  // Set 11  Using Multiplication to Divide by a Fraction (p17): online version asks for the reciprocal and the quotient
  ...([
    [[1, 2], [2, 3], [3, 4], "1/2 ÷ 2/3"], [[4, 5], [1, 4], [16, 5], "4/5 ÷ 1/4"], [[2, 5], [3, 4], [8, 15], "2/5 ÷ 3/4"], [[5, 6], [5, 12], [2, 1], "5/6 ÷ 5/12"],
    [[3, 4], [5, 7], [21, 20], "3/4 ÷ 5/7"], [[4, 3], [3, 7], [28, 9], "1 1/3 ÷ 3/7"], [[9, 2], [2, 5], [45, 4], "4 1/2 ÷ 2/5 (missing numerator 1)"], [[7, 2], [7, 8], [4, 1], "3 1/2 ÷ 7/8 (missing numerator 7)"],
    [[5, 3], [9, 4], [20, 27], "1 2/3 ÷ 2 1/4"], [[18, 5], [7, 4], [72, 35], "3 3/5 ÷ 1 3/4 (missing denominator 4)"],
  ] as const).map(([a, b, ans, label], i) =>
    iR(11, i + 1, 17, `${label}: reciprocal and quotient`, "NO", "Dividing fractions", "fracdiv", "multi", `${b[1]}/${b[0]}; ${ans[0]}/${ans[1]}`, C(() => [div(Q(1), Q(b[0], b[1])), div(Q(a[0], a[1]), Q(b[0], b[1]))], [Q(b[1], b[0]), Q(ans[0], ans[1])]))),
  iR(11, 11, 17, "Write a word problem for equation 8", "NO", "Dividing fractions", "fracdiv", "reflection", "(open)", { status: "reflection", note: "Creative writing; shown as an unscored reflection card with a sample." }),
  // Set 12  Understanding Positive and Negative Numbers (p18-19)
  iR(12, 1, 18, "Opposite points 10 ticks apart: where 0 is; label the two points", "NO", "Rational numbers & opposites", "negatives", "multi", "5 and −5", C(() => [Q(5), Q(-5)], [Q(5), Q(-5)]), { note: "Read from the figure: 12 ticks, points on the 2nd and 11th, so they are 10 apart; 0 is halfway." }),
  iR(12, 2, 18, "Sort 0, 4, −2, 2/3, −1.8, 16, 3.2, −5/4 into: rational non-integers / integers not whole / whole", "NO", "Rational numbers & opposites", "negatives", "choice", "2/3, −1.8, 3.2, −5/4 / −2 / 0, 4, 16"),
  iR(12, 3, 18, "Match whole numbers, integers, rational numbers to their descriptions", "NO", "Rational numbers & opposites", "negatives", "choice", "whole numbers; integers; rational numbers"),
  iR(12, 4, 19, "Plot 4, −3, 1 and their opposites", "NO", "Rational numbers & opposites", "negatives", "multi", "−4, 3, −1", C(() => [Q(-4), Q(3), Q(-1)], [Q(-4), Q(3), Q(-1)])),
  iR(12, 5, 19, "Is the point farthest from 0 always the greatest?", "NO", "Rational numbers & opposites", "negatives", "choice", "No (e.g. −10 is far from 0 but less than 2)"),
  // Set 13  Comparing Positive and Negative Numbers (p20)
  ...([["7", "10", "<"], ["7", "-10", ">"], ["-7", "-10", ">"], ["2/3", "-1 2/3", ">"], ["-50", "0.3", "<"], ["-12", "-35", ">"], ["-5", "4.5", "<"], ["1/2", "-80", ">"], ["-1/4", "-1.4", ">"]] as const).map(([a, b, s], i) =>
    iR(13, i + 1, 20, `${a} ◯ ${b}`, "NO", "Comparing & ordering", "negatives", "choice", s, { compute: () => [Q(cmpText(a, b))], statedValues: [Q(s === "<" ? -1 : 1)] })),
  ...([["5, -2, -1, 4", "-2, -1, 4, 5"], ["3.4, 7, -3.5, -3", "-3.5, -3, 3.4, 7"], ["-2.1, -2, -3, 0", "-3, -2.1, -2, 0"], ["-3/4, -2, -1/4, 2", "-2, -3/4, -1/4, 2"], ["5, 0, -6, -0.1", "-6, -0.1, 0, 5"], ["7.5, -200, -1.5, -8", "-200, -8, -1.5, 7.5"], ["1/2, -1/2, -1/3, 1/3", "-1/2, -1/3, 1/3, 1/2"], ["1.2, -2.1, -21, 0.12", "-21, -2.1, 0.12, 1.2"], ["0.1, -0.2, 0.55, -0.31", "-0.31, -0.2, 0.1, 0.55"]] as const).map(([list, sorted], i) =>
    iR(13, i + 10, 20, `Order least to greatest: ${list}`, "NO", "Comparing & ordering", "negatives", "order", sorted, { compute: () => sortText(list), statedValues: sorted.split(",").map((t) => numText(t)) })),
  iR(13, 19, 20, "How to tell which of two negative numbers is greater", "NO", "Comparing & ordering", "negatives", "choice", "The one closer to 0 (e.g. −3 > −8)", { note: "Explain item, turned into a multiple-choice concept check." }),
  // Set 14  Understanding Absolute Value (p21)
  iR(14, 1, 21, "Which is greater, −9 or −4? |−9| or |−4|?", "NO", "Absolute value", "negatives", "multi", "−4; |−9|", C(() => [Q(cmp(Q(-4), Q(-9))), Q(cmp(absF(Q(-9)), absF(Q(-4))))], [Q(1), Q(1)])),
  iR(14, 2, 21, "Plays 2, −1, 4, 3, −5: greatest number; better question; which are big plays (more than 4 yd from start)", "NO", "Absolute value", "negatives", "multi", "4; which has the greatest absolute value; −5", C(() => [Q(4), Q(-5)], [Q(4), Q(-5)])),
  iR(14, 3, 21, "When to compare absolute values instead of the numbers", "NO", "Absolute value", "negatives", "choice", "When only the distance/size matters, not the direction", { note: "Explain item, turned into a multiple-choice concept check." }),
  // Set 15  Four-Quadrant Coordinate Plane (p22)
  ...([["A(−3, −2)", "Quadrant III"], ["B(4, −4)", "Quadrant IV"], ["C(2, 3)", "Quadrant I"], ["D(−2, 4)", "Quadrant II"], ["E(3, −3)", "Quadrant IV"], ["F(4, 0)", "x-axis"]] as const).map(([pt, where], i) =>
    iR(15, i + 1, 22, `Plot ${pt}; quadrant or axis`, "NO", "Coordinate plane", "negatives", "choice", where)),
  iR(15, 7, 22, "Reflect E(3, −3) across the x-axis", "NO", "Coordinate plane", "negatives", "point", "(3, 3)", C(() => [Q(3), Q(3)], [Q(3), Q(3)])),
  iR(15, 8, 22, "One of points A–F was reflected once and landed in Quadrant II; possible coordinates", "NO", "Coordinate plane", "negatives", "multi", "(−3, 2) or (−2, 3)", {
    note: "UNVERIFIED reading: I took 'reflected' as one reflection across an axis. A over the x-axis gives (−3, 2); C over the y-axis gives (−2, 3). D is already in QII. The checker accepts either point." }),
  iR(15, 9, 22, "B reflected across y then x; is that D?", "NO", "Coordinate plane", "negatives", "choice", "No: it lands on (−4, 4), not D(−2, 4)"),
  // Set 16  Writing and Interpreting Algebraic Expressions (p23-24)
  iR(16, 1, 23, "12 more than 8.2 times n", "AAT", "Writing expressions", "equations", "expression", "8.2n + 12"),
  iR(16, 2, 23, "3 less than the quotient of 18 and m", "AAT", "Writing expressions", "equations", "expression", "18/m − 3"),
  iR(16, 3, 23, "5.6 times the sum of 4 and p", "AAT", "Writing expressions", "equations", "expression", "5.6(4 + p)"),
  iR(16, 4, 23, "The quotient of 2 and x, times 3", "AAT", "Writing expressions", "equations", "expression", "(2/x)·3"),
  iR(16, 5, 23, "Five friends split parking cost c, each buys a $30 ticket; spend per friend", "AAT", "Writing expressions", "equations", "expression", "c/5 + 30"),
  iR(16, 6, 23, "Open x h Mon–Thu and y h Fri–Sun; hours per week", "AAT", "Writing expressions", "equations", "expression", "4x + 3y"),
  iR(16, 7, 23, "2s + 2.79 for 2 sandwiches and a drink: variable, coefficient, terms", "AAT", "Writing expressions", "equations", "choice", "s = price of one sandwich; 2 = number of sandwiches; terms 2s and 2.79"),
  iR(16, 8, 24, "24c + 5m + 19.99: meaning of each part", "AAT", "Writing expressions", "equations", "choice", "c = pencil pack price, m = marker pack price, 19.99 = beanbag"),
  iR(16, 9, 24, "Write a situation for 3s + 2.15", "AAT", "Writing expressions", "equations", "reflection", "(open)", { status: "reflection", note: "Creative writing; shown as an unscored reflection card with a sample." }),
  // Set 17  Evaluating Algebraic Expressions (p25): is the student right? correct value
  ...([["5m + 26, m = 3", "31", 41], ["8(x + 2), x = 6", "50", 64], ["7p + 5, p = 12", "119", 89], ["q + 9p, q = 18, p = 4", "54", 54], ["6w − 19 + k, w = 8, k = 2", "1", 31], ["12x + y, x = 3, y = 52", "88", 88]] as const).map(([e, student, v], i) =>
    iR(17, i + 1, 25, `${e}; student wrote ${student}`, "AAT", "Evaluating expressions", "equations", "multi", `${String(v) === student ? "correct" : "incorrect"}; ${v}`, C(() => [Q(evalSet17(i))], [Q(v)]))),
  iR(17, 7, 25, "Check problem 2 another way (distribute first)", "AAT", "Evaluating expressions", "equations", "number", "64 (8·6 + 8·2)", C(() => [add(mul(Q(8), Q(6)), mul(Q(8), Q(2)))], [Q(64)]), { note: "The packet's sample answer under #7 shows problem 1's numbers; I used problem 2 as the question says." }),
  // Set 18  Order of Operations with Exponents (p26) — printed answer bank on the page
  ...([["(6 + 3)^4", 6561], ["6 + 3^4", 87], ["2(4^3) − 1", 127], ["2(4^3 − 1)", 126], ["5 + 9(1 + 2)^2", 86], ["5 + 9(1) + 2^2", 18], ["(18 − 4)^2", 196], ["18 − 4^2", 2], ["9 + 2(3^2)", 27], ["(9 + 2)3^2", 99], ["12 + x^4 − 6, x = 8", 4102], ["m^3 + 9n, m = 4, n = 5", 109]] as const).map(([e, a], i) =>
    iR(18, i + 1, 26, e, "AAT", "Exponents & order of operations", "equations", "number", String(a), { ...C(() => [Q(evalSet18(i))], [Q(a)]), printed: [Q(a)], key: "answer-bank" as KeySource })),
  // Set 19  Identifying Equivalent Expressions (p27-28)
  ...([["2(x − y)", "2x − 2y", true], ["4(x + y)", "4y + 4x", true], ["4p + 3c", "(c + 2p)(2)", false], ["21q − 7p", "(3q − p)(7)", true], ["4(2a − 3v)", "8a + 6v", false], ["8(3x + c) − 1", "8c + 24x − 1", true], ["3(2x + 11)", "(3x + 15)(2)", false], ["2x + 2x + 2c + 6", "(2x + c + 3)(2)", true], ["3e + 7 − e", "2e + 10 + 2e − 3", false], ["5c + 4c + 2", "5c + 2(2c + 1)", true]] as const).map(([a, b, same], i) =>
    iR(19, i + 1, i < 6 ? 27 : 28, `${a}  vs  ${b}`, "AAT", "Equivalent expressions", "equations", "choice", same ? "Equivalent" : "Not equivalent", { compute: () => [Q(exprSame(a, b) ? 1 : 0)], statedValues: [Q(same ? 1 : 0)] })),
  iR(19, 11, 28, "How to check #8 by choosing values", "AAT", "Equivalent expressions", "equations", "choice", "Substitute the same numbers into both; equal results every time (try a few) suggests equivalent", { note: "Explain item, turned into a multiple-choice concept check." }),
  // Set 20  Writing and Solving One-Variable Equations (p29-30)
  iR(20, 1, 29, "x + (x + 5) = 9 runs; first three innings and the rest", "AAT", "One-variable equations", "equations", "multi", "2 and 7", C(() => { const x = div(sub(Q(9), Q(5)), Q(2)); return [x, add(x, Q(5))]; }, [Q(2), Q(7)])),
  iR(20, 2, 29, "Bowl +12 cups, −1.25, −2, now 11.5; cups before refill", "AAT", "One-variable equations", "equations", "number", "2.75", C(() => [sub(add(add(Q("11.5"), Q("1.25")), Q(2)), Q(12))], [Q("2.75")])),
  iR(20, 3, 29, "b + 4b = 25 batches; each weekend", "AAT", "One-variable equations", "equations", "multi", "5 and 20", C(() => [div(Q(25), Q(5)), mul(Q(4), div(Q(25), Q(5)))], [Q(5), Q(20)])),
  iR(20, 4, 30, "$350 over July and August, $90 more in August; each month", "AAT", "One-variable equations", "equations", "multi", "$130 and $220", C(() => { const j = div(sub(Q(350), Q(90)), Q(2)); return [j, add(j, Q(90))]; }, [Q(130), Q(220)])),
  iR(20, 5, 30, "Charlene 8 years older; sum 44; ages", "AAT", "One-variable equations", "equations", "multi", "Aaron 18, Charlene 26", C(() => { const a = div(sub(Q(44), Q(8)), Q(2)); return [a, add(a, Q(8))]; }, [Q(18), Q(26)])),
  iR(20, 6, 30, "45% of songs were country = 27; total songs", "AAT", "One-variable equations", "percents", "number", "60", C(() => [whole(45, 27)], [Q(60)])),
  // Set 21  Writing and Graphing One-Variable Inequalities (p31)
  iR(21, 1, 31, "Heaviest egg is 56 g", "AAT", "Inequalities", "equations", "inequality", "w ≤ 56"),
  iR(21, 2, 31, "Light turns on at 72°F or cooler", "AAT", "Inequalities", "equations", "inequality", "t ≤ 72"),
  iR(21, 3, 31, "No less than 5 cups per mold", "AAT", "Inequalities", "equations", "inequality", "c ≥ 5"),
  iR(21, 4, 31, "Shortest tree is at least 25.5 ft", "AAT", "Inequalities", "equations", "inequality", "h ≥ 25.5"),
  ...([["n ≥ −2", "closed circle at −2, arrow right"], ["h ≤ 5", "closed circle at 5, arrow left"], ["t ≤ 7.1", "closed circle at 7.1, arrow left"], ["r ≥ −2/3", "closed circle at −2/3, arrow right"]] as const).map(([e, g], i) =>
    iR(21, i + 5, 31, `Graph ${e}`, "AAT", "Inequalities", "negatives", "multi", g)),
  iR(21, 9, 31, "Difference between x ≤ 5 and x = 5", "AAT", "Inequalities", "equations", "choice", "x = 5 has one solution; x ≤ 5 has infinitely many (5 and everything less)"),
];

export const ROWS: Row[] = [...cml, ...iready];

// ---------------------------------------------------------------- helpers (independent re-derivations)
function simulatePour(): number {
  const cap = [20, 12, 9];
  const s = [20, 0, 0];
  const pour = (from: number, to: number, fill: boolean) => {
    const amt = fill ? Math.min(s[from], cap[to] - s[to]) : Math.min(s[from], cap[to] - s[to]);
    s[from] -= amt;
    s[to] += amt;
  };
  pour(0, 1, true); // A fills B
  pour(1, 2, true); // B fills C
  pour(2, 0, false); // C back into A
  pour(1, 2, false); // B into C
  pour(0, 1, true); // A fills B
  pour(1, 2, true); // B fills C
  pour(2, 0, false); // C into A
  return s[0];
}
function factorTriples(): number[][] {
  const out: number[][] = [];
  for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) for (let c = b; c <= 9; c++) if (a * b * c === 72 && a + b + c === 14) out.push([a, b, c]);
  return out;
}
function largestUnmakeable(x: number, y: number): number {
  let best = -1;
  for (let v = 1; v < 200; v++) {
    let ok = false;
    for (let i = 0; i * x <= v; i++) if ((v - i * x) % y === 0) ok = true;
    if (!ok) best = v;
  }
  return best;
}
const E64_CELLS: [number, number][] = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [0, 3], [1, 3], [2, 3], [1, 4]];
function polyominoPerimeter(cells: [number, number][]): number {
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  let p = 0;
  for (const [x, y] of cells) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(`${x + dx},${y + dy}`)) p++;
  return p;
}
function cryptarithm(): number {
  const hits: number[] = [];
  for (let n = 1000; n <= 9999; n++) {
    const [A, B, C, D] = String(n).split("").map(Number);
    const p = n * 4;
    if (p > 9999) continue;
    const [E, B2, E2, A2] = String(p).split("").map(Number);
    if (B2 === B && E2 === E && A2 === A && new Set([A, B, C, D, E]).size === 5) hits.push(n);
  }
  if (hits.length !== 1) throw new Error(`cryptarithm has ${hits.length} solutions`);
  return hits[0];
}
function bestPalindrome(): number {
  let best = 0, bestP = -1;
  for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) if (2 * a + b === 7 && a * a * b > bestP) { bestP = a * a * b; best = 101 * a + 10 * b; }
  return best;
}
function gridRoutes(w: number, h: number): number {
  const choose = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  return choose(w + h, h);
}
function numText(t: string): Frac {
  const s = t.trim().replace(/^-/, "−");
  const neg = s.startsWith("−");
  const body = s.replace("−", "");
  const m = /^(\d+) (\d+)\/(\d+)$/.exec(body);
  let v: Frac;
  if (m) v = add(Q(Number(m[1])), Q(Number(m[2]), Number(m[3])));
  else if (body.includes("/")) { const [a, b] = body.split("/").map(Number); v = Q(a, b); }
  else v = Q(body);
  return neg ? mul(v, Q(-1)) : v;
}
function cmpText(a: string, b: string) { return cmp(numText(a), numText(b)); }
function sortText(list: string) { return list.split(",").map(numText).sort(cmp); }
function evalSet17(i: number): number {
  const f = [() => 5 * 3 + 26, () => 8 * (6 + 2), () => 7 * 12 + 5, () => 18 + 9 * 4, () => 6 * 8 - 19 + 2, () => 12 * 3 + 52][i];
  return f();
}
function evalSet18(i: number): number {
  const x = 8, m = 4, n = 5;
  const f = [() => (6 + 3) ** 4, () => 6 + 3 ** 4, () => 2 * 4 ** 3 - 1, () => 2 * (4 ** 3 - 1), () => 5 + 9 * (1 + 2) ** 2, () => 5 + 9 * 1 + 2 ** 2, () => (18 - 4) ** 2, () => 18 - 4 ** 2, () => 9 + 2 * 3 ** 2, () => (9 + 2) * 3 ** 2, () => 12 + x ** 4 - 6, () => m ** 3 + 9 * n][i];
  return f();
}
import { evalExpr, parseExpr } from "../lib/parse";
function exprSame(a: string, b: string): boolean {
  const ea = parseExpr(a), eb = parseExpr(b);
  for (const k of [1, 2, 3, 5]) {
    const env: Record<string, Frac> = {};
    "abcdefghijklmnopqrstuvwxyz".split("").forEach((ch, i) => (env[ch] = Q(i * k + 3, k + 1)));
    const va = evalExpr(ea, env), vb = evalExpr(eb, env);
    if (va.n !== vb.n || va.d !== vb.d) return false;
  }
  return true;
}
