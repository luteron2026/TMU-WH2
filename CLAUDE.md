# TMU-WH2: World History 2 practice site

A study site for a World History 2 course: one page (`index.html`) that plays the practice sets in `questions.js`. It is the sister of the World History 1 site (`luteron2026/TMU-WH1`), with the same page, tools, professor and question formats. Published with GitHub Pages from `main` at https://luteron2026.github.io/TMU-WH2/.

`README.md` explains the files, the question keys and how to publish. This file is about **building questions from the highlights**.

## The one rule

Every fact, phrase, name, number and date in a question or an answer choice must come from **highlighted** text in the note packet (`guide/highlights.md`), or from a highlighted timeline entry (`guide/timeline.md`) for dates. Never add outside knowledge, definitions, dates, place names or "helpful" detail, even when it is true. The professor has flagged questions for exactly this.

On the page itself, never call the material "yellow" or "highlighted" in new text; say "study guide".

## When highlights arrive

1. **Ask first** (one short message) unless `guide/course.md` already answers it: which pages each quiz and exam covers, whether an exam is cumulative, the period the course covers (timeline dates outside it are dropped), and whether every timeline entry is highlighted.
2. **Get the highlights into `guide/`.** For a PDF, run `python3 tools/extract_highlights.py <file>`; check a few pages against the PDF by eye (rasterize the page and look at it). For scans or photos, read the highlighted lines off the pictures. Append to `guide/highlights.md` under `## Page N` headings and to `guide/timeline.md`. Do not commit the packet itself. Say how many pages and fragments were found and what was uncertain (faint highlights, tables).
3. **Fill in the sections.** In `questions.js`, give each section in `SECTIONS` its real page range and note (replace "coming soon"). A set's `"sec"` must equal its section's `"key"` exactly, so change both together.
4. **Write the sets** (formats below), each question with `"src"`: the highlighted lines it was built from.
5. **Check**: `node tools/check.js --fix`, then `node tools/highlights.js` and go through everything it lists, then read every new question once as a person would.
6. **Publish**: `node tools/check.js --release`, commit, and open a pull request into `main`.
7. **Report** in a few lines: sets built, questions per format, what was dropped (out-of-period dates, anything not highlighted), the check results, and anything to verify.

## The sets to build

- Quiz sets and Exam sets cover their own page ranges. A standard set is about 25 to 35 questions; vary the order of formats from set to set.
- Also build "mirror the real quiz" sets of exactly 10 questions: 3 True / False, 2 "Which is FALSE", 3 or 4 "not correctly related", 1 fill-in, no matching.
- Keep one set per quiz or exam that is timeline dates only, and put one fill-in into each mixed set.
- Spread the coverage so every highlighted fragment is used in at least one question.

## Question formats

Each question is one line in a set's `"qs"`. `"s"` is the small label above the question, `"why"` is the note shown after answering, `"k"` is added by `--fix` (never write or change it by hand).

**True / False** (`"t":"tf"`). One or two facts, never more (`tools/check.js` refuses three). Two clauses are joined with "; moreover," / "; in addition," / ", while" / ", and" / "because". Every clause must be true for the answer to be True. Make a false one by changing exactly one clause. About 1 in 4 is a single statement.

```
{"t":"tf","s":"True / False","q":"Hittites were from Mesopotamia; in addition, Phoenicians were the Mediterranean’s greatest traders, navigators, shipbuilders, & colonizers.","a":false,"why":"Clause 1: False. The study guide says: Hittites were from Asia Minor. Clause 2: True (Phoenicians were the Mediterranean’s greatest traders, navigators, shipbuilders, & colonizers.) One false clause makes the whole statement False.","src":["Hittites were from Asia Minor","Phoenicians were the Mediterranean’s greatest traders, navigators, shipbuilders, & colonizers"]}
```

**Which of the following statements is FALSE?** (`"t":"mc"`). Four statements, then a fifth choice "All of the statements above are TRUE", which is the answer when none is false. Keep numbers as the study guide writes them, such as "four (4)".

**Which of the following is NOT correctly related?** (`"t":"mc"`). Four pairs written `left -- right`, then "All of the above are correctly related". Each pair is judged on its own, from one highlighted fragment, never against the other pairs. The `why` gives one sentence per pair: `A: related. “Homer” goes with “Iliad.” B: NOT related. “Plato” goes with “Republic,” not “Aeneid.”` (the page lays this wording out as a list).

**Matching** (`"t":"mc"` with `"items"`). "Match the following individuals with the best association:" (adapt "individuals"), five numbered terms and five lettered associations in `"items"` as left, right, left, right…, then four choices like "1-C, 2-E, 3-B, 4-D, 5-A" and a fifth, "There is no correct answer to select". Use it in exam sets, not in the 10-question quiz mirrors.

**Fill-in** (`"t":"fill"`), timeline dates only, label "Fill in (all or nothing)". Rotate the three stems: "According to our timeline, … began in ____"; "Fill in the blank - you MUST enter the proper YEAR (numbers): … lasted from 750 to ____ B.C. (fill in the END date)"; "From our Concise Chronology: … c. ____ A.D.".

```
{"t":"fill","s":"Fill in (all or nothing)","q":"According to our timeline, Abram (Abraham) entered Canaan c. ____ BC.","acc":["2090"],"shown":"c. 2090 BC","why":"Timeline #1: c. 2090 Abram (Abraham) enters Canaan."}
```

**Maps** (`"t":"mc"` with `"img"`), when the map key arrives: an image in `maps/` (600 × 450 JPEG, named in `"img"` without ".jpg") with a red asterisk inside one country, four countries, then "None of the above - the correct country is NOT one of the answer choices". Zoom out far enough that a small country cannot be picked out from its neighbours alone, and keep the asterisk small and inside the country.

For exact wordings of stems, choices and notes, copy the style of `questions.js` in `luteron2026/TMU-WH1`. If the World History 2 syllabus has its own sample questions page, that page wins over anything here.

## Writing rules

- **True statements**: copy the highlighted wording, trimmed lightly.
- **False statements and wrong choices**: swap in a term from another highlighted fragment of the same kind (one battle for another battle). Never invent a word. If the swap needs a word that is not highlighted, choose a different swap.
- **Dates**: none in a non-fill question unless that exact date is a highlighted timeline entry in the period the course covers. Ranges such as "c. 500–1500" count as dates. At most one choice with a date per question, and never a question that is mostly dates. A swapped date must be the date of another timeline entry.
- **Timeline-only facts** are fill-in material, not True / False or pair material.
- Give the heading as context when it is highlighted, so a pair cannot be read two ways.
- No added glosses in brackets, no fuller names than the guide gives.

## House rules for the site

- Never change a published question's `"k"`. Never edit `"k"`, `tools/sources.json` or the version numbers by hand; the tools do it.
- Browser storage is shared with the World History 1 site (same address, `luteron2026.github.io`), so every storage key here starts with `wh2_`. Keep new keys that way.
- Visit counts share one GoatCounter site with World History 1; this site's event names start with `wh2-`.
- Text on the page is plain and student-facing: no internal wording, no mention of how the questions were made beyond the disclaimer already there.
