// CML sample papers: every question except the two in pilot.ts (P 5-1 #4, #5).
// P 7-3 #2 is word-for-word P 6-3 #2, so it is built once (cml-p6-3-2, alsoIn).
import { type Frac, add, cmp, div, eq, mul, q, sub } from "../../lib/frac";
import type { Exercise } from "../../lib/types";
type Pair = [number, number];
import { n, usd } from "../../lib/text";
import * as Fig from "../diagrams/cml";

const F = ([a, b]: Pair) => q(a, b);
const num = (f: Frac) => Number(f.n) / Number(f.d);
const unique = <T>(hits: T[], what: string): T => {
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} solutions, expected exactly 1`);
  return hits[0];
};
const rect = (x0: number, y0: number, w: number, d: number): Pair[] => {
  const out: Pair[] = [];
  for (let y = y0; y < y0 + d; y++) for (let x = x0; x < x0 + w; x++) out.push([x, y]);
  return out;
};

// ================================================================== P 5-1
// #1 custom operation ⟨a,b,c⟩ = [(a×b)+(a×c)] ÷ (b×c)
type Op3 = { a: number; b: number; c: number };
const p51_1: Exercise<Op3> = {
  id: "cml-p5-1-1",
  title: "Angle brackets",
  source: { kind: "CML", ref: "P 5-1 #1", key: "official" },
  domain: "AAT",
  skill: "Evaluating expressions",
  cluster: "equations",
  base: { a: 8, b: 4, c: 2 },
  variants: [{ a: 6, b: 3, c: 2 }, { a: 10, b: 5, c: 2 }],
  official: [q(6)],
  solve: ({ a, b, c }) => {
    // count how many (b×c) blocks fit in a×b + a×c by repeated subtraction
    let left = a * b + a * c, k = 0;
    while (left >= b * c) { left -= b * c; k++; }
    if (left !== 0) throw new Error("not a whole number");
    return [q(k)];
  },
  build: ({ a, b, c }) => {
    const top = a * b + a * c, bottom = b * c, v = top / bottom;
    return {
      prompt: `A new symbol works like this: **⟨a, b, c⟩ = [(a × b) + (a × c)] ÷ (b × c)**.\n\nWhat is **⟨${a}, ${b}, ${c}⟩**? Write it in simplest form.`,
      answer: { fields: [{ kind: "number", value: q(v), simplest: true }] },
      answerText: String(v),
      hints: [
        `Match the letters to the numbers first: a is ${a}, b is ${b}, c is ${c}.`,
        "Work out the two products inside the square brackets and add them. That's the top.",
        "The bottom is b × c. Now divide the top by the bottom.",
      ],
      solution: [
        `a × b = ${a} × ${b} = ${a * b}, and a × c = ${a} × ${c} = ${a * c}.`,
        `Add them: ${a * b} + ${a * c} = ${top}.`,
        `b × c = ${b} × ${c} = ${bottom}.`,
        `${top} ÷ ${bottom} = **${v}**.`,
      ],
    };
  },
};

// #2 map scale range
type MapP = { s: number; d1: Pair; d2: Pair };
const p51_2: Exercise<MapP> = {
  id: "cml-p5-1-2",
  title: "Three towns on a map",
  source: { kind: "CML", ref: "P 5-1 #2", key: "official" },
  domain: "AAT",
  skill: "Scale & ratios",
  cluster: "rates",
  base: { s: 150, d1: [3, 1], d2: [7, 2] } as { s: number; d1: [number, number]; d2: [number, number] },
  variants: [{ s: 100, d1: [5, 2], d2: [4, 1] }, { s: 40, d1: [2, 1], d2: [9, 2] }],
  official: [q(75), q(975)],
  solve: ({ s, d1, d2 }) => {
    // place the towns on one line in every arrangement and keep the extremes
    const dists: Frac[] = [];
    for (const sa of [1, -1]) for (const sc of [1, -1]) {
      const A = mul(F(d1), q(sa)), C = mul(F(d2), q(sc));
      const gap = sub(A, C);
      dists.push(cmp(gap, q(0)) < 0 ? mul(gap, q(-1)) : gap);
    }
    dists.sort(cmp);
    return [mul(dists[0], q(s)), mul(dists[dists.length - 1], q(s))];
  },
  build: ({ s, d1, d2 }) => {
    const a = F(d1), c = F(d2);
    const lo = cmp(a, c) > 0 ? sub(a, c) : sub(c, a);
    const hi = add(a, c);
    const loMi = mul(lo, q(s)), hiMi = mul(hi, q(s));
    return {
      prompt: `The scale on a map reads **1 in = ${s} miles**. On the map, Ashby is **${n(a)} in** from Brook, and Brook is **${n(c)} in** from Cole.\n\nThe actual distance from Ashby to Cole could be anywhere from ___ miles to ___ miles.`,
      answer: { anyOrder: true, fields: [{ kind: "number", label: "from", value: loMi, unit: "miles" }, { kind: "number", label: "to", value: hiMi, unit: "miles" }] },
      answerText: `${n(loMi)} to ${n(hiMi)} miles`,
      hints: [
        "Think about the two extreme ways the towns could sit: all on one straight line, but in different orders.",
        "The longest trip is when Brook sits between the other two. The shortest is when Ashby and Cole are on the same side of Brook.",
        `Work in map inches first, then turn inches into miles: every inch is ${s} miles.`,
      ],
      solution: [
        `Longest: Brook in the middle, so the map distance is ${n(a)} + ${n(c)} = ${n(hi)} in.`,
        `Shortest: Ashby and Cole on the same side, so it's the difference ${n(lo)} in.`,
        `Turn into miles: ${n(lo)} × ${s} = ${n(loMi)} and ${n(hi)} × ${s} = ${n(hiMi)}.`,
        `So anywhere from **${n(loMi)} miles** to **${n(hiMi)} miles**.`,
      ],
    };
  },
};

// #3 rows and seats
type SeatP = { front: number; back: number; left: number; right: number };
const p51_3: Exercise<SeatP> = {
  id: "cml-p5-1-3",
  title: "Where Patricia sits",
  source: { kind: "CML", ref: "P 5-1 #3", key: "official" },
  domain: "NO",
  skill: "Logic & counting",
  cluster: "logic",
  base: { front: 2, back: 4, left: 4, right: 3 },
  variants: [{ front: 3, back: 5, left: 2, right: 6 }, { front: 4, back: 2, left: 5, right: 3 }],
  official: [q(30)],
  solve: ({ front, back, left, right }) => {
    const hits: number[] = [];
    for (let R = 1; R <= 30; R++) for (let C = 1; C <= 30; C++) if (R - front + 1 === back && C - left + 1 === right) hits.push(R * C);
    return [q(unique(hits, "seats"))];
  },
  build: ({ front, back, left, right }) => {
    const ord = (k: number) => `${k}${k === 1 ? "st" : k === 2 ? "nd" : k === 3 ? "rd" : "th"}`;
    const rows = front + back - 1, cols = left + right - 1, total = rows * cols;
    return {
      prompt: `A classroom is full, with the same number of students in every row. Patricia sits in the **${ord(front)} row from the front** and the **${ord(back)} row from the back**. She is also the **${ord(left)} student from the left** and the **${ord(right)} from the right**.\n\nHow many students are in the class?`,
      answer: { fields: [{ kind: "number", value: q(total), unit: "students" }] },
      answerText: `${total} students`,
      hints: [
        "Count the rows first. Patricia's own row is counted from the front AND from the back, so be careful not to count it twice.",
        "Do the same thing across her row: she's counted from the left and from the right.",
        "Once you know how many rows and how many students in each row, multiply.",
      ],
      solution: [
        `Rows: ${front} from the front + ${back} from the back counts her row twice, so ${front} + ${back} − 1 = ${rows} rows.`,
        `Seats in a row: ${left} + ${right} − 1 = ${cols}.`,
        `${rows} × ${cols} = **${total} students**.`,
      ],
    };
  },
};

