# POST /api/wordle — one turn of the terminal solver (api/_wordle/wordle_solver.py) over HTTP.
#
# body:  {"history": [["slate", "00200"], ["crony", "02010"]]}   1 = green, 2 = yellow, 0 = grey
#
# Replays the board exactly like main() does: filter the answers by each feedback, then either
# rank the small pool by commonness or rank legal hard-mode guesses by entropy.

import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "_wordle"))

from wordle_solver import (  # noqa: E402
    ANSWER_MODE_THRESHOLD,
    ANSWERS_FILE,
    GUESSES_FILE,
    TOP_N,
    feedback,
    get_entropy_suggestions,
    legal_hard_guess,
    load_word_csv,
    rank_answers_by_commonness,
)

ALL_ANSWERS = load_word_csv(ANSWERS_FILE)
GUESSES = sorted(set(load_word_csv(GUESSES_FILE)) | set(ALL_ANSWERS))
GUESS_SET = set(GUESSES)

MAX_TURNS = 6


def solve(history):
    answers = ALL_ANSWERS
    played = []
    warnings = []

    for turn, (guess, fb) in enumerate(history, start=1):
        if guess not in GUESS_SET:
            warnings.append(f"{guess.upper()} is not in the allowed guess list.")

        if not legal_hard_guess(guess, played):
            warnings.append(f"{guess.upper()} does not satisfy hard-mode constraints.")

        if fb == "11111":
            return {"status": "solved", "turn": turn, "answer": guess, "warnings": warnings}

        played.append((guess, fb))
        answers = [ans for ans in answers if feedback(guess, ans) == fb]

        if not answers:
            return {"status": "none", "turn": turn, "warnings": warnings}

    out = {
        "turn": len(history) + 1,
        "remaining": len(answers),
        "possible": answers if len(answers) <= 30 else [],
        "warnings": warnings,
    }

    if not history:
        return {**out, "status": "start"}

    if len(answers) == 1:
        return {**out, "status": "found", "answer": answers[0]}

    if len(answers) <= ANSWER_MODE_THRESHOLD:
        rows = rank_answers_by_commonness(answers, TOP_N)
        return {
            **out,
            "status": "answers",
            "rows": [
                {"word": r["word"], "likelihood": r["answer_likelihood"], "commonness": r["commonness_score"]}
                for r in rows
            ],
        }

    rows, legal_count = get_entropy_suggestions(GUESSES, answers, played, TOP_N)
    return {
        **out,
        "status": "entropy",
        "legal": legal_count,
        "rows": [{"word": r["word"], "entropy": r["entropy"], "commonness": r["commonness_score"]} for r in rows],
    }


def parse(body):
    data = json.loads(body or b"{}")
    history = data.get("history", [])

    if not isinstance(history, list) or len(history) > MAX_TURNS:
        raise ValueError("history must be a list of at most 6 turns")

    clean = []
    for row in history:
        guess, fb = str(row[0]).strip().lower(), str(row[1]).strip()

        if len(guess) != 5 or not guess.isalpha():
            raise ValueError("Invalid guess. Enter a 5-letter word.")

        if len(fb) != 5 or any(x not in "012" for x in fb):
            raise ValueError("Invalid feedback. Use exactly 5 digits: 0, 1, 2.")

        clean.append((guess, fb))

    return clean


class handler(BaseHTTPRequestHandler):
    def send(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
            history = parse(self.rfile.read(length))
        except (ValueError, TypeError, IndexError, json.JSONDecodeError) as e:
            return self.send(400, {"error": str(e) or "Bad request."})

        self.send(200, solve(history))

    def do_GET(self):
        self.send(200, solve([]))


if __name__ == "__main__":
    # local dev: python3 api/wordle.py  (next dev rewrites /api/wordle here)
    from http.server import ThreadingHTTPServer

    ThreadingHTTPServer(("127.0.0.1", 5328), handler).serve_forever()
