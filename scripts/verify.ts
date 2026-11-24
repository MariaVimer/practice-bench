// Verifies every exercise (or just the ones in a file given as an argument):
//   npx tsx scripts/verify.ts                       → all of content/index.ts
//   npx tsx scripts/verify.ts content/exercises/x.ts → only that file's export
// For the base and both variants of each exercise it checks:
//   1. the built answer equals an independent re-computation (solve)
//   2. the base equals the official / printed key when one exists
//   3. variants use different numbers from the base and from each other
//   4. the checker accepts equivalent forms of the right answer and rejects wrong ones
//   5. no hint contains the answer
//   6. problems whose original shows a figure or table have a diagram, and it's well-formed
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import type { Exercise } from "../lib/types";
import { check, type Field } from "../lib/check";
import { type Frac, add, cmp, div, eq, frac, mul, q, show, sub } from "../lib/frac";

async function load(): Promise<Exercise[]> {
  const file = process.argv[2];
  if (!file) return (await import("../content")).EXERCISES;
  const mod = await import(pathToFileURL(resolve(file)).href);
  const list = Object.values(mod).find((v) => Array.isArray(v)) as Exercise[] | undefined;
  if (!list) throw new Error(`${file} exports no array of exercises`);
  return list;
}

/** problems whose original question shows a figure or table (checked against the source pages) */
const NEEDS_DIAGRAM = new Set([
  "cml-p5-1-6", "cml-p6-3-3", "cml-e6-4-1", "cml-e6-4-2", "cml-e6-4-4", "cml-p7-3-4", "cml-p7-3-5", "cml-p7-3-6", "cml-e7-1-4", "cml-e7-1-6",
  "ir-5-2", "ir-5-4", "ir-5-6", "ir-5-7", "ir-7-1", "ir-7-3", "ir-10-1", "ir-10-2", "ir-12-1", "ir-12-4", "ir-14-1",
  "ir-15-1", "ir-15-2", "ir-15-3", "ir-15-4", "ir-15-5", "ir-15-6", "ir-15-7", "ir-15-8", "ir-15-9",
  "ir-17-1", "ir-17-2", "ir-17-3", "ir-17-4", "ir-17-5", "ir-17-6", "ir-21-5", "ir-21-6", "ir-21-7", "ir-21-8",
]);

let failures = 0;
let checks = 0;
const fail = (msg: string) => {
  failures++;
  console.log("  ✗ " + msg);
};
const ok = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) fail(msg);
};

/** Equivalent ways a kid might type the same value. */
function forms(v: Frac): string[] {
  const out = new Set<string>();
  const N = v.n, D = v.d;
  out.add(show(v));
  if (D !== 1n) {
    out.add(`${N * 2n}/${D * 2n}`);
    out.add(`${N * 3n}/${D * 3n}`);
    const absN = N < 0n ? -N : N;
    if (absN > D) out.add(show(v, { mixed: true }));
    let d = D;
    while (d % 2n === 0n) d /= 2n;
    while (d % 5n === 0n) d /= 5n;
    if (d === 1n) out.add(String(Number(N) / Number(D)));
  } else {
    out.add(`${N}.0`);
    out.add(`${N * 4n}/4`);
    if (N >= 1000n || N <= -1000n) out.add(Number(N).toLocaleString("en-US"));
  }
  out.add(` ${show(v)} `);
  return [...out];
}
const wrongs = (v: Frac) => [show(add(v, frac(1))), show(sub(v, frac(1, 2))), show(mul(v, frac(2))), "", "banana"];
const numberFields = (fs: Field[]) => fs.filter((f): f is Extract<Field, { kind: "number" }> => f.kind === "number");

/** A right answer typed the plain way, per field. */
function rightInput(f: Field): string {
  switch (f.kind) {
    case "number": return show(f.value);
    case "choice": return String(f.correct);
    case "expr": return f.value;
    case "ineq": return `${f.variable} ${f.op} ${show(f.value)}`;
    case "point": return `(${show(f.x)}, ${show(f.y)})`;
    case "ftin": { const ft = f.inches.n / f.inches.d / 12n; return `${ft}|${show(sub(f.inches, q(Number(ft) * 12)))}`; }
  }
}

