import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import PhotoWall from "@/components/PhotoWall";
import TravelMap from "@/components/TravelMap";
import { photos } from "@/data/travel";

export const metadata: Metadata = { title: "photos" };

export default function Photos() {
  return (
    <main className="relative" data-cursor="camera">
      <HoldField n={5} />
      <PageHeader eyebrow="TRAVEL" title="places & photos">
        <span className="hidden md:inline">Hover</span><span className="md:hidden">Tap</span> a dot or a photo for where and when.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <TravelMap photos={photos} />
        <PhotoWall photos={photos} />
      </section>
    </main>
  );
}
