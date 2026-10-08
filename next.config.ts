import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  // On Vercel, api/wordle.py is its own Python function. Locally, run `python3 api/wordle.py` next to `next dev`.
  async rewrites() {
    return process.env.NODE_ENV === "development" ? [{ source: "/api/wordle", destination: "http://127.0.0.1:5328/api/wordle" }] : [];
  },
};

export default nextConfig;
