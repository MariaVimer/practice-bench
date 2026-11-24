import { SectionHead } from "./Shell";

const QA: [string, React.ReactNode][] = [
  ["Who is this for?", "Sixth graders practising contest-style math, and the grown-ups helping them. It works on a phone, a tablet or a laptop."],
  [
    "Where do the problems come from?",
    <>
      They're adapted from the{" "}
      <a href="https://www.cmleague.com/product-category/books/" target="_blank" rel="noopener">Continental Mathematics League</a> sample papers and the i-Ready Grade 6 At-Home Activity Packet from{" "}
      <a href="https://www.curriculumassociates.com/programs/i-ready-assessment" target="_blank" rel="noopener">Curriculum Associates</a>, reworded. The full contests and books are available from their publishers.
    </>,
  ],
  ["Are the answers right?", "Every answer is checked in code with exact fractions. Contest answers match the official solutions. The packet has no answer key, so those answers are computed and checked the same way."],
  ["Do I have to type the answer a certain way?", "No. 3/4, 6/8 and 0.75 all count, and so do mixed numbers like 2 1/2, commas, dollar signs and units. When a problem has two answers, either order is fine."],
  ["Is my progress saved?", "Only in this browser, on this device. There are no accounts, and nothing is sent anywhere. Clearing your browser data starts fresh."],
  ["Do the scores predict test results?", "No. They're practice scores for these problems only. They don't predict school placement or exam results."],
  ["Is it free?", "Yes. No ads and no sign-up."],
];

export function Faq({ n }: { n: number }) {
  return (
    <section id="questions" className="section">
      <SectionHead n={n} title="Questions" />
      <div className="faq">
        {QA.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