// #6 paint pouring
type PourP = { a: number; b: number; c: number };
function pourStates({ a, b, c }: PourP) {
  const cap = [a, b, c];
  const s = [a, 0, 0];
  const states: { s: number[]; text: string }[] = [{ s: [...s], text: `Start: A holds ${a} gallons; B and C are empty.` }];
  const name = ["A", "B", "C"];
  const moves: [number, number, boolean][] = [[0, 1, true], [1, 2, true], [2, 0, false], [1, 2, false], [0, 1, true], [1, 2, true], [2, 0, false]];
  for (const [from, to, fill] of moves) {
    const amt = Math.min(s[from], cap[to] - s[to]);
    s[from] -= amt;
    s[to] += amt;
    states.push({ s: [...s], text: `${name[from]} ${fill ? "fills" : "pours into"} ${name[to]} (${amt} gal): A ${s[0]}, B ${s[1]}, C ${s[2]}.` });
  }
  return states;
}
const p51_6: Exercise<PourP> = {
  id: "cml-p5-1-6",
  title: "Pouring paint",
  source: { kind: "CML", ref: "P 5-1 #6", key: "official" },
  domain: "NO",
  skill: "Logic & counting",
  cluster: "logic",
  base: { a: 20, b: 12, c: 9 },
  variants: [{ a: 18, b: 10, c: 7 }, { a: 16, b: 9, c: 5 }],
  official: [q(14)],
  solve: ({ a, b, c }) => {
    // independent re-run, tracking free space instead of contents
    let A = a, B = 0, C = 0;
    const room = (have: number, cap: number) => cap - have;
    let m = Math.min(A, room(B, b)); A -= m; B += m;
    m = Math.min(B, room(C, c)); B -= m; C += m;
    A += C; C = 0;
    m = Math.min(B, room(C, c)); B -= m; C += m;
    m = Math.min(A, room(B, b)); A -= m; B += m;
    m = Math.min(B, room(C, c)); B -= m; C += m;
    A += C; C = 0;
    return [q(A)];
  },
  build: (p) => {
    const states = pourStates(p);
    const last = states[states.length - 1].s[0];
    return {
      diagram: Fig.containers(p.a, p.b, p.c),
      prompt: `Container A is full with **${p.a} gallons** of paint. Container B holds **${p.b} gallons** and container C holds **${p.c} gallons**; both start empty. Then:\n\n1. Pour from A until B is full.  2. Pour from B until C is full.  3. Pour all of C back into A.  4. Pour all of B into C.  5. Pour from A until B is full.  6. Pour from B until C is full.  7. Pour all of C into A.\n\nHow many gallons are in A now?`,
      answer: { fields: [{ kind: "number", value: q(last), unit: "gallons" }] },
      answerText: `${last} gallons`,
      hints: [
        "Keep a little table with three columns, A, B and C, and write a new line after every pour.",
        "“Until B is full” means you only pour as much as B has room for. The rest stays behind.",
        "Paint is never lost: after every step, A + B + C should still add up to the starting amount.",
      ],
      solution: [...states.slice(1).map((st) => st.text), `So A ends with **${last} gallons**.`],
    };
  },
};

// ================================================================== P 6-3
// #1 sum and product
type SumP = { s: number; a: number };
const p63_1: Exercise<SumP> = {
  id: "cml-p6-3-1",
  title: "Sum to product",
  source: { kind: "CML", ref: "P 6-3 #1", key: "official" },
  domain: "NO",
  skill: "Whole-number operations",
  cluster: "equations",
  base: { s: 14, a: 9 },
  variants: [{ s: 17, a: 8 }, { s: 20, a: 13 }],
  official: [q(45)],
  solve: ({ s, a }) => {
    for (let y = 0; y <= 100; y++) if (a + y === s) return [q(a * y)];
    throw new Error("no partner");
  },
  build: ({ s, a }) => {
    const b = s - a, prod = a * b;
    return {
      prompt: `Two numbers add up to **${s}**. One of them is **${a}**.\n\nWhat do you get when you multiply the two numbers?`,
      answer: { fields: [{ kind: "number", value: q(prod) }] },
      answerText: String(prod),
      hints: [
        `First find the missing number: ${a} plus what makes ${s}?`,
        `You can find it by subtracting: ${s} − ${a}.`,
        "The question asks for the product, so multiply the two numbers together.",
      ],
      solution: [`The other number is ${s} − ${a} = ${b}.`, `${a} × ${b} = **${prod}**.`],
    };
  },
};

// #2 (= P 7-3 #2) reciprocal from a#b
type RecP = { w: number; num: number; den: number };
const p63_2: Exercise<RecP> = {
  id: "cml-p6-3-2",
  title: "Two flipped operations",
  source: { kind: "CML", ref: "P 6-3 #2", key: "official" },
  alsoIn: ["P 7-3 #2"],
  domain: "NO",
  skill: "Fractions & reciprocals",
  cluster: "fracdiv",
  base: { w: 7, num: 2, den: 3 },
  variants: [{ w: 5, num: 1, den: 4 }, { w: 3, num: 2, den: 5 }],
  official: [q(3, 23)],
  solve: ({ w, num, den }) => {
    // a@b × a#b = 1 for any a, b: check with a = b = 2 × (a#b), then use it
    const g = add(q(w), q(num, den));
    const a = mul(q(2), g);
    const hash = div(mul(a, a), add(a, a));
    if (!eq(hash, g)) throw new Error("bad pick");
    return [div(add(a, a), mul(a, a))];
  },
  build: ({ w, num, den }) => {
    const g = add(q(w), q(num, den));
    const ans = div(q(1), g);
    return {
      prompt: `Two made-up operations: **a @ b = (a + b) ÷ (a × b)** and **a # b = (a × b) ÷ (a + b)**.\n\nIf **a # b = ${w} [[${num}/${den}]]**, what is **a @ b**? Give it in simplest form.`,
      answer: { fields: [{ kind: "number", value: ans, simplest: true }] },
      answerText: n(ans),
      hints: [
        "Look closely at the two definitions. What's different about them?",
        "One is the other turned upside down: the top and bottom swap places.",
        `So write ${w} ${num}/${den} as an improper fraction, then flip it.`,
      ],
      solution: [
        "a @ b has the same top and bottom as a # b, swapped, so a @ b = 1 ÷ (a # b), the reciprocal.",
        `${w} ${num}/${den} = ${g.n}/${g.d}.`,
        `Flip it: **${n(ans)}**.`,
      ],
    };
  },
};

