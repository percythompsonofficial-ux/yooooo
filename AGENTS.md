<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design work: use both design skills together

Any UI, page, component, or visual-design task uses **both** of these skills, in this order:

1. **`frontend-design`** (`.claude/skills/frontend-design/`) — sets the direction. Brainstorm a compact
   token plan first (4–6 named hex values, a display/body/utility type pairing, a layout concept, and one
   signature element), then review that plan against the brief and revise anything that reads as a
   generic default before writing code.
2. **`ui-ux-pro-max`** (`.claude/skills/ui-ux-pro-max/`) — supplies the evidence. Query the local
   database for concrete styles, palettes, font pairings, UX guidelines, charts, and stack-specific
   patterns, e.g. `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>"`.

`frontend-design` decides the point of view; `ui-ux-pro-max` grounds and validates it. Do not use one
without the other on design work.
