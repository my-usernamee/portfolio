// Medium: set your handle (without the @) and posts are pulled from the RSS feed at build / revalidate time.
export const mediumHandle = "thisisnotmygoooglemailid";

export type Post = { title: string; link: string; date: string; snippet: string; source: "medium" | "manual"; label?: string };

// Posts listed here show up regardless of Medium.
export const manualPosts: Post[] = [
  {
    title: "F1TENTH 101",
    link: "https://ntudeepspeed.github.io/pit-notes/f1tenth-101/",
    date: "2026-08-27",
    snippet: "What the 1/10-scale platform is, what's bolted to the car, and how a LiDAR scan becomes a steering angle.",
    source: "manual",
    label: "NTU DeepSpeed pit notes",
  },
];
