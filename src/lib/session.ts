import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// The admin login. Credentials and the signing secret come from the environment, never the repo
// (it's public). The session is an expiry time signed with SESSION_SECRET in an httpOnly cookie.

const COOKIE = "hari-admin";
export const OWNER = "hari-owner"; // readable flag so the owner's own visits aren't counted
const WEEK = 7 * 24 * 60 * 60;

const secret = () => process.env.SESSION_SECRET ?? "";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

function same(a: string, b: string) {
  const x = Buffer.from(sign(a)), y = Buffer.from(sign(b)); // equal length, so timingSafeEqual is happy
  return timingSafeEqual(x, y);
}

export const configured = () => Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && secret().length >= 16);

export function checkLogin(username: string, password: string) {
  if (!configured()) return false;
  const u = same(username, process.env.ADMIN_USERNAME!), p = same(password, process.env.ADMIN_PASSWORD!);
  return u && p;
}

export async function signedIn() {
  if (!configured()) return false;
  const [exp, mac] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  if (!exp || !mac || mac.length !== 64 || Number(exp) < Date.now()) return false;
  return timingSafeEqual(Buffer.from(mac), Buffer.from(sign(exp)));
}

export async function signIn() {
  const exp = String(Date.now() + WEEK * 1000);
  const jar = await cookies();
  const base = { secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: WEEK };
  jar.set(COOKIE, `${exp}.${sign(exp)}`, { ...base, httpOnly: true, path: "/admin" });
  jar.set(OWNER, "1", { ...base, maxAge: WEEK * 52, path: "/" });
}

export async function signOut() {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0 });
}