const main = async () => {
  const EXERCISES = await load();
  const ids = new Set<string>();
  for (const ex of EXERCISES) {
    console.log(`${ex.id}  ${ex.title}`);
    ok(!ids.has(ex.id), `duplicate id ${ex.id}`);
    ids.add(ex.id);
    const params = [ex.base, ...ex.variants];
    const keys = params.map((p) => JSON.stringify(p));
    ok(new Set(keys).size === 3, "the base and both variants must all use different numbers");
    params.forEach((p, idx) => {
      const tag = idx === 0 ? "base" : `variant ${idx}`;
      let b;
      try {
        b = ex.build(p);
      } catch (err) {
        fail(`${tag}: build threw ${(err as Error).message}`);
        return;
      }
      ok(b.hints.length === 3 && b.hints.every((h) => h.trim().length > 10), `${tag}: needs three real hints`);
      ok(b.solution.length >= 2, `${tag}: worked solution needs at least two steps`);
      ok(/\S/.test(b.prompt), `${tag}: empty prompt`);
      if (b.reflection) {
        ok(b.answer.fields.length === 0, `${tag}: a reflection card has no answer fields`);
        return;
      }
      ok(b.answer.fields.length > 0, `${tag}: no answer fields`);
      const fields = b.answer.fields;
      const nums = numberFields(fields).map((f) => f.value);
      const sorted = (xs: Frac[]) => [...xs].sort(cmp);
      // 1. independent solve. solve() returns, in order: every number field's value, then (for each
      //    non-number field) a value the solver derives: choice → index, ineq → bound, point → x then y, ftin → total inches.
      const solved = ex.solve(p);
      const expected: Frac[] = [];
      for (const f of fields) {
        if (f.kind === "number") expected.push(f.value);
        if (f.kind === "choice") expected.push(q(f.correct));
        if (f.kind === "ineq") expected.push(f.value);
        if (f.kind === "point") expected.push(f.x, f.y);
        if (f.kind === "ftin") expected.push(f.inches);
      }
      const cmpList = b.answer.anyOrder ? [sorted(expected), sorted(solved)] : [expected, solved];
      ok(cmpList[0].length === cmpList[1].length && cmpList[0].every((v, i) => eq(v, cmpList[1][i])), `${tag}: answer [${expected.map((v) => show(v))}] != independent solve [${solved.map((v) => show(v))}]`);
      if (idx === 0 && ex.official) ok(ex.official.length === expected.length && sorted(ex.official).every((v, i) => eq(v, sorted(expected)[i])), `base answer [${expected.map((v) => show(v))}] != official key [${ex.official.map((v) => show(v))}]`);
      // 4. checker: the plain right answer passes
      const right = fields.map(rightInput);
      ok(check(b.answer, right).ok, `${tag}: checker rejected the plain right answer ${JSON.stringify(right)}`);
      if (b.answer.anyOrder && right.length > 1) ok(check(b.answer, [...right].reverse()).ok, `${tag}: checker rejected parts in reverse order`);
      // equivalent number forms
      fields.forEach((f, i) => {
        if (f.kind !== "number") return;
        for (const form of forms(f.value)) {
          const input = [...right];
          input[i] = form;
          ok(check(b.answer, input).ok, `${tag}: checker rejected equivalent input "${form}" for field ${i + 1}`);
        }
        if (f.unit) {
          const input = [...right];
          input[i] = `${show(f.value)} ${f.unit}`;
          ok(check(b.answer, input).ok, `${tag}: checker rejected the answer followed by "${f.unit}"`);
        }
        for (const w of wrongs(f.value)) {
          if (f.within && w !== "" && w !== "banana") continue;
          const input = [...right];
          input[i] = w;
          ok(!check(b.answer, input).ok, `${tag}: checker ACCEPTED wrong input "${w}" for field ${i + 1}`);
        }
      });
      fields.forEach((f, i) => {
        if (f.kind === "choice") {
          ok(f.options.length >= 2 && f.correct >= 0 && f.correct < f.options.length, `${tag}: choice field ${i + 1} is malformed`);
          ok(new Set(f.options).size === f.options.length, `${tag}: choice field ${i + 1} repeats an option`);
          for (let o = 0; o < f.options.length; o++) if (o !== f.correct) {
            const input = [...right];
            input[i] = String(o);
            ok(!check(b.answer, input).ok, `${tag}: checker ACCEPTED wrong choice ${o} for field ${i + 1}`);
          }
        }
        if (f.kind === "expr") {
          const input = [...right];
          input[i] = `${f.value} + 1`;
          ok(!check(b.answer, input).ok, `${tag}: checker ACCEPTED a wrong expression for field ${i + 1}`);
        }
        if (f.kind === "ineq") {
          const flipped = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" }[f.op];
          const input = [...right];
          input[i] = `${f.variable} ${flipped} ${show(f.value)}`;
          ok(!check(b.answer, input).ok, `${tag}: checker ACCEPTED the flipped inequality for field ${i + 1}`);
          const swapped = [...right];
          swapped[i] = `${show(f.value)} ${flipped} ${f.variable}`;
          ok(check(b.answer, swapped).ok, `${tag}: checker rejected the same inequality written the other way round`);
        }
      });
      if (b.answer.anyOrder && nums.length === 2) ok(!check(b.answer, [show(nums[0]), show(nums[0])]).ok, `${tag}: same value twice accepted`);
      // 5. hints never state the answer
      const promptText = (b.prompt + " " + fields.map((f) => f.label ?? "").join(" ")).replace(/\[\[(-?\d+)\/(\d+)\]\]/g, "$1/$2");
      for (const h of b.hints) for (const v of nums) {
        if (v.d === 1n && v.n >= -1n && v.n <= 2n) continue; // tiny integers appear naturally in wording
        if (v.d !== 1n && promptText.includes(show(v))) continue; // the question itself states it (e.g. "how many 1/5s"), so a hint repeating it gives nothing away
        const s = show(v, { mixed: true });
        const re = new RegExp(`(^|[^\\d./])${s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?![\\d./])`);
        ok(!re.test(h.replace(/\*/g, "")), `${tag}: a hint contains the answer ${s}: "${h}"`);
      }
      // 6. diagram: required where the original question shows a figure or table, and well-formed
      if (NEEDS_DIAGRAM.has(ex.id)) ok(!!b.diagram, `${tag}: the original shows a figure or table, but there is no diagram`);
      if (b.diagram) {
        const dg = b.diagram;
        if (dg.kind === "table") ok(dg.rows.length > 0 && dg.rows.every((r) => r.length === dg.headers.length), `${tag}: table rows don't match its headers`);
        else {
          const bad = dg.items.filter((it) => Object.values(it).some((v) => typeof v === "number" && !Number.isFinite(v)));
          ok(bad.length === 0, `${tag}: diagram has non-numeric coordinates`);
          const out = dg.items.filter((it) => "x" in it && typeof (it as any).x === "number" && ((it as any).x < -1 || (it as any).x > dg.width + 1));
          ok(out.length === 0, `${tag}: diagram draws outside its width`);
        }
      }
    });
  }
  // progress links: every record key must hash uniquely, and a store must survive the round trip
  {
    const { fnv24, encode, decode } = await import("../lib/progress-link");
    const keys = EXERCISES.flatMap((e) => [e.id, `${e.id}~1`, `${e.id}~2`]);
    const hashes = new Map<number, string>();
    for (const key of keys) {
      const h = fnv24(key);
      ok(!hashes.has(h), `progress link: ${key} and ${hashes.get(h)} share a hash`);
      hashes.set(h, key);
    }
    const sample: any = {};
    keys.forEach((key, i) => { if (i % 3 === 0) sample[key] = { attempts: 1 + (i % 31), hints: i % 4, firstTry: i % 3 === 0 ? null : i % 2 === 0, solved: i % 5 === 0, sawSolution: i % 7 === 0, updated: 0 }; });
    const back = decode(encode(sample), keys)!;
    const same = Object.keys(sample).every((k) => back[k] && ["attempts", "hints", "firstTry", "solved", "sawSolution"].every((f) => (back[k] as any)[f] === sample[k][f]));
    ok(same && Object.keys(back).length === Object.keys(sample).length, "progress link: round trip changed the saved progress");
    ok(decode("garbage", keys) === null && decode("1.abc", keys) === null, "progress link: a broken link should be rejected");
  }
  console.log(`\n${EXERCISES.length} exercises × 3 versions, ${checks} checks, ${failures} failure(s)`);
  if (failures) process.exitCode = 1;
};
main();
