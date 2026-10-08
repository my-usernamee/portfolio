# Ranks every allowed guess as a Wordle opener and writes public/wordle/openers.json.
# get_opener_metrics is copied as-is from opener_analysis.ipynb in github.com/my-usernamee/wordle;
# feedback and the word lists come from the solver vendored in api/_wordle.
#
#   python3 scripts/wordle-openers.py

import json
import math
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api" / "_wordle"))

from wordle_solver import ANSWERS_FILE, GUESSES_FILE, feedback, load_word_csv  # noqa: E402


def get_opener_metrics(guess, answers):
    buckets = defaultdict(int)

    for answer in answers:
        pattern = feedback(guess, answer)
        buckets[pattern] += 1

    total = len(answers)

    entropy = 0
    expected_remaining = 0

    for count in buckets.values():
        p = count / total

        entropy -= p * math.log2(p)
        expected_remaining += p * count

    return {
        "word": guess,
        "entropy": entropy,
        "expected_remaining": expected_remaining,
        "patterns": len(buckets),
        "is_answer": guess in answers
    }


answers = load_word_csv(ANSWERS_FILE)
guesses = sorted(set(load_word_csv(GUESSES_FILE)) | set(answers))

rows = []
for i, guess in enumerate(guesses):
    rows.append(get_opener_metrics(guess, answers))
    if (i + 1) % 2000 == 0:
        print("Checked", i + 1, "words")

rows.sort(key=lambda r: r["entropy"], reverse=True)

# column arrays, already in entropy-rank order, so rank = index + 1
out = {
    "answers": len(answers),
    "word": [r["word"] for r in rows],
    "entropy": [round(r["entropy"], 4) for r in rows],
    "expected": [round(r["expected_remaining"], 2) for r in rows],
    "patterns": [r["patterns"] for r in rows],
    "answer": [1 if r["is_answer"] else 0 for r in rows],
}

dest = ROOT / "public" / "wordle" / "openers.json"
dest.write_text(json.dumps(out, separators=(",", ":")))
print("Wrote", dest, "with", len(rows), "openers. Top 5:", out["word"][:5])
