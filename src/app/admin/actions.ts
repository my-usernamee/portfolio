"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkLogin, configured, signIn, signOut } from "@/lib/session";
import { failed, locked } from "@/lib/stats";

export type LoginState = { error: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  if (!configured()) return { error: "Login isn't set up on this deployment yet." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (await locked(ip).catch(() => false)) return { error: "Too many tries. Wait 15 minutes." };

  const username = String(form.get("username") ?? ""), password = String(form.get("password") ?? "");
  if (!checkLogin(username, password)) {
    await failed(ip).catch(() => {});
    return { error: "Wrong username or password." };
  }
  await signIn();
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin");
}
