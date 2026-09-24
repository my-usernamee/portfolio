// Travel logs. Drop photos into /public/images/travel/<slug>-1.jpg etc.
export type Log = { slug: string; place: string; country: string; when: string; note: string; photos: number; example?: boolean };

export const logs: Log[] = [
  { slug: "melbourne", place: "Melbourne", country: "Australia", when: "F1 weekend", note: "Albert Park by day, laneways by night. Add your own line here.", photos: 3, example: true },
  { slug: "kl", place: "Kuala Lumpur", country: "Malaysia", when: "Sepang trip", note: "Track visit and too much nasi kandar.", photos: 2, example: true },
  { slug: "trek", place: "A ridge somewhere", country: "TODO", when: "Trek", note: "The one that made Trekify happen. Replace with the real trek.", photos: 3, example: true },
];
