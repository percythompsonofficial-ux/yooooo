# Lecture Notes

Hit one button when the professor starts talking. Snap a photo whenever
something goes up on the board. Get back notes with the key concepts, the
formulas as stated, the assignments mentioned out loud, and — most usefully —
every moment the professor signalled something would be on the exam. Every line
of notes is a button that replays the audio of that sentence.

Recordings never leave your device. Audio is sent once, in transit, to a
transcription API, and is stored only in your browser.

## Setting it up

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev
```

You need two keys:

| Key                 | What for                | Notes                                                                                            |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `ANTHROPIC_API_KEY` | Writing the notes       | Required.                                                                                         |
| `ANTHROPIC_MODEL`   | Which model writes them | Optional. Defaults to `claude-sonnet-5`; set `claude-opus-5` to spend more for sharper judgement.  |
| `APP_PASSWORD`      | Locking the deployment  | Required in production, ignored locally. See [The password](#the-password).                        |
| `DEEPGRAM_API_KEY`  | Transcription           | **Recommended.** No file size limit, labels speakers, handles a full lecture in one request.       |
| `OPENAI_API_KEY`    | Transcription, fallback | Used only if Deepgram isn't set. Whisper caps uploads at 25 MB — roughly 70 minutes of audio here. |

Deepgram's free credit is generous enough that transcription is effectively
free for a long time. The notes pass is the part that costs money — on the
default Sonnet model, roughly 10-25 cents for a 75-minute lecture, more if you
photographed a lot of slides. Switching `ANTHROPIC_MODEL` to `claude-opus-5`
roughly doubles that.

Check current pricing before you rely on those numbers; these rates move.

## Getting it onto your phone

This matters more than it sounds, because **browsers only allow microphone
access over HTTPS** (or on `localhost`). Opening `http://192.168.1.x:3000` on
your phone will not work — the record button will fail with a permission error.

Pick one:

- **A tunnel, for trying it out.** `cloudflared tunnel --url http://localhost:3000`
  or `ngrok http 3000` gives you an HTTPS URL that works on your phone
  immediately, as long as your laptop stays awake and running the dev server.
- **Deploy it, for actually using it.** See below.

Once it loads over HTTPS, add it to your home screen (Share → Add to Home
Screen on iOS, Install app on Android). It opens without a URL bar and behaves
like an app.

## Deploying it

Deploying is optional — importing a voice memo works fine at `localhost`. Deploy
when you want the app on your phone: an HTTPS URL is what unlocks in-browser
recording, live star marks, and slide photos taken during class.

**Do not use serverless.** A one-hour recording is 20-30 MB and Vercel's request
body limit is 4.5 MB, so the upload fails. A plain container has no such cap —
verified with a 30 MB upload straight through the transcribe route.

