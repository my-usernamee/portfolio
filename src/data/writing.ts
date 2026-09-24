// Medium: set your handle (without the @) and posts are pulled from the RSS feed at build / revalidate time.
export const mediumHandle = "thisisnotmygoooglemailid";

export type Post = { title: string; link: string; date: string; snippet: string; source: "medium" | "manual" };

// Posts listed here show up regardless of Medium.
export const manualPosts: Post[] = [];
