"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

// Hidden terminal. Press ` (backtick) anywhere on a keyboard device. Type help, or click a command.
const PAGES: Record<string, string> = { home: "/", "~": "/", writing: "/writing", interests: "/interests", climbing: "/climbing", f1: "/f1", photos: "/photos", travel: "/photos" };
const LINKS: Record<string, string> = { github: profile.links.github, linkedin: profile.links.linkedin, medium: profile.links.medium, deepspeed: profile.links.team, mecatron: profile.links.mecatron, insta: "https://www.instagram.com/justgoupbruh" };
const CHIPS = ["help", "race", "ls", "cd climbing", "cd f1", "cat resume", "open github", "whoami", "lap", "box", "q"];
const COMMANDS = ["help", "race", "ls", "cd", "cat", "open", "whoami", "lap", "box", "clear", "exit"];

type Line = { text: string; kind?: "in" | "out" | "err" | "hl" };

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ text: "hari.sh · type help, hit tab to complete, or click a command below. type q to close.", kind: "hl" }]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // no keyboard, no terminal
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
      // "/" or "`" opens it from anywhere; inside, type q (or esc) to close
      if ((e.key === "/" || e.key === "`") && !typing) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const print = (...ls: Line[]) => setLines((cur) => [...cur, ...ls]);
  const focus = () => inputRef.current?.focus();

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    print({ text: `$ ${cmd}`, kind: "in" });
    setHist((h) => [cmd, ...h].slice(0, 50));
    setHIdx(-1);
    const [c, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");
    switch (c) {
      case "help":
        print(
          { text: "ls              pages you can cd into" },
          { text: "cd <page>       go there (cd climbing, cd f1, cd ~)" },
          { text: "cat resume      open the resume" },
          { text: "open <site>     github · linkedin · medium · deepspeed · mecatron · insta" },
          { text: "whoami          who is this" },
          { text: "race            drive the car yourself. ↑ ↓, down and back is a lap" },
          { text: "lap             a lap of the site" },
          { text: "box             box box box" },
          { text: "clear · q       the usual" },
        );
        break;
      case "ls":
        print({ text: Object.keys(PAGES).filter((k) => k !== "~").join("   ") });
        break;
      case "cd": {
        const to = PAGES[arg || "~"];
        if (!to) print({ text: `cd: no such page: ${arg}`, kind: "err" });
        else {
          print({ text: `→ ${to}` });
          window.dispatchEvent(new CustomEvent("hari:navigate", { detail: to }));
        }
        break;
      }
      case "cat":
        if (arg === "resume" || arg === "resume.pdf") {
          print({ text: "opening resume.pdf" });
          window.open(profile.links.resume, "_blank");
        } else print({ text: `cat: ${arg || "?"}: try cat resume`, kind: "err" });
        break;
      case "open": {
        const url = LINKS[arg];
        if (!url) print({ text: `open: unknown: ${arg}. try open github`, kind: "err" });
        else {
          print({ text: `→ ${url}` });
          window.open(url, "_blank");
        }
        break;
      }
      case "whoami":
        print({ text: `${profile.fullName.toLowerCase()} · computer engineering @ ntu · robots that race, on land and under water`, kind: "hl" });
        break;
      case "lap":
        print({ text: "lap 1 · sector 1 home 🟩 · sector 2 photos 🟩 · sector 3 climbing 🟪 · 1:23.456" }, { text: "purple in sector 3. obviously." });
        break;
      case "race":
        print({ text: "lights out. ↑ ↓ to drive, down to the bottom and back up is one lap. q to quit.", kind: "hl" });
        setOpen(false);
        window.dispatchEvent(new CustomEvent("hari:race"));
        break;
      case "box":
        print({ text: "box box box." }, { text: "…" }, { text: "no, stay out. stay out." });
        break;
      case "sudo":
        print({ text: "hari is not in the sudoers file. this incident will be reported to the FIA.", kind: "err" });
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
      case "q":
        setOpen(false);
        break;
      default:
        print({ text: `${c}: command not found. type help`, kind: "err" });
    }
  };

  const complete = () => {
    const [c, a = ""] = input.split(/\s+/);
    const pool = c === "cd" ? Object.keys(PAGES) : c === "open" ? Object.keys(LINKS) : COMMANDS;
    const hit = pool.find((k) => k.startsWith(c === "cd" || c === "open" ? a : c));
    if (hit) setInput(c === "cd" || c === "open" ? `${c} ${hit}` : hit);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] hidden md:block" role="dialog" aria-label="terminal">
      <div className="mx-auto max-w-3xl px-5 pb-5">
        <div className="term" onClick={focus}>
          <div className="flex items-center justify-between border-b border-teal-bright/20 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-paper/50">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-bright" /> HARI.SH
            </span>
            <span className="text-teal-bright">type <b>q</b> + enter to close · esc works too</span>
          </div>
          <div ref={bodyRef} className="max-h-64 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed">
            {lines.map((l, i) => (
              <div key={i} className={l.kind === "in" ? "text-paper/50" : l.kind === "err" ? "text-[#ff8f8f]" : l.kind === "hl" ? "text-teal-bright" : "text-paper/90"}>
                {l.text}
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(input);
                setInput("");
              }}
              className="relative flex items-center gap-2"
            >
              <span className="text-teal-bright">$</span>
              {/* the real input is invisible; a mirror shows the text with a blinking block cursor */}
              <span className="relative flex-1 whitespace-pre text-paper">
                <span aria-hidden="true">{input}</span>
                <span aria-hidden="true" className="term-caret" />
                {!input && <span aria-hidden="true" className="term-ghost">type race</span>}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const n = Math.min(hIdx + 1, hist.length - 1);
                      setHIdx(n);
                      setInput(hist[n] ?? "");
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const n = Math.max(hIdx - 1, -1);
                      setHIdx(n);
                      setInput(n < 0 ? "" : hist[n]);
                    } else if (e.key === "Tab") {
                      e.preventDefault();
                      complete();
                    }
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="command"
                  className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
                />
              </span>
            </form>
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-teal-bright/20 px-3 py-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInput(c);
                  focus();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  run(c);
                  setInput("");
                }}
                className="term-chip"
              >
                {c}
              </button>
            ))}
            <span className="ml-auto self-center font-mono text-[10px] text-paper/40">click to fill · enter to run</span>
          </div>
        </div>
      </div>
    </div>
  );
}
