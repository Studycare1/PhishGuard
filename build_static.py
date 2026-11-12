#!/usr/bin/env python3
"""PhishGuard — Static Site Builder for GitHub Pages"""

import json
import os
import shutil

BASE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(BASE, "docs")

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("=" * 60)
    print("  PhishGuard — Static Site Builder")
    print("=" * 60)

    ensure_dir(DOCS)
    ensure_dir(os.path.join(DOCS, "data"))
    ensure_dir(os.path.join(DOCS, "static", "css"))
    ensure_dir(os.path.join(DOCS, "static", "js"))

    # Copy CSS
    shutil.copy2(os.path.join(BASE, "static/css/style.css"),
                 os.path.join(DOCS, "static/css/style.css"))
    print("✓ CSS copied")

    # Export data
    from data.phishing_types import PHISHING_TYPES
    from data.quiz import QUIZ
    from data.flashcards import FLASHCARDS
    from data.examples import EXAMPLES
    from data.future import FUTURE_MODULES
    from data.glossary import GLOSSARY_CATEGORIES, GLOSSARY_TERMS
    from data.timeline import TIMELINE, get_timeline_stats
    from data.course import COURSE

    write_json(os.path.join(DOCS, "data/types.json"), PHISHING_TYPES)
    write_json(os.path.join(DOCS, "data/quiz.json"), QUIZ)
    write_json(os.path.join(DOCS, "data/flashcards.json"), FLASHCARDS)
    write_json(os.path.join(DOCS, "data/examples.json"), EXAMPLES)
    write_json(os.path.join(DOCS, "data/future.json"), FUTURE_MODULES)
    write_json(os.path.join(DOCS, "data/glossary.json"),
               {"categories": GLOSSARY_CATEGORIES, "terms": GLOSSARY_TERMS})
    write_json(os.path.join(DOCS, "data/timeline.json"),
               {"events": TIMELINE, "stats": get_timeline_stats()})
    write_json(os.path.join(DOCS, "data/course.json"), COURSE)

    print("✓ Data exported: types/quiz/flashcards/future/glossary/timeline/course")

    # Patch app.js for static
    with open(os.path.join(BASE, "static/js/app.js"), "r", encoding="utf-8") as f:
        app_js = f.read()

    replacements = [
        ("'/api/types'", "'./data/types.json'"),
        ("'/api/quiz'", "'./data/quiz.json'"),
        ("'/api/examples'", "'./data/examples.json'"),
        ("'/api/flashcards'", "'./data/flashcards.json'"),
        ("'/api/future'", "'./data/future.json'"),
        ("'/api/glossary'", "'./data/glossary.json'"),
        ("'/api/timeline'", "'./data/timeline.json'"),
        ("'/api/course'", "'./data/course.json'"),
    ]
    for old, new in replacements:
        app_js = app_js.replace(old, new)

    # Patch URL detector → client-side
    old_detect = """    const r = await fetch('/api/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });
    const j = await r.json();
    renderResult(j);"""
    new_detect = """    const j = detect(url);
    renderResult(j);"""
    app_js = app_js.replace(old_detect, new_detect)

    # Patch password analyzer
    old_pwd = """    const r = await fetch('/api/password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({password: pwd})
    });
    const d = await r.json();
    renderPwdResult(d);"""
    new_pwd = """    const d = analyzePassword(pwd);
    renderPwdResult(d);"""
    app_js = app_js.replace(old_pwd, new_pwd)

    # Patch email analyzer
    old_email = """    const r = await fetch('/api/email-analyze', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text})
    });
    const d = await r.json();
    renderEmailResult(d);"""
    new_email = """    const d = analyzeEmail(text);
    renderEmailResult(d);"""
    app_js = app_js.replace(old_email, new_email)

    with open(os.path.join(DOCS, "static/js/app.js"), "w", encoding="utf-8") as f:
        f.write(app_js)
    print("✓ app.js patched")

    # Copy index.html with relative paths
    with open(os.path.join(BASE, "templates/index.html"), "r", encoding="utf-8") as f:
        html = f.read()

    html = html.replace('href="/static/', 'href="./static/')
    html = html.replace('src="/static/', 'src="./static/')

    if 'detector.js' not in html:
        html = html.replace(
            '<script src="./static/js/app.js"></script>',
            '<script src="./static/js/detector.js"></script>\n<script src="./static/js/app.js"></script>'
        )

    with open(os.path.join(DOCS, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("✓ index.html patched")

    # .nojekyll
    with open(os.path.join(DOCS, ".nojekyll"), "w") as f:
        f.write("")

    total = 0
    for root, dirs, files in os.walk(DOCS):
        for fn in files:
            total += os.path.getsize(os.path.join(root, fn))

    print()
    print(f"✓ Build complete — {total/1024:.1f} KB → docs/")
    print()

if __name__ == "__main__":
    main()
