# InkdUpJo photos

## What's here

| File | Used for |
| --- | --- |
| `brand-logo.png` | The logo mark, in the header and footer |
| `work-proverbs.jpg` | Proverbs 13:4 |
| `work-in-his-time.jpg` | When the Time Is Right |
| `work-no-mercy.jpg` | Protect · Respect · Mercy |
| `work-madonna.jpg` | Madonna — also the homepage hero |

All five were processed from the artist's originals: Instagram app chrome
cropped off the two screenshots, the logo cropped to its circle, and
everything resized to a 1400px long edge. The two originals were 6MB PNGs;
they are now ~130KB JPEGs.

## Still needed

- `work-dragon.jpg` — the colour dragon and hibiscus
- `work-sleeve-session.jpg` — the sleeve in progress
- `artist-jo.jpg` — a portrait of Jo for the artist section
- a dedicated landscape hero shot, if he'd rather not reuse the Madonna

## Adding one

Drop the file in this folder and point the matching entry in
`lib/tattoo-site.ts` at it:

```ts
photo: "/photos/tattoo/work-dragon.jpg",
```

Each entry also takes `focus` — a CSS object-position such as `"58% 34%"` —
which decides what stays in frame when the 4:5 card crops a tall photo.
Leave it `"center"` unless the subject sits off-centre.

Shoot or crop to portrait 4:5 where you can, and keep the long edge around
1400px. A slot with no photo shows a plain labelled panel, never a stand-in
image.
