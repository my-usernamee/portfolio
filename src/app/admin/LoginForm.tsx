"use client";

import { useActionState } from "react";
import { login } from "./actions";

const field = "mt-1.5 w-full border border-line-strong bg-paper px-3 py-2.5 font-mono text-sm text-ink outline-none focus:border-teal";
const label = "font-mono text-[11px] uppercase tracking-[0.18em] text-graphite";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="card max-w-sm">
      <div className="card-head">
        <span>SIGN IN</span>
        <span className="kind">private</span>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <label className={label}>
          username
          <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required className={field} />
        </label>
        <label className={label}>
          password
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>
        <p role="alert" className="min-h-4 font-mono text-xs text-[#b3402a]">{state.error}</p>
        <button disabled={pending} className="bg-ink px-4 py-2.5 font-mono text-xs tracking-[0.12em] text-paper transition-opacity disabled:opacity-50">
          {pending ? "CHECKING…" : "SIGN IN"}
        </button>
      </div>
    </form>
  );
}
