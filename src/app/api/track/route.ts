import { NextResponse, type NextRequest } from "next/server";
import { OWNER } from "@/lib/session";
import { record, visitorId } from "@/lib/stats";

// One page view. Called by <Track /> on every route change. Bots, the owner, and /admin are skipped.
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|scrapy|facebookexternalhit|whatsapp|telegram/i;

function browser(ua: string) {
  if (/edg\//i.test(ua)) return "edge";
  if (/opr\/|opera/i.test(ua)) return "opera";
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/chrome|crios/i.test(ua)) return "chrome";
  if (/safari/i.test(ua)) return "safari";
  return "other";
}
function device(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "phone";
  return "desktop";
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const skip = new NextResponse(null, { status: 204 });
  if (!ua || BOT.test(ua) || req.cookies.has(OWNER)) return skip;

  const body = (await req.json().catch(() => null)) as { path?: unknown; ref?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  if (!/^\/[\w\-./]{0,120}$/.test(path) || path.startsWith("/admin") || path.startsWith("/api")) return skip;

  let ref = "";
  if (typeof body?.ref === "string" && body.ref) {
    try {
      const host = new URL(body.ref).hostname.replace(/^www\./, "");
      if (host !== req.nextUrl.hostname.replace(/^www\./, "")) ref = host.slice(0, 80);
    } catch {}
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const country = (req.headers.get("x-vercel-ip-country") ?? "??").slice(0, 2).toUpperCase();

  try {
    await record({ path, ref, country, device: device(ua), browser: browser(ua), visitor: visitorId(ip, ua) });
  } catch (e) {
    console.error("track failed", e);
  }
  return skip;
}
