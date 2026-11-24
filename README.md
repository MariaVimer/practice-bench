# 6th-grade math practice

A free practice site for 6th-grade math: 200 questions from the CML sample papers and the i-Ready Grade 6 At-Home packet, with diagrams, three hints each, and a worked solution.

**Live:** https://practice-bench.vercel.app

<!-- screenshot --><img width="1504" height="798" alt="Screenshot 2026-11-24 at 11 25 32 AM" src="https://github.com/user-attachments/assets/d33bfca8-93fe-4cc5-b9aa-06662a2ec398" />


- **Type the answer.** Fractions, mixed numbers, decimals, ratios and units are all accepted.
- **Hints and the solution.** Three hints, each giving a little more away, then a worked solution.
- **Two more tries with new numbers.** Every question has two variants, checked by an independent solver.
- **Progress** is saved in the browser, and a save link carries it to another device.
- **Printable worksheets**, with a preview before printing.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run verify   # checks every answer, hint and diagram
```

Built with Next.js, React and TypeScript. Answers are checked with exact fraction arithmetic.

## Credits

The questions belong to their publishers: [Continental Mathematics League](https://www.cmleague.com/product-category/books/) and [Curriculum Associates (i-Ready)](https://www.curriculumassociates.com/programs/i-ready-assessment). They are used here as practice, with links back to the full materials. The source PDFs are not included in this repo.

Made by [Maria Vimer](https://www.linkedin.com/in/mariavimer/).
