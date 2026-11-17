#!/usr/bin/env python3
"""Pulls the yellow-highlighted text out of a study guide PDF, page by page.

    python3 tools/extract_highlights.py guide/packet.pdf            print the highlights
    python3 tools/extract_highlights.py guide/packet.pdf --write    write them to guide/highlights.md

Needs PyMuPDF:  pip install pymupdf

It finds highlights two ways: highlight annotations (made with a PDF highlighter tool), and yellow boxes drawn
behind the text (how some programs save a highlight). It does NOT work on a scanned or photographed guide, where
the page is a picture; it says so when it finds a page with no text. Always compare a few pages of the result
against the PDF by eye before building questions from it.
"""
import sys

try:
    import pymupdf as fitz
except ImportError:
    sys.exit("PyMuPDF is not installed. Run: pip install pymupdf")


def is_yellow(c):
    return bool(c) and len(c) == 3 and c[0] > 0.8 and c[1] > 0.75 and c[2] < 0.65


def rects_on(page):
    out = []
    for a in page.annots() or []:
        if a.type[0] != 8:  # 8 = highlight
            continue
        v = a.vertices or []
        if len(v) >= 4:
            for i in range(0, len(v) - 3, 4):
                out.append(fitz.Quad(v[i:i + 4]).rect)
        else:
            out.append(a.rect)
    for d in page.get_drawings():
        if is_yellow(d.get("fill")) and d["rect"].height < 40:
            out.append(d["rect"])
    return out


def fragments(page):
    rects = rects_on(page)
    words = page.get_text("words")  # x0, y0, x1, y1, word, block, line, word number
    keep = []
    for w in words:
        box = fitz.Rect(w[:4])
        area = box.get_area() or 1
        if any((box & r).get_area() / area > 0.5 for r in rects if box.intersects(r)):
            keep.append(w)
    out, cur, last = [], [], None
    for w in keep:  # words that follow each other on the page are one fragment
        pos = (w[5], w[6], w[7])
        joined = last is not None and (
            (pos[0] == last[0] and pos[1] == last[1] and pos[2] == last[2] + 1) or
            (pos[0] == last[0] and pos[1] == last[1] + 1 and pos[2] == 0 and last[3]))
        if cur and not joined:
            out.append(" ".join(cur)); cur = []
        cur.append(w[4])
        is_last_on_line = not any(x[5] == w[5] and x[6] == w[6] and x[7] == w[7] + 1 for x in words)
        last = (pos[0], pos[1], pos[2], is_last_on_line)
    if cur:
        out.append(" ".join(cur))
    return out, bool(words)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    doc = fitz.open(args[0])
    lines, total, empty = [], 0, []
    for n, page in enumerate(doc, 1):
        frags, has_text = fragments(page)
        if not has_text:
            empty.append(n)
        if frags:
            lines.append("## Page %d" % n)
            lines += ["- " + f for f in frags]
            lines.append("")
            total += len(frags)
    text = "# Study guide highlights\n\n" + "\n".join(lines)
    if "--write" in sys.argv:
        with open("guide/highlights.md", "w", encoding="utf8") as f:
            f.write(text)
    else:
        print(text)
    print("%d pages, %d highlighted fragments." % (len(doc), total), file=sys.stderr)
    if empty:
        print("No text on page(s) %s: these are pictures (scanned or photographed) and need to be read another way."
              % ", ".join(map(str, empty)), file=sys.stderr)


if __name__ == "__main__":
    main()
