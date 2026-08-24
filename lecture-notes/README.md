# Lecture Notes

Hit one button when the professor starts talking. Get back notes with the key
concepts, the formulas as stated, the assignments mentioned out loud, and —
most usefully — every moment the professor signalled something would be on the
exam. Every line of notes is a button that replays the audio of that sentence.

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
| `DEEPGRAM_API_KEY`  | Transcription           | **Recommended.** No file size limit, labels speakers, handles a full lecture in one request.       |
| `OPENAI_API_KEY`    | Transcription, fallback | Used only if Deepgram isn't set. Whisper caps uploads at 25 MB — roughly 70 minutes of audio here. |

A typical 75-minute lecture costs a few cents to transcribe and a few more to
turn into notes. Check current pricing before you commit to a provider; these
rates move.

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

**Don't deploy this to Vercel's serverless functions without thinking about
upload size.** A one-hour recording is around 22 MB, and Vercel's request body
limit is 4.5 MB, so the transcription upload will fail. Use a host that takes
large request bodies — Fly.io, Railway, Render, a small VPS, or a Raspberry Pi
on your desk. `npm run build && npm run start` is all it needs.

If you're set on Vercel, the fix is to upload audio straight from the browser to
object storage and hand the transcription API a URL instead of a file. That's a
real change, not a config flag.

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
3. Hit **★ Mark this moment** whenever something lands as important. Those
   timestamps are fed to the notes pass as high-signal moments, and they get
   their own tab afterward.
4. **Stop** → you land on the lecture → **Transcribe & write notes**. Give it a
   couple of minutes for a full lecture and leave the tab open.

Afterwards, every timestamp in the notes seeks the recording. The search box on
the Library page searches the full text of every lecture you've transcribed,
which is the thing you actually want the week before finals.

Storage adds up — an hour is ~22 MB and a semester of one course is over a
gigabyte. Any lecture page has **Delete audio, keep notes** for once you've
studied it.

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
lib/
  recorder.ts               MediaRecorder, wake lock, level meter, chunked saves
  db.ts                     IndexedDB: lectures, chunks, audio, results
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
professor phrased them, formulas only if actually stated aloud, exam signals
graded by confidence, and a list of words the transcriber probably got wrong.
Every item carries the second it was said. If the notes ever feel generic, the
prompt in that file is the thing to edit.

## Not built yet

- **Slide and whiteboard photos.** Audio misses everything written down, and
  this is the biggest quality gain still on the table: attach a photo to a
  timestamp and hand it to the model alongside the transcript.
- **Background recording on iOS.** Needs a native app or a Shortcut that records
  via Voice Memos and uploads afterwards.
- **Export.** Notes live in the browser; there's no PDF or Markdown out yet.
