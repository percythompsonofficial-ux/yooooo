import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * A single shared password, because this app has exactly one user.
 *
 * The thing actually being protected is not the lectures — it's the API keys.
 * An open URL lets anyone spend your Anthropic and Deepgram credit, so the
 * expensive routes fail closed: in production without a password set, they
 * refuse to run at all rather than quietly serving the world.
 *
 * Note the deliberate absence of a proxy (middleware). Next buffers request
 * bodies when one exists, capped at 10MB by default, which would silently
 * truncate a full lecture upload. Checking the cookie in a layout and in each
 * route keeps that machinery out of the request path entirely.
 */

export const AUTH_COOKIE = "lecture_auth";

export function passwordConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD);
}

/** Local development never asks for a password. */
export function authRequired(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * The cookie holds a value derived from the password, not the password. Someone
 * reading the cookie jar of a shared laptop learns nothing reusable elsewhere.
 */
export function tokenFor(password: string): string {
  return createHmac("sha256", password).update("lecture-notes.v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function passwordMatches(attempt: string): boolean {
  const actual = process.env.APP_PASSWORD;
  if (!actual) return false;
  return safeEqual(tokenFor(attempt), tokenFor(actual));
}

export type AuthState =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "unauthenticated" };

export async function checkAuth(): Promise<AuthState> {
  if (!authRequired()) return { ok: true };
  if (!passwordConfigured()) return { ok: false, reason: "unconfigured" };

  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return { ok: false, reason: "unauthenticated" };

  return safeEqual(token, tokenFor(process.env.APP_PASSWORD!))
    ? { ok: true }
    : { ok: false, reason: "unauthenticated" };
}