// #3 four rectangles
type RectP = { w1: number; w2: number; h1: number; h2: number };
const p63_3: Exercise<RectP> = {
  id: "cml-p6-3-3",
  title: "The fourth rectangle",
  source: { kind: "CML", ref: "P 6-3 #3", key: "official" },
  domain: "G",
  skill: "Area of rectangles",
  cluster: "shapes",
  base: { w1: 11, w2: 3, h1: 5, h2: 10 },
  variants: [{ w1: 7, w2: 4, h1: 6, h2: 9 }, { w1: 9, w2: 5, h1: 4, h2: 8 }],
  official: [q(110)],
  solve: ({ w1, w2, h1, h2 }) => {
    const A = w1 * h1, B = w2 * h1, C = w2 * h2;
    const Ds = new Set<number>();
    for (let h = 1; h <= B; h++) if (A % h === 0 && B % h === 0) {
      const ww2 = B / h;
      if (C % ww2 === 0) Ds.add((A / h) * (C / ww2));
    }
    return [q(unique([...Ds], "rectangles"))];
  },
  build: ({ w1, w2, h1, h2 }) => {
    const A = w1 * h1, B = w2 * h1, C = w2 * h2, D = w1 * h2;
    return {
      diagram: Fig.fourRects(w1, w2, h1, h2),
      prompt: `The figure has 4 rectangles (**A**, **B**, **C**, **D**) with whole-number lengths and widths. The areas of A, B and C, in square units, are given in the diagram.\n\nWhat is the area of rectangle **D**, in square units?`,
      answer: { fields: [{ kind: "number", value: q(D), unit: "sq units" }] },
      answerText: `${D} square units`,
      hints: [
        "A and B share the same height (the top strip). B and C share the same width (the right strip).",
        `Try a width for B that divides both ${B} and ${C}. Then the heights of the two strips follow.`,
        "D has A's width and C's height. Multiply them.",
      ],
      solution: [
        `B = ${w2} × ${h1}, so the right strip is ${w2} wide and the top strip is ${h1} tall.`,
        `A = ${A} with height ${h1}, so A is ${w1} wide. C = ${C} with width ${w2}, so C is ${h2} tall.`,
        `D = ${w1} × ${h2} = **${D}**. (A shortcut: D = A × C ÷ B = ${A} × ${C} ÷ ${B}.)`,
      ],
    };
  },
};

// #4 factor triples
type TripleP = { P: number; S: number; given: [number, number, number] };
const triplesOf = (P: number, S: number) => {
  const out: number[][] = [];
  for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) for (let c = b; c <= 9; c++) if (a * b * c === P && a + b + c === S) out.push([a, b, c]);
  return out;
};
const p63_4: Exercise<TripleP> = {
  id: "cml-p6-3-4",
  title: "Same product, same sum",
  source: { kind: "CML", ref: "P 6-3 #4", key: "official" },
  domain: "NO",
  skill: "Factors & multiples",
  cluster: "logic",
  base: { P: 72, S: 14, given: [6, 6, 2] },
  variants: [{ P: 36, S: 13, given: [2, 2, 9] }, { P: 144, S: 17, given: [3, 6, 8] }],
  official: [q(8), q(3), q(3)],
  solve: ({ P, S, given }) => {
    const g = [...given].sort((x, y) => x - y).join();
    const all = triplesOf(P, S);
    if (all.length !== 2) throw new Error(`expected exactly two triples, found ${all.length}`);
    return unique(all.filter((t) => t.join() !== g), "triples").map((v) => q(v));
  },
  build: ({ P, S, given }) => {
    const g = [...given].sort((x, y) => x - y).join();
    const other = triplesOf(P, S).filter((t) => t.join() !== g)[0];
    return {
      prompt: `There are exactly two sets of three single-digit numbers (repeats allowed) that **multiply to ${P}** and **add up to ${S}**. One set is **${given.join(", ")}**.\n\nWhat is the other set?`,
      answer: { anyOrder: true, fields: other.map((v) => ({ kind: "number" as const, value: q(v) })) },
      answerText: other.join(", "),
      hints: [
        `Break ${P} into prime factors.`,
        "Now group those prime factors into three single-digit numbers, in as many ways as you can.",
        `For each grouping, add the three numbers and keep the one that reaches ${S} (and isn't the set you were given).`,
      ],
      solution: [
        `List the ways to write ${P} as three digits: ${allTriples(P).map((t) => `${t.join("×")} (sum ${t[0] + t[1] + t[2]})`).join(", ")}.`,
        `Two of them add to ${S}: ${given.join(", ")} and **${other.join(", ")}**.`,
      ],
    };
  },
};
function allTriples(P: number) {
  const out: number[][] = [];
  for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) for (let c = b; c <= 9; c++) if (a * b * c === P) out.push([a, b, c]);
  return out;
}

// #5 out and back
type TripP = { v: number; t: Pair; d: number };
const p63_5: Exercise<TripP> = {
  id: "cml-p6-3-5",
  title: "Out and back",
  source: { kind: "CML", ref: "P 6-3 #5", key: "official" },
  domain: "AAT",
  skill: "Rate, time & distance",
  cluster: "rates",
  base: { v: 10, t: [7, 2], d: 25 },
  variants: [{ v: 12, t: [5, 2], d: 20 }, { v: 8, t: [9, 2], d: 14 }],
  official: [q(85, 2)],
  solve: ({ v, t, d }) => {
    // ride in quarter-hour slices: out until half the time, then back; track the farthest point
    const slices = Number(div(mul(F(t), q(4)), q(1)).n);
    let pos = q(0), far = q(0);
    for (let i = 0; i < slices; i++) {
      pos = i < slices / 2 ? add(pos, q(v, 4)) : sub(pos, q(v, 4));
      if (cmp(pos, far) > 0) far = pos;
    }
    return [add(far, q(d))];
  },
  build: ({ v, t, d }) => {
    const T = F(t), total = mul(q(v), T), out = div(total, q(2)), ans = add(out, q(d));
    return {
      prompt: `Carlos rides his bike from Jonesville toward Smithtown and back again, at **${v} miles per hour** for **${n(T)} hours** in all. The closest he got to Smithtown was **${d} miles** away.\n\nHow far is it from Jonesville to Smithtown along that road?`,
      answer: { fields: [{ kind: "number", value: ans, unit: "miles" }] },
      answerText: `${n(ans)} miles`,
      hints: [
        "Speed × time tells you how far he rode altogether.",
        "He rode out and back the same distance, so the way out is half of the total.",
        `At his turning point he was still ${d} miles short of Smithtown. Add that on.`,
      ],
      solution: [
        `Total ride: ${v} × ${n(T)} = ${n(total)} miles.`,
        `Out and back are equal, so he rode ${n(out)} miles out.`,
        `He turned ${d} miles short of Smithtown: ${n(out)} + ${d} = **${n(ans)} miles**.`,
      ],
    };
  },
};

