# Prospect outreach

Reads a prospect list, drafts a personalized message for each one with Claude,
shows them to you, and sends the approved email drafts over SMTP.

Nothing sends without you approving it first, twice: once with `approve`, once
with `send --yes`.

## What this does and does not automate

| Step | Automated? |
| --- | --- |
| Read the prospect list | yes |
| Draft a personalized message per prospect | yes |
| Review and edit | **you**, by hand |
| Send email | yes, after approval |
| Send LinkedIn DMs | **no — see below** |
| Send Facebook DMs | **no — see below** |

**LinkedIn has no API for this.** Messaging endpoints are gated behind partner
programs (Sales Navigator, Recruiter, and similar) that a small business is not
going to be admitted to. There is no general-access "send a message to this
person" endpoint. Automating it with scrapers or browser bots violates the
LinkedIn User Agreement clause prohibiting bots and automated methods, and the
enforcement is account restriction or a permanent ban — of the personal account
you'd be relying on for the outreach in the first place.

**Facebook has no API for this either.** The Messenger Platform only lets a Page
message someone who messaged the Page first, inside a 24-hour window, plus a few
narrow message tags for things like confirmed appointments. Cold outreach isn't
a supported case.

So for those two channels this tool drafts the message and hands you finished
text plus the profile URL. You paste and send. In practice that's ~10 seconds
per message and it's the part platforms actually permit.

Email is different: it's an open protocol, cold commercial email is legal in the
US under CAN-SPAM, and sending it from your own mailbox is fully automatable.
That's the channel this tool sends on.

## Setup

```bash
cd scripts/outreach
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp config.example.toml config.toml
cp data/prospects.example.csv data/prospects.csv
cp data/suppression.example.txt data/suppression.txt
```

Edit `config.toml` — especially `[sender]`, which is the complete set of claims
the drafter may make about your business.

Two credentials, both from the environment, neither in any file:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OUTREACH_SMTP_PASSWORD=...   # Gmail: an App Password, not your login
```

For Gmail you need 2-Step Verification on, then create an App Password at
myaccount.google.com → Security → App passwords.

## The prospect list

`data/prospects.csv`:

| column | required | what it's for |
| --- | --- | --- |
| `id` | yes | your key for this person, any unique string |
| `name` | yes | who they are |
| `channel` | yes | `email`, `linkedin`, or `facebook` |
| `email` | for email | where it goes |
| `profile_url` | for social | where you'll paste it |
| `company`, `role`, `city` | no | context for the draft |
| `note` | **effectively yes** | see below |
| `source` | no | where you found them |

**`note` is the whole ballgame.** It's the specific thing you observed about
this person — the storm damage they posted about, the permit they filed, the
question they asked in a local group. The drafter builds the message around it.

Leave it blank and you get a generic message flagged `low` confidence with an
empty hook, because the alternative is inventing a detail about a stranger's
house. The tool won't do that. A list of 15 rows with real notes will out-earn
500 rows without them, and it won't get your domain blocked.

## Using it

```bash
python -m outreach draft              # write drafts for everyone new
python -m outreach list               # see what's there; ! = read this one
python -m outreach show lead-001      # full text, exactly as it'll arrive
python -m outreach edit lead-001      # fix it in $EDITOR
python -m outreach approve lead-001 lead-002
python -m outreach send               # preview only — nothing sends
python -m outreach send --yes         # actually send
python -m outreach status
```

Reviewing away from the terminal:

```bash
python -m outreach export             # writes review.md
# tick the boxes of the ones you like, save
python -m outreach approve --from-review review.md
```

Useful flags: `draft --limit 5` to test on a few, `draft --channel email`,
`draft --only lead-003`, `draft --redraft` to rewrite existing drafts.

Editing an approved draft sends it back to `drafted` — an edited message hasn't
been approved.

## Guardrails

- **Two-step approval.** `approve` then `send --yes`. `send` on its own only
  prints what it would do.
- **Flagged drafts.** Anything with no personalization hook or low confidence is
  marked `!` and `approve` refuses it until you pass `--force`.
- **Suppression list.** Checked when drafting and again at send time, so an
  approved message is still held back if you add the address in between. When
  someone says no, put them in `data/suppression.txt` that day.
- **Rate limits.** `daily_limit` (default 40) and `min_seconds_between`
  (default 45s). Slow and small looks like a person; fast and large gets your
  domain filtered.
- **Footer.** Every email gets your name, phone, postal address, and opt-out
  line appended by the sender, not the model, so it can't be paraphrased away.
- **No invented facts.** The system prompt restricts claims to `[sender]` and
  the prospect row. No fake referrals, prior conversations, deadlines,
  discounts, statistics, or details about the prospect's property.

## Legal, briefly and non-authoritatively

US commercial email under CAN-SPAM: honest From and Subject, identify it as an
ad, include a valid physical postal address, give a working opt-out, honor
opt-outs within 10 business days. Penalties run per individual email. This tool
handles the mechanics; the accuracy of what you claim is on you.

If you're emailing anyone in the EU or UK, GDPR/PECR are a much higher bar than
CAN-SPAM — consent-based rather than opt-out — and this tool does not get you
there. Talk to someone qualified first.

## Cost

One Opus 5 call per draft, a few hundred tokens each way. The business profile
is cached across a run, so a batch pays for it once. A 50-prospect run is cents.
Drop `claude.effort` to `low` if the drafts read fine to you.

## Files

```
config.toml            your details          (gitignored)
data/prospects.csv     your list             (gitignored)
data/suppression.txt   do-not-contact        (gitignored)
state/outbox.json      every draft + status  (gitignored)
outreach/config.py     config loading
outreach/prospects.py  CSV parsing, validation, suppression
outreach/drafter.py    the Claude call
outreach/store.py      draft state
outreach/mailer.py     SMTP
outreach/cli.py        commands
```

The outbox is the record of what was sent to whom and when. Keep it.
