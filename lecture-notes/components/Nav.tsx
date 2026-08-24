"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const onRecorder = pathname === "/";

  return (
    <nav className="flex items-center justify-between border-b border-hairline px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-rec" />
        <span className="text-sm font-semibold tracking-tight">
          Lecture Notes
        </span>
      </Link>
      <Link
        href={onRecorder ? "/lectures" : "/"}
        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-faint hover:text-chalk"
      >
        {onRecorder ? "Library" : "Record"}
      </Link>
    </nav>
  );
}