// #6 stamps (largest value you can't make)
type StampP = { a: number; b: number; lo: number; hi: number };
const makeable = (v: number, a: number, b: number) => {
  for (let i = 0; i * a <= v; i++) if ((v - i * a) % b === 0) return true;
  return false;
};
const p63_6: Exercise<StampP> = {
  id: "cml-p6-3-6",
  title: "The stamp you can't make",
  source: { kind: "CML", ref: "P 6-3 #6", key: "official" },
  domain: "NO",
  skill: "Factors & multiples",
  cluster: "logic",
  base: { a: 5, b: 9, lo: 20, hi: 50 },
  variants: [{ a: 4, b: 7, lo: 10, hi: 30 }, { a: 3, b: 8, lo: 10, hi: 20 }],
  official: [q(31)],
  solve: ({ a, b }) => {
    // the first run of `a` makeable values in a row means everything after is makeable
    let run = 0, last = -1;
    for (let v = 1; v < 500; v++) {
      if (makeable(v, a, b)) { run++; if (run === a) break; } else { run = 0; last = v; }
    }
    return [q(last)];
  },
  build: ({ a, b, lo, hi }) => {
    const ans = a * b - a - b;
    return {
      prompt: `Using **${a}¢** stamps and **${b}¢** stamps, ${b * 2 + a}¢ of postage can be made with two ${b}¢ stamps and one ${a}¢ stamp (${b * 2} + ${a} = ${b * 2 + a}). ${b * 4}¢ of postage can be made with four ${b}¢ stamps.\n\nWhat is the **largest** value of postage that **cannot** be made with ${a}¢ and ${b}¢ stamps? (The value is more than ${lo}¢ but less than ${hi}¢.)`,
      answer: { fields: [{ kind: "number", value: q(ans), unit: "cents" }] },
      answerText: `${ans}¢`,
      hints: [
        "Make a list of amounts in a row and mark each one you can make.",
        `Here's the key: once you can make ${a} amounts in a row, you can make every bigger amount too. Why? Just add one more ${a}¢ stamp.`,
        `So look for the last gap before a run of ${a} makeable amounts.`,
      ],
      solution: [
        `Lay the amounts out in rows of ${a}. Each column is “add another ${a}¢”, so once a column has its first amount you can make, every amount above it can be made too.`,
        `Each column starts at a multiple of ${b}: ${Array.from({ length: a }, (_, k) => k * b).join(", ")}¢ (with ${a}¢ stamps added on top).`,
        `The column that starts latest begins at ${(a - 1) * b}¢, so the last gap is just below it: ${(a - 1) * b} − ${a} = **${ans}¢**.`,
      ],
    };
  },
};

// ================================================================== E 6-4
// #1 dividend from quotient and remainder
type DivP = { d: number; qt: number; r: number };
const e64_1: Exercise<DivP> = {
  id: "cml-e6-4-1",
  title: "The hidden dividend",
  source: { kind: "CML", ref: "E 6-4 #1", key: "official" },
  domain: "NO",
  skill: "Division with remainders",
  cluster: "equations",
  base: { d: 13, qt: 8, r: 3 },
  variants: [{ d: 11, qt: 9, r: 4 }, { d: 15, qt: 6, r: 7 }],
  official: [q(107)],
  solve: ({ d, qt, r }) => {
    const hits: number[] = [];
    for (let v = 0; v <= 1000; v++) if (Math.floor(v / d) === qt && v % d === r) hits.push(v);
    return [q(unique(hits, "dividend"))];
  },
  build: ({ d, qt, r }) => {
    const v = d * qt + r;
    return {
      diagram: Fig.divisionBox(d, qt, r),
      prompt: `A number is divided by **${d}**. The quotient is **${qt}** and the remainder is **${r}**.\n\nWhat was the number?`,
      answer: { fields: [{ kind: "number", value: q(v) }] },
      answerText: String(v),
      hints: [
        `If there were no remainder, the number would be exactly ${qt} groups of ${d}.`,
        "The remainder is what's left over after those groups.",
        "So multiply, then add the leftover.",
      ],
      solution: [`${qt} groups of ${d} is ${qt} × ${d} = ${qt * d}.`, `Add the remainder: ${qt * d} + ${r} = **${v}**.`],
    };
  },
};

// #2 the cross-multiply box
type DetP = { b: number; c: number; d: number; R: number };
const e64_2: Exercise<DetP> = {
  id: "cml-e6-4-2",
  title: "The cross-multiply box",
  source: { kind: "CML", ref: "E 6-4 #2", key: "official" },
  domain: "AAT",
  skill: "One-variable equations",
  cluster: "equations",
  base: { b: 5, c: 4, d: 3, R: 22 },
  variants: [{ b: 6, c: 2, d: 4, R: 16 }, { b: 3, c: 5, d: 2, R: 11 }],
  official: [q(14)],
  solve: ({ b, c, d, R }) => {
    const hits: number[] = [];
    for (let x = -200; x <= 200; x++) if (x * d - b * c === R) hits.push(x);
    return [q(unique(hits, "x"))];
  },
  build: ({ b, c, d, R }) => {
    const total = R + b * c, x = total / d;
    return {
      diagram: Fig.bracketRule(b, c, d, R),
      prompt: `The diagram shows what a box of four numbers means: **ad − bc**.\n\nFind **x** if the box on the right equals **${R}**.`,
      answer: { fields: [{ kind: "number", value: q(x) }] },
      answerText: `x = ${x}`,
      hints: [
        `Write it out with the rule: x × ${d} − ${b} × ${c} = ${R}.`,
        `Work out ${b} × ${c}, then ask: what minus that gives ${R}?`,
        `Then ${d} groups of x make that number. Divide.`,
      ],
      solution: [`x × ${d} − ${b * c} = ${R}.`, `So ${d}x = ${R} + ${b * c} = ${total}.`, `x = ${total} ÷ ${d} = **${x}**.`],
    };
  },
};

// #3 hourly pay
type PayP = { pay: number; mins: number; t: Pair };
const e64_3: Exercise<PayP> = {
  id: "cml-e6-4-3",
  title: "Painting by the hour",
  source: { kind: "CML", ref: "E 6-4 #3", key: "official" },
  domain: "AAT",
  skill: "Unit rates",
  cluster: "rates",
  base: { pay: 28, mins: 140, t: [7, 2] },
  variants: [{ pay: 30, mins: 150, t: [9, 2] }, { pay: 45, mins: 200, t: [5, 1] }],
  official: [q(42)],
  solve: ({ pay, mins, t }) => [mul(div(q(pay), q(mins)), mul(F(t), q(60)))], // pay per minute × minutes
  build: ({ pay, mins, t }) => {
    const hours = q(mins, 60), rate = div(q(pay), hours), T = F(t), ans = mul(rate, T);
    const hm = `${Math.floor(mins / 60)} hours and ${mins % 60} minutes`;
    return {
      prompt: `Jerry helped paint a room and earned **$${pay}** for **${hm}** of work. The next day he painted for **${n(T)} hours** at the same hourly rate.\n\nHow much did he earn the next day?`,
      answer: { fields: [{ kind: "number", value: ans, prefix: "$" }] },
      answerText: usd(ans),
      hints: [
        `Turn ${hm} into hours. How many hours is ${mins % 60} minutes?`,
        "Find his pay for one hour: the money divided by the hours.",
        `Then multiply that hourly pay by ${n(T)}.`,
      ],
      solution: [`${hm} = ${n(hours)} hours.`, `Hourly rate: $${pay} ÷ ${n(hours)} = $${n(rate)} per hour.`, `${n(T)} × $${n(rate)} = **${usd(ans)}**.`],
    };
  },
};

