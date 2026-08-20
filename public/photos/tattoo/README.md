# Iron Tide Tattoo photos

Every visual slot takes a real photograph. Until one is supplied, the slot
shows the studio's drawn flash instead, so nothing is ever blank.

## Adding a photo

1. Drop the file in this folder — e.g. `work-01.jpg`, `artist-mara.jpg`.
2. Point the matching entry in `lib/tattoo-site.ts` at it:

   ```ts
   photo: "/photos/tattoo/work-01.jpg",
   ```

The photograph then replaces the flash, and falls back to the flash if it
ever fails to load.

`photo` is empty by default on purpose: an empty value means the browser
makes no request at all, rather than hunting each page load for a file that
isn't there yet.

## Slots

| Where | Entry in `lib/tattoo-site.ts` | Crop |
| --- | --- | --- |
| Homepage hero | `src` on the hero `TattooImage` | landscape, 2000px+ wide |
| Artists (3) | `artists[].photo` | portrait, 3:4 |
| Work wall (8) | `flash[].photo` | portrait, 4:5 |

## Shooting notes

- Portrait 4:5 for work shots — the cards crop to that ratio.
- 1600px on the long edge is plenty; larger files just slow the page down.
- Shoot the tattoo filling the frame. Cards are ~350px wide on a laptop, so
  a piece shot from across the room reads as nothing.
- Healed work photographs better than fresh — less redness and shine.
