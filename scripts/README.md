# Lead finder: businesses with a phone and no website

Finds home-services and trades businesses across **North Carolina, South
Carolina and Virginia** that have a phone number but **no website**, and writes
them to a CSV you can dial straight from.

## Why the "no website" signal is trustworthy

Searching the web for businesses without websites is self-defeating: search
engines surface businesses *because* they have web presence, so anything you
find that way is biased toward the businesses you don't want, and absence of a
site is never actually proven.

This script inverts that. The Google Places API returns a `websiteUri` field
only when Google has a website on file for a place. A place that comes back
with a `nationalPhoneNumber` and **no** `websiteUri` is Google itself reporting
that it has no site. That's a property of the record, not a guess.

One caveat worth knowing before you dial: a business with no website often
still runs a Facebook page, and Google sometimes files that Facebook URL in
`websiteUri` (in which case the business is excluded here) and sometimes
doesn't (in which case it shows up as a lead). So the list is "no real
website," not "no internet presence at all." For a missed-calls pitch that's
the right target either way.

## Setup

1. Create a project in the [Google Cloud console](https://console.cloud.google.com/).
2. Enable **Places API (New)** — not the legacy Places API.
3. Create an API key, and restrict it to the Places API.
4. **Set a daily quota cap** on the key before any large run.

```bash
export GOOGLE_MAPS_API_KEY=your_key_here
```

## Usage

Always start with a dry run — it costs nothing and shows the request count:

```bash
node scripts/find-leads.mjs --dry-run
```

A modest first sweep:

```bash
node scripts/find-leads.mjs --states NC --cities-per-state 10 --min-reviews 3
```

The full three-state sweep (needs `--yes`, it's ~900 billed requests):

```bash
node scripts/find-leads.mjs --yes
```

### Flags

| Flag | Meaning | Default |
| --- | --- | --- |
| `--states` | States to sweep | `NC,SC,VA` |
| `--categories` | `core` (10 trades), `extended` (30 more), `all`, or your own comma-separated terms | `core` |
| `--cities-per-state` | Cities per state | `15` |
| `--small-markets` | Work up from the smallest towns instead of the largest | off |
| `--max-pages` | Result pages per query, 1–3 (20 each) | `2` |
| `--min-reviews` | Drop places below N reviews — filters dead listings | `0` |
| `--delay` | Milliseconds between requests | `250` |
| `--out` | Output directory | `leads-output` |
| `--no-cache` | Re-query everything instead of reading the cache | off |
| `--dry-run` | Print the plan, call nothing | off |
| `-y, --yes` | Skip the confirmation on runs over 500 requests | off |

## Output

`leads-output/leads.csv` — one row per distinct phone number:

| column | notes |
| --- | --- |
| `name` | Business name |
| `phone` | What you dial |
| `address`, `city`, `state` | Location |
| `categories` | Every search category this number surfaced under |
| `google_type` | Google's own classification |
| `rating`, `reviews` | Review volume is your best proxy for how real and busy they are |
| `place_id` | Stable Google id, for re-checking later |

Also written: `leads.json` (same data) and `cache.json` (raw responses).

## Cost control

`websiteUri` and `nationalPhoneNumber` are both Enterprise-SKU fields on Text
Search — there is no cheaper way to ask whether a business has a website, so
plan around it. Check the current Places API pricing and free monthly tier
before scaling up.

Three things keep spend down:

- **The cache.** Responses are saved per query in `leads-output/cache.json`.
  Re-running is free for anything already fetched, so an interrupted sweep
  resumes without re-billing. Delete the file or pass `--no-cache` for fresh data.
- **The confirmation guard.** Runs over 500 requests refuse to start without `--yes`.
- **`--dry-run`.** Always check the request count first.

## Working the list

`--small-markets` is the highest-yield setting. The share of trades businesses
with no website climbs steeply outside the metros — a plumber in Charlotte
almost certainly has a site, one in Bennettsville often doesn't.

Sort the CSV by `reviews` descending. A business with 40 reviews, no website,
and a phone number is one that is visibly busy and taking every job by phone —
which is exactly the missed-call problem worth calling about.