// #4 cross of nine squares
type CrossP = { area: number };
const CROSS: Pair[] = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [0, 3], [1, 3], [2, 3], [1, 4]];
const e64_4: Exercise<CrossP> = {
  id: "cml-e6-4-4",
  title: "Nine squares",
  source: { kind: "CML", ref: "E 6-4 #4", key: "official" },
  domain: "G",
  skill: "Area & perimeter",
  cluster: "shapes",
  base: { area: 144 },
  variants: [{ area: 81 }, { area: 225 }],
  official: [q(80)],
  solve: ({ area }) => {
    let side = 0;
    for (let s = 1; s <= 50; s++) if (s * s * 9 === area) side = s;
    const set = new Set(CROSS.map((c) => c.join()));
    let edges = 0;
    for (const [x, y] of CROSS) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(`${x + dx},${y + dy}`)) edges++;
    return [q(edges * side)];
  },
  build: ({ area }) => {
    const sq = area / 9, side = Math.sqrt(sq), per = 20 * side;
    return {
      diagram: Fig.cross(),
      prompt: `The diagram is made of **9 identical squares**. The area of the shape is **${area} square units**.\n\nWhat is the perimeter of the shape, in units?`,
      answer: { fields: [{ kind: "number", value: q(per), unit: "units" }] },
      answerText: `${per} units`,
      hints: [
        "All nine squares are the same, so they share the area equally.",
        "Once you know one square's area, what number times itself gives it? That's the side length.",
        "Walk around the outside of the shape and count how many square sides you pass.",
      ],
      solution: [`Each square: ${area} ÷ 9 = ${sq} square units, so each side is ${side}.`, "The outline is made of 20 square sides.", `20 × ${side} = **${per} units**.`],
    };
  },
};

// #5 mean of the added numbers
type MeanP = { n1: number; m1: number; n2: number; m2: number };
const e64_5: Exercise<MeanP> = {
  id: "cml-e6-4-5",
  title: "Four new numbers",
  source: { kind: "CML", ref: "E 6-4 #5", key: "official" },
  domain: "MD",
  skill: "Mean (average)",
  cluster: "data",
  base: { n1: 8, m1: 45, n2: 4, m2: 55 },
  variants: [{ n1: 6, m1: 20, n2: 2, m2: 25 }, { n1: 5, m1: 12, n2: 3, m2: 15 }],
  official: [q(75)],
  solve: ({ n1, m1, n2, m2 }) => {
    const hits: number[] = [];
    for (let y = 0; y <= 500; y++) if ((n1 * m1 + n2 * y) === m2 * (n1 + n2)) hits.push(y);
    return [q(unique(hits, "mean"))];
  },
  build: ({ n1, m1, n2, m2 }) => {
    const s1 = n1 * m1, s2 = (n1 + n2) * m2, y = (s2 - s1) / n2;
    return {
      prompt: `The average of **${n1} numbers** is **${m1}**. When **${n2} more numbers** are added, the average of all of them goes up to **${m2}**.\n\nWhat is the average of the ${n2} new numbers?`,
      answer: { fields: [{ kind: "number", value: q(y) }] },
      answerText: String(y),
      hints: [
        "An average times how many numbers there are gives the total.",
        `Find the total of the first ${n1}, and the total of all ${n1 + n2}.`,
        `The difference is what the ${n2} new numbers add up to. Share it equally.`,
      ],
      solution: [`First ${n1}: ${n1} × ${m1} = ${s1}.`, `All ${n1 + n2}: ${n1 + n2} × ${m2} = ${s2}.`, `New numbers: ${s2} − ${s1} = ${s2 - s1}, so their average is ${s2 - s1} ÷ ${n2} = **${y}**.`],
    };
  },
};

// #6 watermelons
type MelonP = { num: number; den: number; left: number; price: string };
const e64_6: Exercise<MelonP> = {
  id: "cml-e6-4-6",
  title: "The farm stand",
  source: { kind: "CML", ref: "E 6-4 #6", key: "official" },
  domain: "NO",
  skill: "Fractions of a whole",
  cluster: "rates",
  base: { num: 5, den: 6, left: 7, price: "4.50" },
  variants: [{ num: 3, den: 4, left: 9, price: "2.50" }, { num: 2, den: 3, left: 12, price: "3.25" }],
  official: [q("157.5")],
  solve: ({ num, den, left, price }) => {
    for (let total = 1; total <= 500; total++) if (total * (den - num) === left * den) return [mul(q(total - left), q(price))];
    throw new Error("no total");
  },
  build: ({ num, den, left, price }) => {
    const total = (left * den) / (den - num), sold = total - left, ans = mul(q(sold), q(price));
    return {
      prompt: `One day a farm stand sold **[[${num}/${den}]]** of its watermelons, for **$${price}** each. It still has **${left} watermelons** left.\n\nHow much money did it take in that day?`,
      answer: { fields: [{ kind: "number", value: ans, prefix: "$" }] },
      answerText: usd(ans),
      hints: [
        `If ${num}/${den} were sold, what fraction is left?`,
        `That leftover fraction is ${left} watermelons. How many is one ${den}th? How many were there to start?`,
        "Count the ones sold, then multiply by the price.",
      ],
      solution: [
        `${den - num}/${den} are left, and that's ${left} watermelons, so there were ${total} at the start.`,
        `Sold: ${total} − ${left} = ${sold}.`,
        `${sold} × $${price} = **${usd(ans)}**.`,
      ],
    };
  },
};

// ================================================================== P 7-3
// #1 place value
type PVP = { h: number; t: number };
const p73_1: Exercise<PVP> = {
  id: "cml-p7-3-1",
  title: "Hundreds and tens",
  source: { kind: "CML", ref: "P 7-3 #1", key: "official" },
  domain: "NO",
  skill: "Place value",
  cluster: "rates",
  base: { h: 19, t: 11 },
  variants: [{ h: 23, t: 14 }, { h: 8, t: 27 }],
  official: [q(2010)],
  solve: ({ h, t }) => [q(Number(`${h}00`) + Number(`${t}0`))],
  build: ({ h, t }) => {
    const v = h * 100 + t * 10;
    return {
      prompt: `What number is **${h} hundreds** and **${t} tens** added together?`,
      answer: { fields: [{ kind: "number", value: q(v) }] },
      answerText: String(v),
      hints: ["How much is one hundred? So how much is that many hundreds?", "Do the same for the tens.", "Add the two amounts."],
      solution: [`${h} hundreds = ${h * 100}.`, `${t} tens = ${t * 10}.`, `${h * 100} + ${t * 10} = **${v}**.`],
    };
  },
};

// #3 the other point twice as far
type FarP = { A: number; B: number; r: number };
const p73_3: Exercise<FarP> = {
  id: "cml-p7-3-3",
  title: "The other spot",
  source: { kind: "CML", ref: "P 7-3 #3", key: "official" },
  domain: "NO",
  skill: "Distance on the number line",
  cluster: "negatives",
  base: { A: 6, B: 12, r: 2 },
  variants: [{ A: 3, B: 9, r: 2 }, { A: 4, B: 16, r: 3 }],
  official: [q(18)],
  solve: ({ A, B, r }) => {
    const given = (A + r * B) / (1 + r);
    const hits: Frac[] = [];
    for (let i = -400; i <= 800; i++) {
      const x = i / 4;
      if (Math.abs(Math.abs(x - A) - r * Math.abs(x - B)) < 1e-9 && x !== given) hits.push(q(i, 4));
    }
    return [unique(hits, "other point")];
  },
  build: ({ A, B, r }) => {
    const given = (A + r * B) / (1 + r), other = (r * B - A) / (r - 1);
    const word = r === 2 ? "twice" : r === 3 ? "three times" : `${r} times`;
    return {
      prompt: `On a number line, the point **${given}** is **${word} as far from ${A}** as it is **from ${B}**.\n\nThere is one other point that is also ${word} as far from ${A} as from ${B}. What is it?`,
      answer: { fields: [{ kind: "number", value: q(other) }] },
      answerText: String(other),
      hints: [
        `${given} sits between ${A} and ${B}. Where else could a point be?`,
        `Try points past ${B}. For each one, compare its distance to ${A} with its distance to ${B}.`,
        `Past ${B}, the distance to ${A} is always ${B - A} more than the distance to ${B}.`,
      ],
      solution: [
        `Past ${B}, call the distance to ${B} d. Then the distance to ${A} is d + ${B - A}.`,
        `We need d + ${B - A} = ${r}d, so ${B - A} = ${r - 1}d and d = ${(B - A) / (r - 1)}.`,
        `The point is ${B} + ${(B - A) / (r - 1)} = **${other}**. Check: ${other - A} is ${r} × ${other - B}.`,
      ],
    };
  },
};

