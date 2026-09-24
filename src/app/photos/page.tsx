import type { Metadata } from "next";
import { HoldField } from "@/components/Doodles";
import PageHeader from "@/components/PageHeader";
import PhotoWall from "@/components/PhotoWall";
import { countries, photos } from "@/data/travel";

export const metadata: Metadata = { title: "photos" };

export default function Photos() {
  return (
    <main className="relative" data-cursor="camera">
      <HoldField n={5} />
      <PageHeader eyebrow="TRAVEL" title="places & photos">
        {photos.length} photos from {countries.length} countries. Hover for where and when.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pl-28">
        <PhotoWall photos={photos} />
      </section>
    </main>
  );
}
