import { AUTH_COOKIE, authRequired, passwordConfigured, passwordMatches, tokenFor } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authRequired()) {
    return Response.json({ ok: true });
  }
  if (!passwordConfigured()) {
    return Response.json(
      { error: "No APP_PASSWORD is set on this deployment." },
      { status: 501 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = String(body.password ?? "");
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    // A deliberate pause. It won't stop a determined attacker, but it makes
    // casual guessing tedious and costs a legitimate login nothing noticeable.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${AUTH_COOKIE}=${tokenFor(process.env.APP_PASSWORD!)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      // A semester is the natural session length for this.
      "Max-Age=15552000",
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
  return response;
}