// #4 stack of small cubes
type CubeP = { s: number };
const p73_4: Exercise<CubeP> = {
  id: "cml-p7-3-4",
  title: "A tower of tiny cubes",
  source: { kind: "CML", ref: "P 7-3 #4", key: "official" },
  domain: "MD",
  skill: "Volume & unit conversion",
  cluster: "shapes",
  base: { s: 1 },
  variants: [{ s: 2 }, { s: 3 }],
  official: [q(144)],
  solve: ({ s }) => {
    let cubes = 0;
    for (let x = 0; x + s <= 12; x += s) for (let y = 0; y + s <= 12; y += s) for (let z = 0; z + s <= 12; z += s) cubes++;
    return [q(cubes * s, 12)];
  },
  build: ({ s }) => {
    const per = 12 / s, cubes = per ** 3, inches = cubes * s, feet = inches / 12;
    return {
      diagram: Fig.cubes(s),
      prompt: `A solid cube **1 foot** on each side is cut completely into small cubes **${s} inch${s === 1 ? "" : "es"}** on each side. All the small cubes are stacked one on top of another.\n\nHow many **feet** tall is the stack?`,
      answer: { fields: [{ kind: "number", value: q(feet), unit: "feet" }] },
      answerText: `${feet} feet`,
      hints: [
        `1 foot is 12 inches. How many ${s}-inch cubes fit along one edge?`,
        "Count the cubes: along the front, from front to back, and up.",
        `Stack them: each cube adds ${s} inch${s === 1 ? "" : "es"}. Then change inches into feet.`,
      ],
      solution: [`${per} cubes fit along each edge, so there are ${per} × ${per} × ${per} = ${cubes} cubes.`, `Stacked: ${cubes} × ${s} = ${inches} inches.`, `${inches} ÷ 12 = **${feet} feet**.`],
    };
  },
};

// #5 stepped figure perimeter
type NotchP = { W: number; H: number; D: number; y0: number; g: number };
const notchCells = ({ W, H, D, y0, g }: NotchP): Pair[] => rect(0, 0, W, H).filter(([x, y]) => !(x >= W - D && y >= y0 && y < y0 + g));
const p73_5: Exercise<NotchP> = {
  id: "cml-p7-3-5",
  title: "The notched plot",
  source: { kind: "CML", ref: "P 7-3 #5", key: "official" },
  domain: "G",
  skill: "Area & perimeter",
  cluster: "shapes",
  base: { W: 12, H: 12, D: 7, y0: 4, g: 4 },
  variants: [{ W: 10, H: 8, D: 4, y0: 3, g: 2 }, { W: 14, H: 10, D: 6, y0: 2, g: 5 }],
  official: [q(62)],
  solve: (p) => {
    const cells = notchCells(p);
    const set = new Set(cells.map((c) => c.join()));
    let edges = 0;
    for (const [x, y] of cells) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(`${x + dx},${y + dy}`)) edges++;
    return [q(edges)];
  },
  build: (p) => {
    const per = 2 * p.W + 2 * p.H + 2 * p.D;
    return {
      diagram: Fig.notched(p.W, p.H, p.D, p.y0, p.g),
      prompt: `Find the perimeter of the figure.`,
      answer: { fields: [{ kind: "number", value: q(per), unit: "units" }] },
      answerText: `${per} units`,
      hints: [
        "You don't need every little side. Slide the short sides of the notch out to the edge in your head.",
        `All the up-and-down pieces on the right side still add up to the full height, ${p.H}.`,
        `The two sides of the notch that go across are extra: each one is ${p.D}.`,
      ],
      solution: [
        `Across: top ${p.W} + bottom ${p.W} = ${2 * p.W}.`,
        `Up and down: the left side is ${p.H}, and the right-side pieces add up to ${p.H} too: ${2 * p.H}.`,
        `The notch adds two sides of ${p.D}: ${2 * p.D}.`,
        `${2 * p.W} + ${2 * p.H} + ${2 * p.D} = **${per} units**.`,
      ],
    };
  },
};

// #6 cryptarithm
type CryptP = { k: number; pattern: string };
function cryptSolutions(k: number, pattern: string) {
  const hits: number[] = [];
  for (let v = 1000; v <= 9999; v++) {
    const prod = v * k;
    if (prod > 9999) continue;
    const map = new Map<string, number>();
    const digits = String(v).split("").map(Number);
    "ABCD".split("").forEach((L, i) => map.set(L, digits[i]));
    const out = String(prod).split("").map(Number);
    let ok = new Set(digits).size === 4;
    pattern.split("").forEach((L, i) => {
      if (map.has(L)) { if (map.get(L) !== out[i]) ok = false; } else map.set(L, out[i]);
    });
    const letters = new Set("ABCD" + pattern);
    if (ok && new Set([...letters].map((L) => map.get(L))).size === letters.size) hits.push(v);
  }
  return hits;
}
const p73_6: Exercise<CryptP> = {
  id: "cml-p7-3-6",
  title: "Letters for digits",
  source: { kind: "CML", ref: "P 7-3 #6", key: "official" },
  domain: "NO",
  skill: "Logic & place value",
  cluster: "logic",
  base: { k: 4, pattern: "EBEA" },
  variants: [{ k: 4, pattern: "DCBA" }, { k: 9, pattern: "DCBA" }],
  official: [q(2348)],
  solve: ({ k, pattern }) => {
    // independent search over letter assignments (digit by digit), not over 4-digit numbers
    const hits: number[] = [];
    for (let A = 1; A <= 9; A++) for (let B = 0; B <= 9; B++) for (let C = 0; C <= 9; C++) for (let D = 0; D <= 9; D++) {
      if (new Set([A, B, C, D]).size < 4) continue;
      const prod = (1000 * A + 100 * B + 10 * C + D) * k;
      const s = String(prod);
      if (s.length !== 4) continue;
      const env: Record<string, number> = { A, B, C, D };
      let ok = true;
      for (let i = 0; i < 4; i++) {
        const L = pattern[i];
        if (env[L] === undefined) {
          if (Object.values(env).includes(Number(s[i]))) { ok = false; break; }
          env[L] = Number(s[i]);
        } else if (env[L] !== Number(s[i])) { ok = false; break; }
      }
      if (ok) hits.push(1000 * A + 100 * B + 10 * C + D);
    }
    return [q(unique(hits, "cryptarithm"))];
  },
  build: ({ k, pattern }) => {
    const v = unique(cryptSolutions(k, pattern), "cryptarithm");
    const prod = v * k;
    // candidate grid: column = letter A, B, C, D; row = digit (0 at the front). A mark = that digit is still possible.
    return {
      diagram: Fig.letterMultiplication(k, pattern),
      prompt: `In this multiplication, each letter stands for a different digit, and the same letter is always the same digit:\n\n**ABCD × ${k} = ${pattern}**\n\nWhat number is **ABCD**?`,
      answer: { fields: [{ kind: "number", value: q(v) }] },
      answerText: String(v),
      hints: [
        `ABCD × ${k} still has only four digits. What does that tell you about how big A can be?`,
        `Look at the last digit of the answer: it comes from D × ${k}. Which digits D make that work?`,
        "Fill in one letter at a time from the outside in, and check each guess with the carries.",
      ],
      solution: [
        `A must be small, or ABCD × ${k} would have five digits.`,
        `The ones digit of D × ${k} must match the last letter of ${pattern}; that leaves only a few choices for D, and only one survives the middle digits.`,
        `The only number that works: **${v}** × ${k} = ${prod}.`,
      ],
    };
  },
};

