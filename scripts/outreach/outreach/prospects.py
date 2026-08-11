"""Reading and validating the prospect list."""

from __future__ import annotations

import csv
import re
from dataclasses import dataclass, field
from pathlib import Path

CHANNELS = {"email", "linkedin", "facebook"}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ProspectError(Exception):
    pass


@dataclass
class Prospect:
    id: str
    name: str
    channel: str
    company: str = ""
    role: str = ""
    email: str = ""
    profile_url: str = ""
    city: str = ""
    note: str = ""
    source: str = ""

    def as_record(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "role": self.role,
            "city": self.city,
            "channel": self.channel,
            "email": self.email,
            "profile_url": self.profile_url,
            "note": self.note,
            "source": self.source,
        }


@dataclass
class LoadResult:
    prospects: list[Prospect] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)


def load(path: Path) -> LoadResult:
    if not path.exists():
        raise ProspectError(f"No prospect list at {path}")

    result = LoadResult()
    seen: set[str] = set()

    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        missing = {"id", "name", "channel"} - set(reader.fieldnames or [])
        if missing:
            raise ProspectError(
                f"{path} is missing required column(s): {', '.join(sorted(missing))}"
            )

        for lineno, row in enumerate(reader, start=2):
            row = {k: (v or "").strip() for k, v in row.items() if k}
            pid = row.get("id", "")
            if not pid:
                result.problems.append(f"line {lineno}: blank id, skipped")
                continue
            if pid in seen:
                result.problems.append(f"line {lineno}: duplicate id '{pid}', skipped")
                continue
            seen.add(pid)

            channel = row.get("channel", "").lower()
            if channel not in CHANNELS:
                result.problems.append(
                    f"line {lineno} ({pid}): channel '{channel}' is not one of "
                    f"{', '.join(sorted(CHANNELS))}, skipped"
                )
                continue

            email = row.get("email", "")
            if channel == "email":
                if not email:
                    result.problems.append(
                        f"line {lineno} ({pid}): channel is email but no address, skipped"
                    )
                    continue
                if not EMAIL_RE.match(email):
                    result.problems.append(
                        f"line {lineno} ({pid}): '{email}' does not look like an address, skipped"
                    )
                    continue
            elif not row.get("profile_url"):
                result.problems.append(
                    f"line {lineno} ({pid}): {channel} prospect has no profile_url — "
                    "you'll have to find them by hand to send"
                )

            if not row.get("note"):
                result.problems.append(
                    f"line {lineno} ({pid}): no note, so the message can only be generic"
                )

            result.prospects.append(
                Prospect(
                    id=pid,
                    name=row.get("name", ""),
                    channel=channel,
                    company=row.get("company", ""),
                    role=row.get("role", ""),
                    email=email,
                    profile_url=row.get("profile_url", ""),
                    city=row.get("city", ""),
                    note=row.get("note", ""),
                    source=row.get("source", ""),
                )
            )

    return result


def load_suppression(path: Path) -> set[str]:
    """Addresses and domains that must never be contacted.

    One entry per line. A bare domain (`@example.com`) suppresses everyone there.
    """
    if not path.exists():
        return set()
    out: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip().lower()
        if line:
            out.add(line)
    return out


def is_suppressed(email: str, suppression: set[str]) -> bool:
    if not email:
        return False
    email = email.lower()
    if email in suppression:
        return True
    domain = "@" + email.split("@")[-1]
    return domain in suppression
