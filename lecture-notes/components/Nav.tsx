"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const onRecorder = pathname === "/";

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between border-b border-hairline px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-rec" />
        <span className="text-sm font-semibold tracking-tight">
          Lecture Notes
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href={onRecorder ? "/lectures" : "/"}
          className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-faint hover:text-chalk"
        >
          {onRecorder ? "Library" : "Record"}
        </Link>
        <button
          onClick={() => void logout()}
          className="text-xs font-medium text-faint transition-colors hover:text-muted"
        >
          Lock
        </button>
      </div>
    </nav>
  );
}
