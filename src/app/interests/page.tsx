import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import Polaroid from "@/components/Polaroid";

export const metadata: Metadata = { title: "interests" };

export default function Interests() {
  return (
    <main className="relative">
      <HoldField n={4} />
      <PageHeader eyebrow="OTHERWISE" title="when the laptop is closed">
        The non-robot parts. Each one has its own page.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Polaroid src="/images/climbing/cover.jpg" alt="Bouldering" title="bouldering" caption="Badly, for fun." href="/climbing" label="CLIMBING" mono={false} />
          <Polaroid src="/images/f1/singapore.jpg" alt="F1" title="f1 trips" caption="Marina Bay, Albert Park, Sepang. Team Russell, 63." href="/f1" label="F1" mono={false} />
          <Polaroid src="/images/travel/cover.jpg" alt="Travel" title="travel photos" caption="Treks, race weekends, and the food in between." href="/photos" label="TRAVEL" mono={false} />
        </div>
      </section>
    </main>
  );
}
