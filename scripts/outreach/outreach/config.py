"""Configuration loading for the outreach tool.

Everything the drafter is allowed to claim about the business lives here, in one
file, so a message can never assert something the owner didn't sign off on.
"""

from __future__ import annotations

import os
import tomllib
from dataclasses import dataclass, field
from pathlib import Path


class ConfigError(Exception):
    pass


@dataclass
class Sender:
    business: str
    person: str
    role: str
    phone: str
    email: str
    mailing_address: str
    website: str = ""
    description: str = ""
    service_area: list[str] = field(default_factory=list)
    proof_points: list[str] = field(default_factory=list)
    offer: str = ""
    unsubscribe_line: str = "Reply STOP and I won't email you again."


@dataclass
class Voice:
    tone: str = "Plain, direct, local. Like a small business owner typing on a phone."
    max_words_email: int = 130
    max_words_social: int = 90
    avoid: list[str] = field(default_factory=list)


@dataclass
class ClaudeConfig:
    model: str = "claude-opus-5"
    # Drafting a short message is not an intelligence-sensitive task; "medium" is
    # a good starting point. Sweep low/medium/high against your own read of the
    # output before settling.
    effort: str = "medium"
    max_tokens: int = 4000


@dataclass
class EmailConfig:
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    username: str = ""
    from_name: str = ""
    reply_to: str = ""
    daily_limit: int = 40
    min_seconds_between: int = 45
    password_env: str = "OUTREACH_SMTP_PASSWORD"

    @property
    def password(self) -> str:
        pw = os.environ.get(self.password_env, "")
        if not pw:
            raise ConfigError(
                f"No SMTP password. Set {self.password_env} in your environment. "
                "For Gmail this is an App Password, not your account password."
            )
        return pw


@dataclass
class Config:
    sender: Sender
    voice: Voice
    claude: ClaudeConfig
    email: EmailConfig
    root: Path

    @property
    def state_path(self) -> Path:
        return self.root / "state" / "outbox.json"

    @property
    def suppression_path(self) -> Path:
        return self.root / "data" / "suppression.txt"


def _require(table: dict, key: str, where: str) -> str:
    value = table.get(key)
    if not value:
        raise ConfigError(f"[{where}] is missing required key '{key}'")
    return value


def load(path: Path) -> Config:
    if not path.exists():
        raise ConfigError(
            f"No config at {path}. Copy config.example.toml to config.toml and fill it in."
        )
    with path.open("rb") as fh:
        raw = tomllib.load(fh)

    s = raw.get("sender", {})
    sender = Sender(
        business=_require(s, "business", "sender"),
        person=_require(s, "person", "sender"),
        role=s.get("role", "Owner"),
        phone=_require(s, "phone", "sender"),
        email=_require(s, "email", "sender"),
        # CAN-SPAM requires a valid physical postal address in every commercial
        # email. A PO box or registered agent address is fine; nothing is not.
        mailing_address=_require(s, "mailing_address", "sender"),
        website=s.get("website", ""),
        description=s.get("description", ""),
        service_area=s.get("service_area", []),
        proof_points=s.get("proof_points", []),
        offer=s.get("offer", ""),
        unsubscribe_line=s.get(
            "unsubscribe_line", "Reply STOP and I won't email you again."
        ),
    )

    v = raw.get("voice", {})
    voice = Voice(
        tone=v.get("tone", Voice.tone),
        max_words_email=v.get("max_words_email", 130),
        max_words_social=v.get("max_words_social", 90),
        avoid=v.get("avoid", []),
    )

    c = raw.get("claude", {})
    claude = ClaudeConfig(
        model=c.get("model", "claude-opus-5"),
        effort=c.get("effort", "medium"),
        max_tokens=c.get("max_tokens", 4000),
    )

    e = raw.get("email", {})
    email = EmailConfig(
        smtp_host=e.get("smtp_host", "smtp.gmail.com"),
        smtp_port=e.get("smtp_port", 587),
        username=e.get("username", sender.email),
        from_name=e.get("from_name", f"{sender.person}, {sender.business}"),
        reply_to=e.get("reply_to", sender.email),
        daily_limit=e.get("daily_limit", 40),
        min_seconds_between=e.get("min_seconds_between", 45),
        password_env=e.get("password_env", "OUTREACH_SMTP_PASSWORD"),
    )

    return Config(
        sender=sender, voice=voice, claude=claude, email=email, root=path.parent
    )
