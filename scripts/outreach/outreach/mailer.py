"""Sending approved email drafts over SMTP.

Only email is sent from here. LinkedIn and Facebook drafts are exported for a
human to paste, because neither platform offers a sanctioned way to send a cold
message through an API — see the README.
"""

from __future__ import annotations

import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid

from .config import Config


class SendError(Exception):
    pass


def compose(config: Config, record: dict) -> EmailMessage:
    s = config.sender
    prospect = record["prospect"]

    # CAN-SPAM: every commercial message needs a working opt-out and a real
    # postal address. Appended here rather than in the draft so it can never be
    # paraphrased away by the model.
    footer = f"\n\n--\n{s.person}, {s.role}\n{s.business}\n{s.phone}"
    if s.website:
        footer += f"\n{s.website}"
    footer += f"\n{s.mailing_address}\n\n{s.unsubscribe_line}"

    message = EmailMessage()
    message["From"] = formataddr((config.email.from_name, config.email.username))
    message["To"] = formataddr((prospect.get("name", ""), prospect["email"]))
    message["Subject"] = record["subject"]
    message["Reply-To"] = config.email.reply_to or s.email
    message["Message-ID"] = make_msgid()
    message["List-Unsubscribe"] = f"<mailto:{s.email}?subject=Unsubscribe>"
    message.set_content(record["body"] + footer)
    return message


class Mailer:
    def __init__(self, config: Config):
        self.config = config
        self.smtp: smtplib.SMTP | None = None

    def __enter__(self) -> "Mailer":
        cfg = self.config.email
        password = cfg.password  # raises before we open a connection if unset
        try:
            self.smtp = smtplib.SMTP(cfg.smtp_host, cfg.smtp_port, timeout=30)
            self.smtp.starttls()
            self.smtp.login(cfg.username, password)
        except smtplib.SMTPAuthenticationError as exc:
            raise SendError(
                f"SMTP rejected the login for {cfg.username}. For Gmail you need "
                "an App Password with 2-Step Verification on, not your normal "
                f"password. ({exc.smtp_code})"
            ) from exc
        except OSError as exc:
            raise SendError(
                f"could not reach {cfg.smtp_host}:{cfg.smtp_port} — {exc}"
            ) from exc
        return self

    def __exit__(self, *exc_info) -> None:
        if self.smtp is not None:
            try:
                self.smtp.quit()
            except Exception:
                pass
            self.smtp = None

    def send(self, record: dict) -> str:
        if self.smtp is None:
            raise SendError("mailer is not connected")
        message = compose(self.config, record)
        try:
            refused = self.smtp.send_message(message)
        except smtplib.SMTPRecipientsRefused as exc:
            raise SendError(f"recipient refused: {exc.recipients}") from exc
        except smtplib.SMTPException as exc:
            raise SendError(str(exc)) from exc
        if refused:
            raise SendError(f"recipient refused: {refused}")
        return message["Message-ID"]
