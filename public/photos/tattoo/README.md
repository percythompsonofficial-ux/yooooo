# InkdUpJo photos

## What's here

| File | Used for |
| --- | --- |
| `brand-logo.png` | The logo mark, in the header and footer |
| `work-proverbs.jpg` | Proverbs 13:4 |
| `work-in-his-time.jpg` | When the Time Is Right |
| `work-no-mercy.jpg` | Protect · Respect · Mercy |
| `work-madonna.jpg` | Madonna |
| `work-sun-sleeve.jpg` | Sun & Lilies |
| `hero-sleeve.webm` / `.mp4` | The looping homepage hero clip |
| `hero-sleeve-poster.jpg` | Still shown before the clip loads, and instead of it under reduced motion |

All five were processed from the artist's originals: Instagram app chrome
cropped off the two screenshots, the logo cropped to its circle, and
everything resized to a 1400px long edge. The two originals were 6MB PNGs;
they are now ~130KB JPEGs.

## Still needed

- `work-dragon.jpg` — the colour dragon and hibiscus
- `artist-jo.jpg` — a portrait of Jo for the artist section

## Video

The hero clip came from a phone screen recording of an Instagram post: 17MB,
1180x2556, 60fps, with the app's status bar, post header, caption and mute
button in frame. Processing, for reference if another clip is added:

1. Crop away the app chrome — `crop=1180:1670:0:480`
2. Skip the blown-out opening frames — `-ss 0.7`
3. Play forward then reversed, so the loop never visibly jumps back
4. Encode twice — WebM/VP9 and MP4/H.264, since Safari and iOS need the MP4
5. Drop the audio track, which autoplay requires anyway
6. Pull a poster frame from a well-exposed moment

17MB became ~1MB per format. Keep any replacement under about 2MB.

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