// ================================================================== E 7-1
// #1 palindrome
type PalP = { S: number };
const palCandidates = (S: number) => {
  const out: { v: number; prod: number }[] = [];
  for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) if (2 * a + b === S) out.push({ v: 101 * a + 10 * b, prod: a * a * b });
  return out;
};
const e71_1: Exercise<PalP> = {
  id: "cml-e7-1-1",
  title: "The best palindrome",
  source: { kind: "CML", ref: "E 7-1 #1", key: "official" },
  domain: "NO",
  skill: "Logic & place value",
  cluster: "logic",
  base: { S: 7 },
  variants: [{ S: 9 }, { S: 11 }],
  official: [q(232)],
  solve: ({ S }) => {
    let best = -1;
    const winners: number[] = [];
    for (let v = 100; v <= 999; v++) {
      const s = String(v);
      if (s[0] !== s[2]) continue;
      const d = s.split("").map(Number);
      if (d[0] + d[1] + d[2] !== S) continue;
      const p = d[0] * d[1] * d[2];
      if (p > best) { best = p; winners.length = 0; winners.push(v); } else if (p === best) winners.push(v);
    }
    return [q(unique(winners, "palindrome"))];
  },
  build: ({ S }) => {
    const cands = palCandidates(S);
    const best = cands.reduce((m, c) => (c.prod > m.prod ? c : m));
    const digits = (v: number) => String(v).split("").map(Number);
    return {
      prompt: `A **palindrome** reads the same forwards and backwards, like 797, 8668 and 444.\n\nWhich **3-digit palindrome** has digits that **add up to ${S}** and whose digits **multiply to the biggest possible number**?`,
      answer: { fields: [{ kind: "number", value: q(best.v) }] },
      answerText: String(best.v),
      hints: [
        "A 3-digit palindrome looks like aba: the first and last digits are the same.",
        `So a + b + a = ${S}. List every pair of digits that fits.`,
        "For each one, multiply a × b × a and keep the biggest.",
      ],
      solution: [
        `Palindromes aba with 2a + b = ${S}: ${cands.map((c) => c.v).join(", ")}.`,
        `Their digit products: ${cands.map((c) => `${digits(c.v).join("×")} = ${c.prod}`).join("; ")}.`,
        `The biggest product belongs to **${best.v}**.`,
      ],
    };
  },
};

// #2 solve for k with fractions
type KP = { a: Pair; b: Pair; c: Pair };
const e71_2: Exercise<KP> = {
  id: "cml-e7-1-2",
  title: "Find k",
  source: { kind: "CML", ref: "E 7-1 #2", key: "official" },
  domain: "NO",
  skill: "Dividing fractions",
  cluster: "fracdiv",
  base: { a: [5, 9], b: [1, 6], c: [2, 3] },
  variants: [{ a: [3, 4], b: [1, 2], c: [3, 5] }, { a: [2, 7], b: [4, 5], c: [1, 2] }],
  official: [q(1, 5)],
  solve: ({ a, b, c }) => {
    // search fractions with small denominators
    const target = mul(F(b), F(c));
    const hits: Frac[] = [];
    for (let den = 1; den <= 60; den++) for (let nu = 1; nu <= 200; nu++) {
      const k = q(nu, den);
      if (k.d !== BigInt(den)) continue; // count each value once
      if (eq(mul(k, F(a)), target)) hits.push(k);
    }
    return [unique(hits, "k")];
  },
  build: ({ a, b, c }) => {
    const right = mul(F(b), F(c)), k = div(right, F(a));
    return {
      prompt: `If **k · [[${a[0]}/${a[1]}]] = [[${b[0]}/${b[1]}]] · [[${c[0]}/${c[1]}]]**, what is **k**? Give it in simplest form.`,
      answer: { fields: [{ kind: "number", value: k, simplest: true }] },
      answerText: n(k),
      hints: [
        "Work out the right side first: multiply the two fractions.",
        `Now k times ${a[0]}/${a[1]} equals that. To undo “times ${a[0]}/${a[1]}”, divide by it.`,
        "Dividing by a fraction is the same as multiplying by its flip.",
      ],
      solution: [
        `${b[0]}/${b[1]} · ${c[0]}/${c[1]} = ${n(right)}.`,
        `k = ${n(right)} ÷ ${a[0]}/${a[1]} = ${n(right)} × ${a[1]}/${a[0]}.`,
        `k = **${n(k)}**.`,
      ],
    };
  },
};

// #3 long jumps
type JumpP = { T: number; D: number }; // inches, may be quarters
const ftin = (inches: Frac) => {
  const ft = Math.floor(num(inches) / 12);
  return `${ft} ft ${n(sub(inches, q(ft * 12)))} in`;
};
const e71_3: Exercise<JumpP> = {
  id: "cml-e7-1-3",
  title: "Two long jumps",
  source: { kind: "CML", ref: "E 7-1 #3", key: "official" },
  domain: "MD",
  skill: "Measurement: feet & inches",
  cluster: "equations",
  base: { T: 474.75, D: 57.75 },
  variants: [{ T: 364.5, D: 37.5 }, { T: 310, D: 30 }],
  official: [q("266.25")],
  solve: ({ T, D }) => {
    // try every quarter-inch length for the shorter jump
    for (let s = 0; s <= T * 4; s++) {
      const short = q(s, 4);
      if (eq(add(short, add(short, q(D))), q(T))) return [add(short, q(D))];
    }
    throw new Error("no split");
  },
  build: ({ T, D }) => {
    const tot = q(T), dif = q(D), long = div(add(tot, dif), q(2)), short = sub(long, dif);
    return {
      prompt: `Ishmael's long jump was **${ftin(dif)}** farther than Juwan's. Together they jumped **${ftin(tot)}**.\n\nHow long was Ishmael's jump? Give feet and inches (fewer than 12 inches).`,
      answer: { fields: [{ kind: "ftin", inches: long }] },
      answerText: ftin(long),
      hints: [
        "If Juwan had jumped as far as Ishmael, the total would be bigger by the difference.",
        "Add the difference to the total. That's two of Ishmael's jumps.",
        "Halve it, and turn any 12 inches into a foot.",
      ],
      solution: [
        `Total + difference = ${ftin(tot)} + ${ftin(dif)} = ${ftin(add(tot, dif))}, two of Ishmael's jumps.`,
        `Half of that: **${ftin(long)}**.`,
        `(Juwan jumped ${ftin(short)}.)`,
      ],
    };
  },
};

