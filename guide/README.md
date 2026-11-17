# The study guide material

Everything a question says has to come from the highlighted parts of the note packet. This folder holds those parts as plain text, so each question can be checked against them.

| File | What goes in it |
| --- | --- |
| `highlights.md` | Every highlighted line, under a `## Page N` heading for the page it is on |
| `timeline.md` | Every highlighted timeline entry, one per line, as `date event` |
| `course.md` | Add this when you have the syllabus: which pages each quiz and exam covers, the period the course covers, and the map key |

The packet itself (PDF, scans, photos) is **not** kept here. `.gitignore` keeps those files out, because this repository is public.

## When a new part of the packet arrives

1. Put the highlighted PDF in this folder (it stays on your computer) and run:

   ```
   python3 tools/extract_highlights.py guide/packet.pdf
   ```

   It prints the highlighted text page by page. Compare a few pages with the PDF by eye, then add the lines to `highlights.md`. If the packet is a scan or a set of photos, the tool says so; the highlighted lines then have to be read off the pictures.
2. Add the highlighted timeline entries to `timeline.md`.
3. Write the questions into `questions.js` (the formats and rules are in `CLAUDE.md`).
4. Run the three checks:

   ```
   node tools/check.js --fix
   ```

   ```
   node tools/highlights.js
   ```

   ```
   node tools/check.js --release
   ```

   The first tidies the question file and reports mistakes in it. The second lists every word and date in a question that is not in the highlights. The third raises the version number, ready to publish.
