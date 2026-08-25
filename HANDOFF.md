# InkdUpJo — where things stand

Working notes for picking this back up. Last updated at the end of the
2026-08-20 session.

## What this is

A site for **InkdUpJo** (Tatz by Jo / Spittin Ink Kreations), a real tattoo
artist in Gautier, Mississippi. It lives on the branch
`claude/saved-skills-53bpup`, which is where all work happens — not `main`.

This repo holds three unrelated sites. InkdUpJo took the root:

| Path | Site |
| --- | --- |
| `/`, `/work`, `/artists`, `/booking` | **InkdUpJo** — `app/(tattoo)/` |
| `/songy/*` | lawn care, earlier work — `app/songy/` |
| `/roofing/*` | roofing, earlier work — `app/roofing/` |

`lib/tattoo-site.ts` is the single source of truth for all copy and contact
details. Its header comment marks what is confirmed and what is still
placeholder.

## Deploy — finish this first

**Netlify project `gilded-hummingbird-e8f50c`**, at
`gilded-hummingbird-e8f50c.netlify.app`.

- Production branch is already set to `claude/saved-skills-53bpup`, and auto
  publishing is on — so any push deploys it.
- At the time of writing the *published* build was still the older
  `claude/bbb-lbc94a`. A deploy needs to run against the right branch. Check
  the Deploys page: the "Published" line should read
  `claude/saved-skills-53bpup`.
- **The project is still Private**, so nobody outside the account can open it.
  Project configuration → Visitor access → make it public.
- Optional: Project configuration → Change project name → `inkdupjo`, for a
  URL worth handing to a client.

**Vercel is a mess and is not needed.** Seven separate Vercel projects are
connected to this one repo (`yooooo`, `yooooo-zqve`, `yooooo-1wyq`,
`yooooo-cfmf`, `yooooo-wr6p`, `yooooo-c9x3`, `hey`), plus two empty ones made
on 08-20 (`inkdupjo`, `yooooo-e85f`). Every push builds in all of them, which
exhausted the Hobby plan's daily cap — every deploy now fails with
"Deployment rate limited — retry in 24 hours." The code is fine; this was
verified by cloning the branch fresh and running `npm ci && npm run build`,
which builds all 17 routes clean. Either delete the surplus projects and keep
one, or ignore Vercel entirely now that Netlify works.

## Still open

- **Opening hours** are the last invented detail on the site: "Tue–Sat by
  appointment, Sun–Mon closed." Confirm with the artist.
- **A sharper hero clip.** The current one came from a phone screen recording
  of an Instagram post, so it is soft at source — a capture of an
  already-compressed video, with pan blur. Compression was ruled out as the
  cause by comparing 1:1 crops of source against output. The original file
  from his camera roll would be a real improvement.
- **A portrait of the artist** is optional, not missing. The logo is a drawing
  of him at work and fills that panel deliberately. Set `artists[0].photo` and
  a photograph takes over automatically.
- **The bio is holding copy**, written in his register but not his words.

## Facts, all confirmed from the artist

Phone (228) 918-0536 · 3204 Ladnier Rd, Gautier, MS 39553 ·
Instagram @inkdupjo, shop @spittin_ink_kreations · $50 non-refundable
deposit · 18+ with valid photo ID · booking runs through Instagram DMs.
The price list in `lib/tattoo-site.ts` is his own posted sheet.

**There is no email address.** He does not have one, so none is invented —
the booking form opens a prefilled text to his number instead. Do not add a
placeholder email; an earlier one silently sent enquiries nowhere.

## Design

Near-black ground with teal, red, gold and violet drawn from tattoo ink.
**Pirata One** blackletter for headings, echoing the lettering in his logo;
**Pinyon Script** for the small line above each heading, echoing the script in
his tattoos; Space Grotesk for body, IBM Plex Mono for labels and prices.

Fonts are **self-hosted** in `public/fonts` with `app/fonts.css` — not loaded
from Google. Keep it that way: it removes a third-party request, and the
sandbox cannot reach fonts.googleapis.com, so screenshots taken here would
otherwise silently show fallback faces.

Per `AGENTS.md`, design work uses the `frontend-design` and `ui-ux-pro-max`
skills together.

## Things that bit, worth not rediscovering

- **Blackletter cannot be uppercase** and Pirata One ships one weight, so no
  `uppercase` or weight utilities on anything using `font-display`.
- **`TattooImage` sets `relative` only when the caller has not passed a
  position class.** Passing both collapses the box to 0×0.
- **A cached image can finish loading before React attaches `onLoad`**, which
  used to leave photos at `opacity: 0` — present in the DOM, invisible on
  screen. `TattooImage` checks `complete` on mount to cover it.
- **Empty photo slots make no request.** An empty `photo` is deliberate; do
  not point it at a file that does not exist.
- **Headless Chromium here has no H.264.** The hero ships WebM *and* MP4 —
  Safari and iOS need the MP4, and testing with only MP4 fails locally with
  `DEMUXER_ERROR_NO_SUPPORTED_STREAMS`. Keep both.

## The shareable demo

`https://claude.ai/code/artifact/407d9802-db24-4bd0-8a2d-d7eadb06d788` — a
self-contained four-page snapshot, every asset inlined, no server needed.
**It is private until shared from the artifact page's share menu.**

Rebuild it by serving the site locally and running the builder kept in the
scratchpad (`build-demo.mjs`): it captures all four routes after a full
scroll, embeds each asset once in a shared map, and reimplements the gallery
filter and nav in plain JS since React is stripped out. Two traps: freeze the
DOM only after scrolling, or lazy images freeze mid-fade at `opacity: 0`; and
set `muted` as a property on the video, since React never writes it as an
attribute and an unmuted video is refused autoplay.
