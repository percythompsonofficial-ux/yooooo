# Iron Tide Tattoo photos

The site ships with original drawn flash for every visual, so it looks
finished with no photographs at all. Add real photos whenever you have them.

## Adding a photo

1. Drop the image file in this folder, e.g. `hero.jpg`, `artist-mara.jpg`.
2. Point the matching entry in `lib/tattoo-site.ts` at it:

   ```ts
   photo: "/photos/tattoo/artist-mara.jpg",
   ```

The photo then replaces the flash automatically, and falls back to the flash
if it ever fails to load.

The `photo` fields are deliberately empty until then — an empty value means
the browser makes no image request at all, instead of hunting for a file that
isn't there on every page load.

## Slots

| Where | Suggested file | Crop |
| --- | --- | --- |
| Homepage hero | `hero.jpg` | landscape, 2000px+ wide |
| Artists | `artist-mara.jpg`, `artist-theo.jpg`, `artist-june.jpg` | portrait, 3:4 |

Flash designs on the Work page are drawn artwork, not photos — they need no
files.