A `Dockerfile` and `fly.toml` are included. On [Fly.io](https://fly.io):

```bash
fly launch --no-deploy          # pick a name; keeps the included fly.toml
fly secrets set ANTHROPIC_API_KEY=sk-ant-... DEEPGRAM_API_KEY=...
fly deploy
```

That gives you `https://your-app.fly.dev`. Open it on your phone and add it to
the home screen. The config scales to zero between classes, so you pay for the
minutes you actually use rather than for idling.

The same image runs anywhere that takes a container — Railway, Render, a VPS,
a Raspberry Pi on your desk. Set the two keys as environment variables and
expose port 3000.

### The password

A deployed URL will eventually be found, and the thing worth protecting is not
the lectures — it's your API keys. So set one:

```bash
fly secrets set APP_PASSWORD='a-long-random-phrase'
```

**In production this is mandatory, not advisory.** Without `APP_PASSWORD` the
app refuses to run and the transcription and notes routes return 501 rather
than quietly serving anyone who finds the host. Locally (`npm run dev`) no
password is asked for at all.

Signing in sets an HttpOnly cookie holding a value derived from the password,
not the password itself, and it lasts about six months. **Lock** in the header
clears it.

Make the password long. There's no lockout after a wrong guess — only a small
delay — so length is what actually protects you. A four-word phrase is plenty;
`hunter2` is not.

There are no user accounts, and there's nothing to separate: lectures live in
the browser's own storage, so signing in from another device shows an empty
library rather than someone else's notes.

## Recording on iPhone — read this once

Safari stops recording when you lock the screen or switch apps. The app holds a
screen wake lock while recording, which prevents the usual auto-lock, but it
can't survive Low Power Mode or you manually pressing the side button.

So: leave the phone face-up on the desk with the recording screen open, and turn
Low Power Mode off before class.

The app is built assuming this will eventually go wrong anyway. Audio is written
to IndexedDB **every five seconds**, so an interruption costs you seconds, not
the lecture. Reopen the app and the interrupted recording is waiting on the home
screen with a Recover button.

Android Chrome is considerably more forgiving, but the same safety net applies.

## Using it

1. Type the course (it remembers the last one), hit **Record**.
2. Watch the level meter move. If it's flat, the microphone isn't hearing the
   room and you want to know that now rather than tonight.
3. Hit **★ Mark this** whenever something lands as important. Those timestamps
   are fed to the notes pass as high-signal moments, and they get their own tab
   afterward.
4. Hit **Slide** to photograph the board. Take one whenever the professor writes
   something down — see below for why this matters more than it sounds.
5. **Stop** → you land on the lecture → **Transcribe & write notes**. Give it a
   couple of minutes for a full lecture and leave the tab open.

Afterwards, every timestamp in the notes seeks the recording. The search box on
the Library page searches the full text of every lecture you've transcribed,
which is the thing you actually want the week before finals.

Storage adds up — an hour is ~22 MB and a semester of one course is over a
gigabyte. Any lecture page has **Delete audio, keep notes** for once you've
studied it.

## Importing a recording made elsewhere

**This is the most reliable way to use the app, and it needs no deployment at
all.** Record the lecture in your phone's Voice Memos, then import the file.

The phone's own recorder beats any browser: it runs in the background, so you
can lock the screen, text, and put the phone in your pocket while it records.
The browser can't do that. For a lecture you cannot afford to lose, record it
there.

Afterwards:

1. Get the file onto the machine running this app. In Voice Memos: tap the
   recording → **…** → **Share** → AirDrop to a Mac, or Mail it to yourself.
2. Run the app locally — `npm run dev`, then open `http://localhost:3000`.
   **localhost counts as a secure context, so no HTTPS, no tunnel, no deploy.**
3. Click **Or import a recording from Voice Memos** and pick the file.
4. **Transcribe & write notes.**

The lecture is dated from the file's own timestamp, so the library still sorts
by when the class happened rather than when you got round to importing it.

Two things only in-browser recording gives you: star marks during class, and
slide photos pinned to the second. You can still add photos after the fact from
the Slides tab — scrub the audio to the right moment first, and the photo pins
itself there.

## Photographing the board

**This is the single biggest quality difference in the app.** A lecture is only
half spoken. The professor writes a formula, turns around, and says "so this
gives us that" — and a transcript preserves none of it. One photo recovers the
whole thing.

The **Slide** button opens a viewfinder *inside the page*. That's deliberate and
not the obvious implementation: the normal way to take a photo on the web is
`<input type="file" capture>`, which hands off to the system camera app and
backgrounds the tab. On iOS that suspends the page and gives the microphone to
the camera — so the obvious version would end your recording every time you
photographed a slide. The in-page viewfinder never leaves the page, and the
audio stream is untouched.

Photos are timestamped with the moment you took them, resized to 1568px on the
long edge, and stored as JPEG — around 200 KB each rather than the four
megabytes your camera produces.

They then go to the notes pass alongside the transcript, where they're used to:

- Fill in a **From the board** section transcribing what was written.
- Recover **formulas that were written but never said** — those get tagged
  `from a photo` in the notes.
- **Settle garbled transcription.** A photo showing "Kakutani" resolves what the
  transcriber heard as "cocotini".

You can also add photos after class from the **Slides** tab — scrub the audio to
the right moment first, and the photo pins itself there.

Each photo adds input tokens to the notes request, so a heavily photographed
lecture costs more than a bare one. Thirty photos is a normal upper bound; past
forty the request is rejected and asks you to delete near-duplicates.

## Permission

Many universities require the professor's consent to record a lecture, and some
states require consent from everyone in the room. Ask once at the start of the
semester. Professors almost always say yes.

## How it's put together

```
app/
  page.tsx                  the recorder
  lectures/page.tsx         library + full-text search across every lecture
  lectures/[id]/page.tsx    one lecture: audio, notes, transcript, starred
  api/transcribe/route.ts   audio -> timestamped segments (Deepgram or Whisper)
  api/notes/route.ts        transcript -> structured notes (Claude)
components/
  SlideCamera.tsx           in-page viewfinder, so photographing never
                            backgrounds the tab and kills the recording
lib/
  recorder.ts               MediaRecorder, wake lock, level meter, chunked saves
  images.ts                 EXIF-correct resize to 1568px, JPEG
  db.ts                     IndexedDB: lectures, chunks, audio, slides, results
  notes-schema.ts           the note structure, as a Zod schema
  pipeline.ts               transcribe -> notes, resumable
```

Two pieces carry most of the weight:

**`lib/recorder.ts`** flushes audio to disk every five seconds instead of
holding it in memory, disables echo cancellation and noise suppression (both are
tuned for a phone at your face and will gate out a distant lecturer), and leaves
automatic gain on, which is what rescues a quiet professor.

**`app/api/notes/route.ts`** is where the quality lives. The schema in
`lib/notes-schema.ts` asks for specific things — definitions phrased the way the
professor phrased them, formulas only if stated aloud or legible in a photo,
exam signals graded by confidence, and a list of words the transcriber probably
got wrong. Every item carries the second it was said. Slide photos are
interleaved into the request as image blocks, each labelled with its timestamp.
If the notes ever feel generic, the prompt in that file is the thing to edit.

## Not built yet

- **Background recording on iOS.** Needs a native app or a Shortcut. Until
  then, record in Voice Memos and import the file (see above).
- **Export.** Notes live in the browser; there's no PDF or Markdown out yet.
- **Automatic slide detection.** Right now you press the button. Watching the
  camera for a stable, changed frame could take the photo for you.
