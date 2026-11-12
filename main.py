#!/usr/bin/env python3
"""PhishGuard v3.3 — Server (Clean, no visitor tracking)"""
from __future__ import annotations

import http.server
import json
import os
import socketserver
import time
import mimetypes

from detector import ALL_CHECKS, detect, analyze_password, analyze_email
from data.phishing_types import PHISHING_TYPES
from data.quiz import QUIZ
from data.flashcards import FLASHCARDS
from data.examples import EXAMPLES
from data.future import FUTURE_MODULES
from data.glossary import GLOSSARY_CATEGORIES, GLOSSARY_TERMS
from data.timeline import TIMELINE, get_timeline_stats
from data.course import COURSE

PORT = 8080
VERSION = "3.3.0"
START_TIME = time.time()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def build_html():
    path = os.path.join(BASE_DIR, "templates", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, ct, payload):
        data = payload.encode("utf-8") if isinstance(payload, str) else payload
        self.send_response(code)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _json(self, obj, code=200):
        self._send(code, "application/json; charset=utf-8",
                   json.dumps(obj, ensure_ascii=False))

    def _serve_static(self, rel_path):
        fp = os.path.join(BASE_DIR, rel_path.lstrip("/"))
        if not os.path.isfile(fp):
            return self._send(404, "text/plain", "Not found")
        ct, _ = mimetypes.guess_type(fp)
        ct = ct or "application/octet-stream"
        if ct.startswith("text/") or ct in ("application/javascript", "application/json"):
            ct += "; charset=utf-8"
        with open(fp, "rb") as f:
            self._send(200, ct, f.read())

    def do_GET(self):
        p = self.path.split("?", 1)[0]

        if p in ("/", "/index.html"):
            return self._send(200, "text/html; charset=utf-8", build_html())

        if p == "/api/health":
            return self._json({
                "ok": True, "version": VERSION,
                "types": len(PHISHING_TYPES), "checks": len(ALL_CHECKS),
                "quiz": len(QUIZ), "flashcards": len(FLASHCARDS),
                "uptime": round(time.time() - START_TIME, 1)
            })

        if p == "/api/types":
            return self._json(PHISHING_TYPES)
        if p == "/api/quiz":
            return self._json(QUIZ)
        if p == "/api/examples":
            return self._json(EXAMPLES)
        if p == "/api/flashcards":
            return self._json(FLASHCARDS)
        if p == "/api/future":
            return self._json(FUTURE_MODULES)
        if p == "/api/glossary":
            return self._json({"categories": GLOSSARY_CATEGORIES, "terms": GLOSSARY_TERMS})
        if p == "/api/course":
            return self._json(COURSE)
        if p == "/api/timeline":
            return self._json({"events": TIMELINE, "stats": get_timeline_stats()})

        if p.startswith("/static/"):
            return self._serve_static(p)

        return self._send(404, "text/plain", "Not found")

    def do_POST(self):
        if self.path == "/api/password":
            length = int(self.headers.get("Content-Length", 0))
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                pwd = payload.get("password", "")
            except Exception:
                return self._json({"error": "bad request"}, 400)
            return self._json(analyze_password(pwd))
        if self.path == "/api/email-analyze":
            length = int(self.headers.get("Content-Length", 0))
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                text = payload.get("text", "")
            except Exception:
                return self._json({"error": "bad request"}, 400)
            return self._json(analyze_email(text))
        if self.path == "/api/detect":
            length = int(self.headers.get("Content-Length", 0))
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                url = payload.get("url", "")
            except Exception:
                return self._json({"error": "bad request"}, 400)
            return self._json(detect(url))
        return self._json({"error": "not found"}, 404)


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
        print(f"""
+==================================================================+
|  PhishGuard v{VERSION}                                          |
|                                                                  |
|  Open:      http://localhost:{PORT}                                 |
|  Types:     {len(PHISHING_TYPES)}                                               |
|  Detector:  {len(ALL_CHECKS)} checks                                         |
|  Quiz:      {len(QUIZ)} questions                                      |
|  Cards:     {len(FLASHCARDS)} flashcards                                   |
|                                                                  |
|  Press Ctrl+C to stop                                            |
+==================================================================+
""")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n Bye!")


if __name__ == "__main__":
    main()
