#!/usr/bin/env node
/* Checks the questions against the study guide highlights, so nothing that is not highlighted slips into a question.

     node tools/highlights.js                 check every question
     node tools/highlights.js "Quiz 1"        only the sets whose title contains "Quiz 1"

   It reads guide/highlights.md (the highlighted lines) and guide/timeline.md (the highlighted timeline entries),
   and reports, for each question:
     - words that appear nowhere in the highlights (question wording such as "Which of the following" is ignored);
     - years, centuries and BC / AD dates that are not in the timeline;
     - fill-in answers that are not a timeline date;
     - source lines (tools/sources.json) that are not found in the highlights.
   A reported word is not always a mistake, but each one should be looked at. This is a report: it never changes a file.
   It ends with an error (for use in scripts) only when run with --strict and something was reported. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2), strict = args.includes('--strict'), only = args.filter(a => a.indexOf('--') !== 0)[0];
const read = f => { try{ return fs.readFileSync(path.join(root, f), 'utf8'); }catch(e){ return ''; } };

/* Lowercase, plain quotes and dashes, no punctuation; "B.C." and "A.D." become "bc" and "ad". */
const norm = t => String(t).toLowerCase().replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&')
  .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/\bb\.\s?c\.?/g, 'bc').replace(/\ba\.\s?d\.?/g, 'ad')
  .replace(/'s\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const words = t => norm(t).split(' ').filter(Boolean);
/* The lines of a guide file: "- text" under "## Page N" headings. Comments and headings are left out. */
const lines = t => t.replace(/<!--[\s\S]*?-->/g, '').split('\n').map(l => l.trim()).filter(l => /^[-*] /.test(l)).map(l => l.slice(2).trim());

const hl = lines(read('guide/highlights.md')), tl = lines(read('guide/timeline.md'));
if(!hl.length && !tl.length){
  console.log('guide/highlights.md and guide/timeline.md have no lines yet, so there is nothing to check against. See guide/README.md.');
  process.exit(0);
}
const hlText = ' ' + norm(hl.join(' ')) + ' ', tlText = ' ' + norm(tl.join(' ')) + ' ';
const known = new Set(words(hl.join(' ')).concat(words(tl.join(' '))));
const tlNums = new Set(words(tl.join(' ')).filter(w => /^\d+$/.test(w)));

/* Wording that belongs to the question formats, not to the study guide. */
const STOP = new Set(('a an the of and or to in on at by for from with as is are was were be been that this these those it its which who whom ' +
  'what following statement statements true false all above not correctly related relate regarding according our timeline concise chronology ' +
  'fill blank you must enter proper year numbers number end date began lasted c bc ad match best association associations individuals terms ' +
  'there no correct answer select none moreover addition while because among reasons cited would could can refer note question addressing ' +
  'theological aspects rather historic historical country contains red asterisk choices one both also than then when where had has have did do does').split(' '));

const raw = read('questions.js'), dAt = raw.indexOf('const DATA = ');
let DATA = [], SRC = {};
try{ DATA = JSON.parse(raw.slice(dAt + 13).trim().replace(/;$/, '')); }catch(e){ console.error('questions.js could not be read. Run: node tools/check.js'); process.exit(1); }
try{ SRC = JSON.parse(read('tools/sources.json') || '{}'); }catch(e){}

let checked = 0, flagged = 0;
const seen = {};
DATA.forEach(z => {
  if(only && String(z.title).toLowerCase().indexOf(only.toLowerCase()) < 0) return;
  z.qs.forEach((q, i) => {
    if(q.img || seen[q.k || q.q]) return;          /* map questions are checked against the map key, not the highlights */
    seen[q.k || q.q] = 1; checked++;
    const notes = [];
    if(q.t === 'fill'){
      const nums = (q.acc || []).map(a => norm(a));
      if(nums.every(n => /^\d+$/.test(n)) && !nums.some(n => tlNums.has(n))) notes.push('answer ' + q.shown + ' is not a date in guide/timeline.md');
      else if(!nums.every(n => /^\d+$/.test(n)) && !nums.some(n => hlText.indexOf(' ' + n + ' ') >= 0)) notes.push('answer "' + q.shown + '" is not in the highlights');
    }
    const text = [q.q].concat(q.items || [], q.o || []).join(' ').replace(/_{2,}/g, ' ').replace(/\b\d-[A-E]\b,?/g, ' ').replace(/(^|\s)(\d\.|[A-E]\.)\s/g, ' ');
    const ws = words(text);
    const odd = [...new Set(ws.filter(w => !/^\d+$/.test(w) && w.length > 1 && !known.has(w) && !STOP.has(w)))];
    if(odd.length) notes.push('not in the highlights: ' + odd.join(', '));
    const dates = [...new Set(ws.filter((w, j) => /^\d+$/.test(w) && (w.length >= 3 || /^(bc|ad)$/.test(ws[j + 1] || '')) && !tlNums.has(w)))];
    const cent = /\b(\w+) centur(y|ies)\b/.exec(norm(text));
    if(q.t !== 'fill' && dates.length) notes.push('date not in the timeline: ' + dates.join(', '));
    if(cent && tlText.indexOf(' ' + cent[0] + ' ') < 0 && hlText.indexOf(' ' + cent[0] + ' ') < 0) notes.push('"' + cent[0] + '" is not in the highlights or the timeline');
    (SRC[q.k] || []).forEach(s => String(s).split(/\s+--\s+|;\s+/).forEach(part => {
      const n = norm(part);
      if(n && hlText.indexOf(' ' + n + ' ') < 0 && tlText.indexOf(' ' + n + ' ') < 0) notes.push('source line not found in the highlights: "' + part.trim() + '"');
    }));
    if(notes.length){
      flagged++;
      console.log('\n' + z.title + ' Q' + (i + 1) + (q.k ? ' (' + q.k + ')' : '') + ': ' + String(q.q).slice(0, 90));
      notes.forEach(n => console.log('  - ' + n));
    }
  });
});
console.log('\n' + hl.length + ' highlighted lines, ' + tl.length + ' timeline entries. ' + checked + ' questions checked, ' + flagged + ' to look at.');
process.exit(strict && flagged ? 1 : 0);