// #4 triangle areas
type TriP = { f2: Pair; rsq: number; ruq: number };
const e71_4: Exercise<TriP> = {
  id: "cml-e7-1-4",
  title: "Triangles inside a triangle",
  source: { kind: "CML", ref: "E 7-1 #4", key: "official" },
  domain: "G",
  skill: "Area of triangles",
  cluster: "shapes",
  base: { f2: [1, 3], rsq: 9, ruq: 3 },
  variants: [{ f2: [1, 4], rsq: 8, ruq: 2 }, { f2: [1, 3], rsq: 12, ruq: 6 }],
  official: [q(15)],
  solve: ({ f2, rsq, ruq }) => {
    // find the big triangle's area by trying whole numbers
    for (let rst = 1; rst <= 1000; rst++) if (eq(mul(q(rst), F(f2)), q(rsq + ruq))) return [sub(q(rst, 2), q(ruq))];
    throw new Error("no area");
  },
  build: ({ f2, rsq, ruq }) => {
    const rus = rsq + ruq, rst = rus * (f2[1] / f2[0]), rpt = rst / 2, ans = rpt - ruq;
    const frac = `[[${f2[0]}/${f2[1]}]]`;
    return {
      diagram: Fig.triangle(f2, rsq, ruq),
      prompt: `In triangle **RST**, point **P** is on ST, **U** is on RT, and segments RP and SU cross at **Q**.\n\n• Triangle SRP is **[[1/2]]** of triangle RST.\n• Triangle RUS is **${frac}** of triangle RST.\n• Triangle RSQ has area **${rsq}**, and triangle RUQ has area **${ruq}**.\n\nWhat is the area of the four-sided shape **PQUT**?`,
      answer: { fields: [{ kind: "number", value: q(ans), unit: "sq units" }] },
      answerText: `${ans} square units`,
      hints: [
        "Triangle RUS is made of two smaller triangles you already know.",
        `RUS is ${f2[0]}/${f2[1]} of the big triangle, so you can find the area of RST.`,
        "SRP is half of RST, so the other half is RPT. PQUT is RPT with triangle RUQ taken away.",
      ],
      solution: [
        `RUS = RSQ + RUQ = ${rsq} + ${ruq} = ${rus}.`,
        `That's ${f2[0]}/${f2[1]} of RST, so RST = ${rst}.`,
        `SRP is half, so the other half, RPT, is ${rpt}.`,
        `PQUT = RPT − RUQ = ${rpt} − ${ruq} = **${ans}**.`,
      ],
    };
  },
};

// #5 test score
type TestP = { P: number; n1: number; p1: number; w: number };
const e71_5: Exercise<TestP> = {
  id: "cml-e7-1-5",
  title: "Sara's history test",
  source: { kind: "CML", ref: "E 7-1 #5", key: "official" },
  domain: "AAT",
  skill: "Percent problems",
  cluster: "logic",
  base: { P: 75, n1: 25, p1: 80, w: 7 },
  variants: [{ P: 80, n1: 20, p1: 90, w: 4 }, { P: 90, n1: 40, p1: 95, w: 3 }],
  official: [q(16)],
  solve: ({ P, n1, p1, w }) => {
    for (let total = n1 + 1; total <= 500; total++) {
      for (let rc = 0; rc <= total - n1; rc++) {
        const wrong1 = n1 - (n1 * p1) / 100;
        if (rc + w !== total - n1) continue;
        if ((n1 * p1) / 100 + rc === (total * P) / 100 && Number.isInteger(wrong1)) return [q(rc)];
      }
    }
    throw new Error("no total");
  },
  build: ({ P, n1, p1, w }) => {
    const right1 = (n1 * p1) / 100, wrong1 = n1 - right1, wrongAll = wrong1 + w;
    const total = (wrongAll * 100) / (100 - P), rest = total - n1, rc = rest - w;
    return {
      prompt: `Sara's history test score was exactly **${P}%**. On the **first ${n1} questions** she got **${p1}%** right. On the rest of the test she got **${w} wrong**.\n\nHow many did she get **right** on the rest of the test?`,
      answer: { fields: [{ kind: "number", value: q(rc), unit: "questions" }] },
      answerText: `${rc} right`,
      hints: [
        `How many of the first ${n1} did she get wrong?`,
        `Add the ${w} wrong ones from the rest. All her wrong answers together are ${100 - P}% of the whole test.`,
        "From that, find how many questions the test had, then how many were in “the rest”.",
      ],
      solution: [
        `First part: ${p1}% of ${n1} is ${right1} right, so ${wrong1} wrong.`,
        `Wrong in all: ${wrong1} + ${w} = ${wrongAll}, which is ${100 - P}% of the test, so the test had ${total} questions.`,
        `The rest: ${total} − ${n1} = ${rest} questions, ${w} wrong, so **${rc} right**.`,
      ],
    };
  },
};

// #6 grid routes
type GridP = { w: number; h: number };
const e71_6: Exercise<GridP> = {
  id: "cml-e7-1-6",
  title: "Up and right",
  source: { kind: "CML", ref: "E 7-1 #6", key: "official" },
  domain: "NO",
  skill: "Logic & counting",
  cluster: "logic",
  base: { w: 3, h: 2 },
  variants: [{ w: 3, h: 3 }, { w: 4, h: 2 }],
  official: [q(10)],
  solve: ({ w, h }) => {
    // enumerate every route as a string of R/U moves
    let count = 0;
    const walk = (x: number, y: number) => {
      if (x === w && y === h) { count++; return; }
      if (x < w) walk(x + 1, y);
      if (y < h) walk(x, y + 1);
    };
    walk(0, 0);
    return [q(count)];
  },
  build: ({ w, h }) => {
    const ways: number[][] = Array.from({ length: h + 1 }, () => Array(w + 1).fill(0));
    for (let y = 0; y <= h; y++) for (let x = 0; x <= w; x++) ways[y][x] = x === 0 || y === 0 ? 1 : ways[y][x - 1] + ways[y - 1][x];
    const total = ways[h][w];
    return {
      diagram: Fig.routes(w, h),
      prompt: `A grid is **${w} squares wide** and **${h} squares tall**. You start at the bottom-left corner **A** and want to reach the top-right corner **B**, moving only **right** or **up** along the lines.\n\nHow many different routes are there?`,
      answer: { fields: [{ kind: "number", value: q(total), unit: "routes" }] },
      answerText: `${total} routes`,
      hints: [
        "Write a number at every corner: how many routes reach that corner?",
        "Corners along the bottom edge and the left edge can only be reached one way.",
        "Any other corner can be reached from the corner to its left or the corner below it. Add those two numbers.",
      ],
      solution: [
        "Every corner on the bottom row and left column gets a 1.",
        "Each other corner gets the sum of the corner to its left and the corner below.",
        ...ways.slice(1).map((row, i) => `Row ${i + 1}: ${row.join(", ")}.`),
        `The top-right corner gets **${total}**.`,
      ],
    };
  },
};

export const CML: Exercise[] = [p51_1, p51_2, p51_3, p51_6, p63_1, p63_2, p63_3, p63_4, p63_5, p63_6, e64_1, e64_2, e64_3, e64_4, e64_5, e64_6, p73_1, p73_3, p73_4, p73_5, p73_6, e71_1, e71_2, e71_3, e71_4, e71_5, e71_6];
