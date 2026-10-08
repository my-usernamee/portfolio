import type { Metadata } from "next";
import Hl from "@/components/Hl";
import PageHeader from "@/components/PageHeader";
import Wordle from "@/components/Wordle";

export const metadata: Metadata = {
  title: "wordle",
  description: "Rank your Wordle opener against all 12,972 allowed guesses, or let an entropy solver pick your next guess.",
};

export default function WordlePage() {
  return (
    <main>
      <PageHeader eyebrow="WORDLE" title="what's your opener?">
        <Hl>I scored every allowed guess against every possible answer to find ==the best first word==.</Hl> See where yours lands, or hand
        today&apos;s board to the solver.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <Wordle />
        <p className="mt-8 max-w-2xl font-mono text-xs leading-relaxed text-graphite">
          Both run the same code as{" "}
          <a href="https://github.com/my-usernamee/wordle" target="_blank" rel="noreferrer" className="link-under text-ink">
            my solver on GitHub ↗
          </a>
          : the opener ranking is the notebook, and the solver is the terminal script running as a Python function. The write-up is{" "}
          <a href="https://medium.com/@thisisnotmygoooglemailid/solving-wordle-with-entropy-4f4b20fb710e" target="_blank" rel="noreferrer" className="link-under text-ink">
            Solving Wordle with Entropy ↗
          </a>
          .
        </p>
      </section>
    </main>
  );
}
