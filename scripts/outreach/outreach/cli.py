"""Command line interface.

    draft    write messages for prospects that don't have one yet
    list     show what's in the outbox
    show     print one draft in full
    edit     open one draft in $EDITOR
    approve  clear drafts to send
    reject   kill drafts
    export   write review.md for reading away from the terminal
    send     send approved email drafts
    status   counts, and what's left to do
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from . import prospects as prospects_mod
from . import store as store_mod
from .config import Config, ConfigError, load as load_config
from .mailer import Mailer, SendError, compose
from .prospects import ProspectError

# .drafter is imported inside cmd_draft so that reviewing and sending work
# without the anthropic package installed.

HERE = Path(__file__).resolve().parent.parent


def _err(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)


def _load(args) -> tuple[Config, store_mod.Store]:
    config = load_config(Path(args.config))
    return config, store_mod.Store(config.state_path)


def _one_line(text: str, width: int = 60) -> str:
    flat = " ".join(text.split())
    return flat if len(flat) <= width else flat[: width - 1] + "…"


# ----------------------------------------------------------------- draft


def cmd_draft(args) -> int:
    try:
        from .drafter import DraftError, Drafter
    except ImportError as exc:
        _err(f"{exc}. Run: pip install -r requirements.txt")
        return 1

    config, store = _load(args)
    result = prospects_mod.load(Path(args.prospects))
    suppression = prospects_mod.load_suppression(config.suppression_path)

    for problem in result.problems:
        print(f"  note: {problem}")

    queue = []
    for prospect in result.prospects:
        if args.channel and prospect.channel != args.channel:
            continue
        if args.only and prospect.id not in args.only:
            continue
        if prospects_mod.is_suppressed(prospect.email, suppression):
            print(f"  skip {prospect.id}: on the suppression list")
            continue
        existing = store.get(prospect.id)
        if existing and not args.redraft:
            continue
        if existing and existing["status"] == "sent":
            print(f"  skip {prospect.id}: already sent, not redrafting")
            continue
        queue.append(prospect)

    if args.limit:
        queue = queue[: args.limit]

    if not queue:
        print("Nothing to draft. Use --redraft to rewrite existing drafts.")
        return 0

    print(f"Drafting {len(queue)} message(s) with {config.claude.model}…\n")
    drafter = Drafter(config)
    written = failed = 0

    for prospect in queue:
        label = f"{prospect.id} ({prospect.name or 'unnamed'}, {prospect.channel})"
        try:
            draft = drafter.draft(prospect)
        except DraftError as exc:
            print(f"  ✗ {label}: {exc}")
            failed += 1
            continue
        except Exception as exc:  # network, rate limit, auth
            print(f"  ✗ {label}: {type(exc).__name__}: {exc}")
            failed += 1
            continue

        record = store.put_draft(
            prospect.as_record(),
            subject=draft["subject"],
            body=draft["body"],
            basis=draft["personalization_basis"],
            confidence=draft["confidence"],
            model=config.claude.model,
        )
        store.save()
        written += 1

        flag = store_mod.needs_attention(record)
        marker = "!" if flag else "✓"
        print(f"  {marker} {label}")
        if record["subject"]:
            print(f"      subject: {record['subject']}")
        print(f"      {_one_line(record['body'], 70)}")
        if flag:
            print(f"      needs attention: {flag}")

    print(f"\n{written} drafted, {failed} failed.")
    print("Read them with `list` / `show`, then `approve`. Nothing sends on its own.")
    return 0 if failed == 0 else 1


# ------------------------------------------------------------------ list


def cmd_list(args) -> int:
    _, store = _load(args)
    records = store.by_status(*args.status) if args.status else store.by_status()
    if not records:
        print("Outbox is empty.")
        return 0

    records.sort(key=lambda r: (r["status"], r["id"]))
    for record in records:
        flag = store_mod.needs_attention(record)
        marker = "!" if flag and record["status"] == "drafted" else " "
        name = record["prospect"].get("name", "")
        print(
            f"{marker} {record['id']:<14} {record['status']:<9} "
            f"{record['channel']:<9} {name:<24} {_one_line(record['body'], 44)}"
        )
    print(f"\n{len(records)} record(s).  ! = read this one closely before approving")
    return 0


def cmd_show(args) -> int:
    config, store = _load(args)
    record = store.get(args.id)
    if record is None:
        _err(f"no draft with id '{args.id}'")
        return 1

    prospect = record["prospect"]
    print(f"id           {record['id']}")
    print(f"status       {record['status']}")
    print(f"channel      {record['channel']}")
    print(f"to           {prospect.get('name','')} <{prospect.get('email','')}>")
    if prospect.get("profile_url"):
        print(f"profile      {prospect['profile_url']}")
    if prospect.get("note"):
        print(f"note         {prospect['note']}")
    print(f"hook used    {record['personalization_basis'] or '(none — generic)'}")
    print(f"confidence   {record['confidence']}")
    print(f"drafted      {record['drafted_at']} ({record['model']})")
    flag = store_mod.needs_attention(record)
    if flag:
        print(f"attention    {flag}")
    print()

    if record["channel"] == "email":
        # Show it exactly as the recipient will get it, footer and all.
        print(compose(config, record).get_content())
    else:
        print(record["body"])
        print(f"\n-- paste into {record['channel']}: {prospect.get('profile_url','')}")
    return 0


# ------------------------------------------------------------------ edit


def cmd_edit(args) -> int:
    config, store = _load(args)
    record = store.get(args.id)
    if record is None:
        _err(f"no draft with id '{args.id}'")
        return 1
    if record["status"] == "sent":
        _err("that one is already sent")
        return 1

    editor = os.environ.get("EDITOR") or os.environ.get("VISUAL") or "nano"
    header = f"Subject: {record['subject']}\n\n" if record["channel"] == "email" else ""
    with tempfile.NamedTemporaryFile(
        "w+", suffix=".txt", delete=False, encoding="utf-8"
    ) as fh:
        fh.write(header + record["body"] + "\n")
        temp = Path(fh.name)

    try:
        subprocess.run([*editor.split(), str(temp)], check=True)
        text = temp.read_text(encoding="utf-8")
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        _err(f"editor '{editor}' failed: {exc}")
        return 1
    finally:
        temp.unlink(missing_ok=True)

    subject = record["subject"]
    body = text
    if record["channel"] == "email":
        match = re.match(r"[ \t]*Subject:(.*)\n(.*)", text, re.DOTALL)
        if match:
            subject = match.group(1).strip()
            body = match.group(2)
    body = body.strip()
    if not body:
        _err("empty body, nothing saved")
        return 1

    record["subject"] = subject
    record["body"] = body
    record["edited_at"] = store_mod.now()
    if record["status"] in ("approved", "rejected", "failed"):
        # An edited message has not been approved. Send it back for review.
        record["status"] = "drafted"
        record["approved_at"] = None
    store.save()
    print(f"Saved. {record['id']} is back in 'drafted' — approve it when you're happy.")
    return 0


# --------------------------------------------------------- approve/reject


def _ids_from_review(path: Path) -> list[str]:
    if not path.exists():
        raise ConfigError(f"no review file at {path}")
    return re.findall(
        r"^- \[[xX]\]\s+`?([\w.-]+)`?", path.read_text(encoding="utf-8"), re.MULTILINE
    )


def cmd_approve(args) -> int:
    _, store = _load(args)
    ids = list(args.ids)
    if args.from_review:
        ids += _ids_from_review(Path(args.from_review))
    if not ids:
        _err("give me some ids, or --from-review review.md")
        return 1

    approved = 0
    for pid in ids:
        record = store.get(pid)
        if record is None:
            print(f"  ? {pid}: not in the outbox")
            continue
        if record["status"] == "sent":
            print(f"  · {pid}: already sent")
            continue
        flag = store_mod.needs_attention(record)
        if flag and not args.force:
            print(f"  ! {pid}: {flag} — read it, then approve with --force")
            continue
        store.set_status(pid, "approved", approved_at=store_mod.now())
        approved += 1
        print(f"  ✓ {pid}")
    store.save()
    print(f"\n{approved} approved.")
    return 0


def cmd_reject(args) -> int:
    _, store = _load(args)
    for pid in args.ids:
        if store.get(pid) is None:
            print(f"  ? {pid}: not in the outbox")
            continue
        store.set_status(pid, "rejected", error=args.reason)
        print(f"  ✗ {pid} rejected")
    store.save()
    return 0


# ---------------------------------------------------------------- export


def cmd_export(args) -> int:
    _, store = _load(args)
    records = [
        r
        for r in store.by_status("drafted")
        if not args.channel or r["channel"] == args.channel
    ]
    records.sort(key=lambda r: r["id"])

    lines = [
        "# Outreach review",
        "",
        "Tick the box next to anything you're happy to send, save this file, then run:",
        "",
        "    python -m outreach approve --from-review review.md",
        "",
        "Leave a box unticked to hold it back. To change wording, "
        "`python -m outreach edit <id>`.",
        "",
    ]
    for record in records:
        prospect = record["prospect"]
        lines.append(f"- [ ] `{record['id']}`")
        lines.append("")
        lines.append(
            f"  **{prospect.get('name','')}**"
            + (f" — {prospect['company']}" if prospect.get("company") else "")
            + f"  ·  {record['channel']}"
            + (f"  ·  {prospect['email']}" if prospect.get("email") else "")
        )
        if prospect.get("profile_url"):
            lines.append(f"  <{prospect['profile_url']}>")
        lines.append("")
        flag = store_mod.needs_attention(record)
        if flag:
            lines.append(f"  > ⚠ {flag}")
            lines.append("")
        if record["subject"]:
            lines.append(f"  **Subject:** {record['subject']}")
            lines.append("")
        for paragraph in record["body"].split("\n"):
            lines.append(f"  {paragraph}" if paragraph.strip() else "")
        lines.append("")

    out = Path(args.output)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} draft(s) to {out}")
    return 0


# ------------------------------------------------------------------ send


def cmd_send(args) -> int:
    config, store = _load(args)
    suppression = prospects_mod.load_suppression(config.suppression_path)

    queue = [r for r in store.by_status("approved") if r["channel"] == "email"]
    queue.sort(key=lambda r: r["approved_at"] or "")

    # The suppression list wins even over an approval — someone may have asked
    # to be left alone between approval and send.
    held = {
        r["id"]
        for r in queue
        if prospects_mod.is_suppressed(r["prospect"].get("email", ""), suppression)
    }
    for pid in sorted(held):
        print(f"  skip {pid}: on the suppression list")
    queue = [r for r in queue if r["id"] not in held]

    remaining_today = config.email.daily_limit - store.sent_today()
    if remaining_today <= 0:
        print(
            f"Daily limit of {config.email.daily_limit} already reached. "
            "Try again tomorrow."
        )
        return 0
    if args.limit:
        remaining_today = min(remaining_today, args.limit)
    if len(queue) > remaining_today:
        print(f"Sending {remaining_today} of {len(queue)} (daily limit).")
        queue = queue[:remaining_today]

    social = [r for r in store.by_status("approved") if r["channel"] != "email"]
    if social:
        print(
            f"{len(social)} approved LinkedIn/Facebook draft(s) are waiting — those "
            "have to be pasted by hand. `python -m outreach export` collects them."
        )

    if not queue:
        print("No approved email drafts to send.")
        return 0

    if not args.yes:
        print(f"\nWould send {len(queue)} email(s):\n")
        for record in queue:
            print(
                f"  {record['id']:<14} {record['prospect'].get('email',''):<32} "
                f"{record['subject']}"
            )
        print("\nNothing sent. Re-run with --yes to actually send.")
        return 0

    print(f"Sending {len(queue)} email(s) from {config.email.username}…\n")
    sent = failed = 0
    try:
        with Mailer(config) as mailer:
            for index, record in enumerate(queue):
                try:
                    message_id = mailer.send(record)
                except SendError as exc:
                    store.set_status(record["id"], "failed", error=str(exc))
                    store.save()
                    failed += 1
                    print(f"  ✗ {record['id']}: {exc}")
                    continue
                store.set_status(
                    record["id"],
                    "sent",
                    sent_at=store_mod.now(),
                    message_id=message_id,
                    error=None,
                )
                store.save()
                sent += 1
                print(f"  ✓ {record['id']} → {record['prospect'].get('email','')}")
                if index < len(queue) - 1 and config.email.min_seconds_between:
                    time.sleep(config.email.min_seconds_between)
    except SendError as exc:
        _err(str(exc))
        return 1

    print(f"\n{sent} sent, {failed} failed.")
    return 0 if failed == 0 else 1


# ---------------------------------------------------------------- status


def cmd_status(args) -> int:
    config, store = _load(args)
    counts = store.counts()
    print(f"config       {args.config}")
    print(f"outbox       {config.state_path}")
    print(f"sending as   {config.email.from_name} <{config.email.username}>")
    print()
    for status in store_mod.STATUSES:
        print(f"  {status:<10} {counts.get(status, 0)}")
    print(f"\n  sent today {store.sent_today()} of {config.email.daily_limit} allowed")

    flagged = [
        r for r in store.by_status("drafted") if store_mod.needs_attention(r)
    ]
    if flagged:
        print(f"\n{len(flagged)} draft(s) need a closer read: " + ", ".join(r["id"] for r in flagged))
    return 0


# ------------------------------------------------------------------ main


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="outreach", description="Draft, review, and send prospect outreach."
    )
    parser.add_argument(
        "--config", default=str(HERE / "config.toml"), help="path to config.toml"
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("draft", help="write messages for prospects with no draft yet")
    p.add_argument("--prospects", default=str(HERE / "data" / "prospects.csv"))
    p.add_argument("--limit", type=int, help="stop after N prospects")
    p.add_argument("--channel", choices=sorted(prospects_mod.CHANNELS))
    p.add_argument("--only", nargs="+", metavar="ID", help="draft just these ids")
    p.add_argument("--redraft", action="store_true", help="rewrite existing drafts")
    p.set_defaults(func=cmd_draft)

    p = sub.add_parser("list", help="show the outbox")
    p.add_argument("--status", nargs="+", choices=store_mod.STATUSES)
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("show", help="print one draft in full")
    p.add_argument("id")
    p.set_defaults(func=cmd_show)

    p = sub.add_parser("edit", help="open one draft in $EDITOR")
    p.add_argument("id")
    p.set_defaults(func=cmd_edit)

    p = sub.add_parser("approve", help="clear drafts to send")
    p.add_argument("ids", nargs="*")
    p.add_argument("--from-review", metavar="FILE", help="read ticked boxes from review.md")
    p.add_argument("--force", action="store_true", help="approve flagged drafts too")
    p.set_defaults(func=cmd_approve)

    p = sub.add_parser("reject", help="kill drafts")
    p.add_argument("ids", nargs="+")
    p.add_argument("--reason", default="rejected by hand")
    p.set_defaults(func=cmd_reject)

    p = sub.add_parser("export", help="write review.md")
    p.add_argument("-o", "--output", default="review.md")
    p.add_argument("--channel", choices=sorted(prospects_mod.CHANNELS))
    p.set_defaults(func=cmd_export)

    p = sub.add_parser("send", help="send approved email drafts")
    p.add_argument("--limit", type=int)
    p.add_argument("--yes", action="store_true", help="actually send (default is a preview)")
    p.set_defaults(func=cmd_send)

    p = sub.add_parser("status", help="counts and what's left to do")
    p.set_defaults(func=cmd_status)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (ConfigError, ProspectError) as exc:
        _err(str(exc))
        return 1
    except KeyboardInterrupt:
        print("\ninterrupted", file=sys.stderr)
        return 130


if __name__ == "__main__":
    sys.exit(main())
