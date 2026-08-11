"""The outbox: one record per prospect, tracking a draft from written to sent."""

from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

# drafted  -> a message exists, nobody has looked at it
# approved -> a human read it and cleared it to send
# rejected -> a human killed it; never sent, never redrafted by default
# sent     -> handed to the SMTP server
# failed   -> send was attempted and the server refused
STATUSES = ("drafted", "approved", "rejected", "sent", "failed")


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Store:
    def __init__(self, path: Path):
        self.path = path
        self.records: dict[str, dict] = {}
        if path.exists():
            self.records = json.loads(path.read_text(encoding="utf-8"))

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        # Write to a sibling temp file and rename, so an interrupted save can't
        # leave a half-written outbox behind.
        fd, tmp = tempfile.mkstemp(dir=self.path.parent, suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                json.dump(self.records, fh, indent=2, ensure_ascii=False)
                fh.write("\n")
            os.replace(tmp, self.path)
        except BaseException:
            Path(tmp).unlink(missing_ok=True)
            raise

    def get(self, pid: str) -> dict | None:
        return self.records.get(pid)

    def put_draft(
        self,
        prospect: dict,
        subject: str,
        body: str,
        basis: str,
        confidence: str,
        model: str,
    ) -> dict:
        record = {
            "id": prospect["id"],
            "prospect": prospect,
            "channel": prospect["channel"],
            "status": "drafted",
            "subject": subject,
            "body": body,
            "personalization_basis": basis,
            "confidence": confidence,
            "model": model,
            "drafted_at": now(),
            "edited_at": None,
            "approved_at": None,
            "sent_at": None,
            "error": None,
        }
        self.records[record["id"]] = record
        return record

    def set_status(self, pid: str, status: str, **extra) -> dict:
        record = self.records[pid]
        record["status"] = status
        record.update(extra)
        return record

    def by_status(self, *statuses: str) -> list[dict]:
        wanted = set(statuses) or set(STATUSES)
        return [r for r in self.records.values() if r["status"] in wanted]

    def counts(self) -> dict[str, int]:
        out = {s: 0 for s in STATUSES}
        for record in self.records.values():
            out[record["status"]] = out.get(record["status"], 0) + 1
        return out

    def sent_today(self) -> int:
        today = datetime.now(timezone.utc).date().isoformat()
        return sum(
            1
            for r in self.records.values()
            if r["status"] == "sent" and (r.get("sent_at") or "").startswith(today)
        )


def needs_attention(record: dict) -> str | None:
    """Reasons a human should look harder at this draft before approving."""
    if not record.get("personalization_basis"):
        return "no specific hook — this is a generic message"
    if record.get("confidence") == "low":
        return "the drafter flagged low confidence"
    return None
