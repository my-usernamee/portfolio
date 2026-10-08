import csv
import math
from pathlib import Path
from collections import Counter, defaultdict

from wordfreq import zipf_frequency

BASE = Path(__file__).resolve().parent

GUESSES_FILE = BASE / "dataset" / "valid_guesses.csv"
ANSWERS_FILE = BASE / "dataset" / "valid_solutions.csv"

ANSWER_MODE_THRESHOLD = 10
TOP_N = 10


def load_word_csv(path):
    words = []

    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            word = row["word"].strip().lower()

            if len(word) == 5 and word.isalpha():
                words.append(word)

    return words


def feedback(guess, answer):
    result = ["0"] * 5
    counts = Counter(answer)

    # Greens first
    for i in range(5):
        if guess[i] == answer[i]:
            result[i] = "1"
            counts[guess[i]] -= 1

    # Yellows second
    for i in range(5):
        if result[i] == "0" and counts[guess[i]] > 0:
            result[i] = "2"
            counts[guess[i]] -= 1

    return "".join(result)


def print_board(board):
    colors = {
        "1": "\033[42m",    # green
        "2": "\033[43m",    # yellow
        "0": "\033[100m",   # grey
    }

    reset = "\033[0m"

    print("\nBoard:")

    for guess, fb in board:
        row = []

        for letter, mark in zip(guess.upper(), fb):
            row.append(f"{colors[mark]} {letter} {reset}")

        print(" ".join(row))

    print()


def legal_hard_guess(word, history):
    for old_guess, old_fb in history:
        needed = Counter()

        for i in range(5):
            if old_fb[i] == "1":
                if word[i] != old_guess[i]:
                    return False

                needed[old_guess[i]] += 1

            elif old_fb[i] == "2":
                if word[i] == old_guess[i]:
                    return False

                needed[old_guess[i]] += 1

        word_counts = Counter(word)

        for letter in needed:
            if word_counts[letter] < needed[letter]:
                return False

    return True


def entropy(guess, possible_answers):
    buckets = defaultdict(int)

    for answer in possible_answers:
        pattern = feedback(guess, answer)
        buckets[pattern] += 1

    total = len(possible_answers)
    score = 0

    for count in buckets.values():
        p = count / total
        score -= p * math.log2(p)

    return score


def sigmoid(x):
    return 1 / (1 + math.exp(-x))


def commonness_score(word):
    """
    Returns a 0-to-1 commonness score.

    This is NOT the probability that the word is the answer.
    It only says how common the word is in English, based on wordfreq.
    """
    zipf = zipf_frequency(word, "en")

    # midpoint = 3.5, scale = 0.8
    # common words move closer to 1
    # rare words move closer to 0
    return sigmoid((zipf - 3.5) / 0.8)


def get_entropy_suggestions(guesses, answers, history, top_n=10):
    rows = []

    for guess in guesses:
        if not legal_hard_guess(guess, history):
            continue

        e = entropy(guess, answers)
        c = commonness_score(guess)

        rows.append({
            "word": guess,
            "entropy": e,
            "commonness_score": c
        })

    rows.sort(key=lambda x: x["entropy"], reverse=True)

    return rows[:top_n], len(rows)


def rank_answers_by_commonness(answers, top_n=10):
    rows = []

    total_commonness = sum(commonness_score(word) for word in answers)

    for word in answers:
        c = commonness_score(word)

        if total_commonness == 0:
            answer_likelihood = 1 / len(answers)
        else:
            answer_likelihood = c / total_commonness

        rows.append({
            "word": word,
            "commonness_score": c,
            "answer_likelihood": answer_likelihood
        })

    rows.sort(key=lambda x: x["answer_likelihood"], reverse=True)

    return rows[:top_n]


def main():
    extra_guesses = load_word_csv(GUESSES_FILE)
    answers = load_word_csv(ANSWERS_FILE)

    guesses = sorted(set(extra_guesses) | set(answers))
    guess_set = set(guesses)

    history = []
    board = []
    turn = 1

    print("Wordle Solver - Manual Mode")
    print("Large pool: entropy-ranked suggestions with commonness shown as context")
    print("Small pool: possible answers ranked by answer likelihood")
    print("1 = green, 2 = yellow, 0 = grey")
    print("Example feedback: 12000")
    print()
    print(f"Loaded {len(guesses)} allowed guesses.")
    print(f"Loaded {len(answers)} possible answers.")
    print()

    while True:
        print(f"\nTurn {turn}")
        print(f"Remaining possible answers: {len(answers)}")

        if len(answers) <= 30:
            print("Possible answers:")
            print(", ".join(answers))

        print()
        user_guess = input("Enter the word you played: ").strip().lower()

        if user_guess == "quit":
            print("Exiting.")
            break

        if len(user_guess) != 5 or not user_guess.isalpha():
            print("Invalid guess. Enter a 5-letter word.")
            continue

        if user_guess not in guess_set:
            print("Warning: this word is not in the allowed guess list.")
            proceed = input("Use it anyway? y/n: ").strip().lower()

            if proceed != "y":
                continue

        if not legal_hard_guess(user_guess, history):
            print("Warning: this guess does not satisfy current hard-mode constraints.")
            proceed = input("Use it anyway? y/n: ").strip().lower()

            if proceed != "y":
                continue

        fb = input("Enter feedback: ").strip()

        if len(fb) != 5 or any(x not in "012" for x in fb):
            print("Invalid feedback. Use exactly 5 digits: 0, 1, 2.")
            continue

        board.append((user_guess, fb))
        print_board(board)

        if fb == "11111":
            print(f"Solved in {turn} turns.")
            break

        history.append((user_guess, fb))

        answers = [
            ans for ans in answers
            if feedback(user_guess, ans) == fb
        ]

        if not answers:
            print("No answers left. Feedback was probably wrong.")
            break

        if len(answers) == 1:
            print(f"Answer found: {answers[0].upper()}")
            print(f"Solved logically in {turn + 1} turns.")
            break

        if len(answers) <= ANSWER_MODE_THRESHOLD:
            print("\nSmall candidate pool detected.")
            print("Ranking possible answers by normalized commonness.")

            top_answers = rank_answers_by_commonness(answers, TOP_N)

            print("\nLikely answers:")

            for rank, row in enumerate(top_answers, start=1):
                word = row["word"].upper()
                likelihood = row["answer_likelihood"] * 100
                commonness = row["commonness_score"] * 100

                print(
                    f"{rank:>2}. {word:<6} "
                    f"answer_likelihood={likelihood:>6.2f}%   "
                    f"commonness_score={commonness:>5.1f}%"
                )

        else:
            print("Calculating entropy suggestions...")

            top_guesses, legal_count = get_entropy_suggestions(
                guesses,
                answers,
                history,
                TOP_N
            )

            print(f"\nLegal hard-mode guesses: {legal_count}")
            print("Top entropy suggestions:")

            for rank, row in enumerate(top_guesses, start=1):
                word = row["word"].upper()
                e = row["entropy"]
                commonness = row["commonness_score"] * 100

                print(
                    f"{rank:>2}. {word:<6} "
                    f"entropy={e:.3f}   "
                    f"commonness_score={commonness:>5.1f}%"
                )

        print("-" * 50)

        turn += 1


if __name__ == "__main__":
    main()
