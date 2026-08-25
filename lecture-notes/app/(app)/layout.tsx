import { redirect } from "next/navigation";

import { checkAuth } from "@/lib/auth";
import Nav from "@/components/Nav";

/**
 * Required, and not redundant with reading cookies below.
 *
 * checkAuth() short-circuits before touching cookies() when no password is
 * configured — which is exactly the situation at build time. Next therefore
 * sees no dynamic API, prerenders these pages, and the auth check never runs
 * per-request. Forcing dynamic rendering is what keeps the gate real.
 */
export const dynamic = "force-dynamic";

/**
 * Everything under this group requires the password. The login page sits
 * outside it, which is what stops the redirect from chasing its own tail.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await checkAuth();

  if (!auth.ok) {
    if (auth.reason === "unconfigured") return <Unconfigured />;
    redirect("/login");
  }

  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  );
}

function Unconfigured() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3 px-5 py-16">
      <h1 className="font-serif text-xl tracking-tight">
        Set a password before using this
      </h1>
      <p className="text-sm leading-relaxed text-muted">
        This deployment has no <code className="text-chalk">APP_PASSWORD</code>{" "}
        set. Anyone who found the URL could spend your Anthropic and Deepgram
        credit, so nothing will run until one exists.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-hairline bg-panel px-3 py-2 font-mono text-xs text-chalk">
        fly secrets set APP_PASSWORD=&apos;a-long-random-phrase&apos;
      </pre>
      <p className="text-xs leading-relaxed text-faint">
        Make it long. A public URL gets found, and there is no lockout after a
        wrong guess — length is what protects you.
      </p>
    </main>
  );
}
