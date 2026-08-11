"""Drafting messages with Claude.

The system prompt is identical for every prospect in a run, which is deliberate:
it sits behind a cache breakpoint, so a 200-prospect run pays for the business
profile once instead of 200 times. Only the prospect record varies.
"""

from __future__ import annotations

import json

import anthropic

from .config import Config
from .prospects import Prospect

DRAFT_SCHEMA = {
    "type": "object",
    "properties": {
        "subject": {
            "type": "string",
            "description": (
                "Email subject line, 60 characters or fewer. Empty string for "
                "linkedin and facebook messages, which have no subject."
            ),
        },
        "body": {
            "type": "string",
            "description": "The message body, ready to send as written.",
        },
        "personalization_basis": {
            "type": "string",
            "description": (
                "The exact fact from the prospect record that this message is "
                "built on. Empty string if the record contained nothing specific "
                "enough to personalize with."
            ),
        },
        "confidence": {
            "type": "string",
            "enum": ["high", "medium", "low"],
            "description": (
                "How well this message fits this specific person. 'low' means a "
                "human should rewrite it before sending."
            ),
        },
    },
    "required": ["subject", "body", "personalization_basis", "confidence"],
    "additionalProperties": False,
}


class DraftError(Exception):
    pass


def build_system_prompt(config: Config) -> str:
    s = config.sender
    v = config.voice

    facts = [f"Business: {s.business}"]
    if s.description:
        facts.append(f"What they do: {s.description}")
    facts.append(f"Sender: {s.person}, {s.role}")
    facts.append(f"Phone: {s.phone}")
    facts.append(f"Email: {s.email}")
    if s.website:
        facts.append(f"Website: {s.website}")
    if s.service_area:
        facts.append(f"Service area: {', '.join(s.service_area)}")
    if s.proof_points:
        facts.append("Verified proof points: " + "; ".join(s.proof_points))
    if s.offer:
        facts.append(f"The offer: {s.offer}")

    avoid = v.avoid or [
        "Hope this email finds you well",
        "I wanted to reach out",
        "circle back",
        "synergy",
        "game-changer",
        "quick question (when it isn't)",
    ]

    return f"""You write one-to-one outreach messages on behalf of a small local business.

THE ONLY THINGS YOU MAY CLAIM ABOUT THE SENDER
{chr(10).join("- " + f for f in facts)}

VOICE
{v.tone}
Never use these phrases: {", ".join(avoid)}.

HOW TO WRITE ONE
- Open with the specific thing in the prospect's `note`, in your own words. That
  observation is the entire reason this message isn't spam — lead with it.
- Say in one sentence what you can do about it. Concrete, not a pitch.
- Make one ask, and make it small: a reply, a time, a yes/no. Never ask for a
  meeting and a call and a website visit in the same message.
- Close with the sender's name and phone.
- Email body: {v.max_words_email} words maximum. LinkedIn and Facebook: {v.max_words_social} words maximum.
- Write the way a busy owner types: short sentences, contractions, no headers,
  no bullet lists, no bold. One or two short paragraphs.

RULES YOU DO NOT BREAK
- Every factual claim must come from the sender facts above or the prospect
  record you are given. Nothing else exists.
- Never invent: a referral or mutual connection, a prior call or email, a
  deadline, a discount, an award, a statistic, a review, or any detail about the
  prospect's property, home, company, or situation that is not in the record.
- If the `note` field is empty or too vague to build on, do not manufacture a
  hook. Write a short honest message that says plainly why you're reaching out,
  set `personalization_basis` to an empty string, and set `confidence` to "low".
- No false urgency, no "just following up" or "as promised" when there was no
  prior contact, no flattery you cannot support from the record.
- Subject lines must describe the message honestly. No "Re:" or "Fwd:" on a
  first contact, no all caps, no fake personal-favor framing.
- Do not add an unsubscribe line, a postal address, or a signature block. The
  sending program appends those.

Return only the structured object."""


def build_user_prompt(prospect: Prospect, config: Config) -> str:
    limit = (
        config.voice.max_words_email
        if prospect.channel == "email"
        else config.voice.max_words_social
    )
    record = {k: v for k, v in prospect.as_record().items() if v}
    return (
        f"Write one {prospect.channel} message for this prospect.\n\n"
        f"```json\n{json.dumps(record, indent=2, ensure_ascii=False)}\n```\n\n"
        f"Body limit: {limit} words. "
        + (
            "Include a subject line."
            if prospect.channel == "email"
            else "Leave `subject` empty — this channel has no subject line."
        )
    )


class Drafter:
    def __init__(self, config: Config, client: anthropic.Anthropic | None = None):
        self.config = config
        self.client = client or anthropic.Anthropic()
        self.system_prompt = build_system_prompt(config)
        # Server-side fallbacks route a safety-classifier refusal to another
        # model instead of handing us back an empty response. If the account
        # doesn't have the beta, we notice once and stop asking.
        self._fallbacks = True

    def _create(self, user_prompt: str):
        kwargs = dict(
            model=self.config.claude.model,
            max_tokens=self.config.claude.max_tokens,
            system=[
                {
                    "type": "text",
                    "text": self.system_prompt,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            output_config={
                "effort": self.config.claude.effort,
                "format": {"type": "json_schema", "schema": DRAFT_SCHEMA},
            },
            messages=[{"role": "user", "content": user_prompt}],
        )
        if self._fallbacks:
            try:
                return self.client.beta.messages.create(
                    betas=["server-side-fallback-2026-07-01"],
                    fallbacks="default",
                    **kwargs,
                )
            except anthropic.BadRequestError:
                self._fallbacks = False
        return self.client.messages.create(**kwargs)

    def draft(self, prospect: Prospect) -> dict:
        """Return {subject, body, personalization_basis, confidence}."""
        response = self._create(build_user_prompt(prospect, self.config))

        if response.stop_reason == "refusal":
            category = getattr(response.stop_details, "category", None)
            raise DraftError(f"the model declined to write this one ({category})")
        if response.stop_reason == "max_tokens":
            raise DraftError(
                "ran out of output tokens — raise claude.max_tokens in config.toml"
            )

        text = "".join(
            block.text for block in response.content if block.type == "text"
        )
        if not text.strip():
            raise DraftError("empty response from the model")

        try:
            draft = json.loads(text)
        except json.JSONDecodeError as exc:
            raise DraftError(f"could not parse the response as JSON: {exc}") from exc

        draft["subject"] = draft.get("subject", "").strip()
        draft["body"] = draft.get("body", "").strip()
        if not draft["body"]:
            raise DraftError("the model returned an empty body")
        if prospect.channel != "email":
            draft["subject"] = ""
        return draft
