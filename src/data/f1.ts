export type Trip = { slug: "marina-bay" | "albert-park" | "sepang"; gp: string; circuit: string; city: string; year: string; note: string; image: string };

export const trips: Trip[] = [
  {
    slug: "marina-bay",
    gp: "Singapore Grand Prix",
    circuit: "Marina Bay Street Circuit",
    city: "Singapore",
    year: "2024 · 2025",
    note: "==Home race==. Night lights, humidity you can chew, and the walk from Bay Grandstand to the MRT at midnight.",
    image: "/images/f1/singapore.jpg",
  },
  {
    slug: "albert-park",
    gp: "Australian Grand Prix",
    circuit: "Albert Park Circuit",
    city: "Melbourne",
    year: "2025",
    note: "==Season opener== energy. Lake, parkland, and the ==loudest crowd on the calendar==.",
    image: "/images/f1/melbourne.jpg",
  },
  {
    slug: "sepang",
    gp: "Sepang International Circuit",
    circuit: "Sepang",
    city: "Kuala Lumpur",
    year: "2026",
    note: "The Hermann Tilke classic with the ==two long straights==. No F1 race here since 2017, so this one was a ==track visit==.",
    image: "/images/f1/sepang.jpg",
  },
];

export const wishlist = ["Monza", "Spa-Francorchamps", "Istanbul Park"];

export const fan = {
  team: "Mercedes-AMG Petronas",
  driver: "George Russell",
  number: 63,
  line: "Yes, the teal on this site is ==Petronas teal==. I watch ==qualifying== more carefully than most people watch the race.",
};
