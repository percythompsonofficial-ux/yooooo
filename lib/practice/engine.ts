import { LEADS } from "./leads";
import { buildBeats, handoffOptions, OBJECTIONS } from "./script";
import {
  CATEGORIES,
  FAILURES,
  PASSING_SCORE,
  type Beat,
  type Category,
  type Ctx,
  type Disposition,
  type FailureKind,
  type Lead,
  type Observation,
  type Option,
  type RunFlags,
  type Turn,
} from "./types";

/* ------------------------------------------------------------------ utils */

/** Deterministic PRNG so a run can be replayed from its seed. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

export function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const DAYS = ["Tuesday", "Wednesday", "Thursday", "Friday", "Monday"];
const TIMES = ["9:30 AM", "10:00 AM", "11:15 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

function pickSlots(rand: () => number): [string, string] {
  const days = shuffle(DAYS, rand);
  const times = shuffle(TIMES, rand);
  return [`${days[0]} at ${times[0]}`, `${days[1]} at ${times[1]}`];
}

/** Replace {token} placeholders with values from the context. */
export function fill(text: string, ctx: Ctx & Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in ctx ? String(ctx[key]) : whole,
  );
}

/* ------------------------------------------------------------------- state */

export type Phase = "brief" | "prep" | "call" | "result";

export type EndReason =
  | "completed"
  | "hangup"
  | "failure"
  | "closed-out"; // prospect declined or was removed, handled correctly

export type State = {
  phase: Phase;
  seed: number;
  lead: Lead;
  repName: string;
  ctx: Ctx & Record<string, string>;
  slots: [string, string];
  observation: Observation | null;

  /** Beats still to play, including injected objections. */
  queue: Beat[];
  index: number;
  /** Options for the current beat, pre-shuffled. */
  currentOptions: Option[];
  /** Set once the rep has answered the current beat, before advancing. */
  feedback: {
    option: Option;
    beat: Beat;
    earned: number;
    possible: number;
  } | null;

  patience: number;
  scores: Record<Category, number>;
  possible: Record<Category, number>;
  flags: RunFlags;
  turns: Turn[];

  endReason: EndReason | null;
  failure: FailureKind | null;
};

const ZERO_SCORES = (): Record<Category, number> => ({
  opening: 0,
  observation: 0,
  transition: 0,
  calendar: 0,
  commitment: 0,
  handoff: 0,
});

function makeCtx(
  lead: Lead,
  repName: string,
  slots: [string, string],
  chosen: string,
  observation: string,
): Ctx & Record<string, string> {
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    business: lead.business,
    service: lead.service,
    area: lead.area,
    email: lead.email,
    phone: lead.phone,
    timezone: lead.timezone,
    industry: lead.industry,
    easyQuestion: lead.easyQuestion,
    observation,
    optionA: slots[0],
    optionB: slots[1],
    chosenTime: chosen,
    eventTitle: `Growth Systems Review — ${lead.business}`,
    repName,
    closer: "Greyson",
  };
}

/**
 * Objections are injected at the two points the SOP expects them:
 * after the reason for calling (Move 4) and after the meeting offer (Move 5).
 */
function withObjections(beats: Beat[], lead: Lead): Beat[] {
  const out: Beat[] = [];
  for (const beat of beats) {
    out.push(beat);
    const slot = beat.move === 4 ? 0 : beat.move === 5 ? 1 : -1;
    if (slot === -1) continue;
    const id = lead.objections[slot];
    if (!id) continue;
    const objection = OBJECTIONS[id];
    out.push({
      id: `obj-${objection.id}`,
      move: null,
      label: "Objection",
      category: beat.category,
      points: 0,
      prospect: objection.says,
      delivery:
        "Acknowledge, ask one clarifying question, answer briefly, then return to two calendar options. Never debate.",
      options: objection.options,
    });
  }
  return out;
}

export function startRun(leadId: string, repName: string, seed: number): State {
  const lead = LEADS.find((l) => l.id === leadId) ?? LEADS[0];
  const rand = rng(seed);
  const slots = pickSlots(rand);
  const chosen = rand() < 0.5 ? slots[0] : slots[1];

  return {
    phase: "brief",
    seed,
    lead,
    repName: repName.trim() || "Percy",
    slots,
    observation: null,
    ctx: makeCtx(lead, repName.trim() || "Percy", slots, chosen, "…"),
    queue: [],
    index: 0,
    currentOptions: [],
    feedback: null,
    patience: 100,
    scores: ZERO_SCORES(),
    possible: ZERO_SCORES(),
    flags: {},
    turns: [],
    endReason: null,
    failure: null,
  };
}

export function toPrep(state: State): State {
  return { ...state, phase: "prep" };
}

/**
 * Choosing the observation is itself a scored decision: a fabricated one is
 * an automatic failure before the phone even rings.
 */
export function chooseObservation(state: State, obsId: string): State {
  const obs = state.lead.observations.find((o) => o.id === obsId);
  if (!obs) return state;

  if (obs.fabricated) {
    return {
      ...state,
      phase: "result",
      observation: obs,
      endReason: "failure",
      failure: "fabrication",
      possible: Object.fromEntries(
        CATEGORIES.map((c) => [c.key, c.points]),
      ) as Record<Category, number>,
    };
  }

  const ctx = makeCtx(
    state.lead,
    state.repName,
    state.slots,
    state.ctx.chosenTime,
    obs.text,
  );
  const queue = withObjections(buildBeats(state.lead), state.lead);
  const rand = rng(state.seed ^ 0x9e3779b9);

  return {
    ...state,
    phase: "call",
    observation: obs,
    ctx,
    queue,
    index: 0,
    currentOptions: shuffle(queue[0].options, rand),
    feedback: null,
  };
}

/** Score the chosen option and record the turn. Does not advance the beat. */
export function answer(state: State, optionId: string): State {
  const beat = state.queue[state.index];
  if (!beat || state.feedback) return state;
  const option = beat.options.find((o) => o.id === optionId);
  if (!option) return state;

  // A truthful but vague observation caps what Move 3 can earn.
  const vaguePenalty =
    beat.move === 3 && state.observation?.vague && option.verdict === "correct"
      ? 0.45
      : 1;

  const earned = Math.round(beat.points * option.credit * vaguePenalty);
  const patience = Math.max(0, Math.min(100, state.patience + option.patience));
  const flags = { ...state.flags, ...(option.flags ?? {}) };

  const turn: Turn = {
    beatId: beat.id,
    optionId: option.id,
    label: beat.move ? `Move ${beat.move} — ${beat.label}` : beat.label,
    category: beat.category,
    prospect: fill(beat.prospect, state.ctx),
    said: fill(option.text, state.ctx),
    reply: fill(option.reply, state.ctx),
    verdict: option.verdict,
    note:
      vaguePenalty < 1
        ? `${option.note} The observation you prepared was vague, though — ${state.observation?.note ?? ""}`
        : option.note,
    delivery: beat.delivery,
    earned,
    possible: beat.points,
  };

  return {
    ...state,
    patience,
    flags,
    scores: { ...state.scores, [beat.category]: state.scores[beat.category] + earned },
    possible: {
      ...state.possible,
      [beat.category]: state.possible[beat.category] + beat.points,
    },
    turns: [...state.turns, turn],
    feedback: { option, beat, earned, possible: beat.points },
  };
}

/** Move to the next beat, or end the call. */
export function advance(state: State): State {
  const fb = state.feedback;
  if (!fb) return state;

  if (fb.option.failure) {
    return finish(state, "failure", fb.option.failure);
  }
  if (state.patience <= 0) {
    // Even a call that got hung up on has to be dispositioned.
    return toHandoff(state, "hangup");
  }
  if (fb.option.endsCall) {
    return toHandoff(state, "closed-out");
  }

  const next = state.index + 1;
  if (next >= state.queue.length) {
    return toHandoff(state, "completed");
  }

  const rand = rng(state.seed + next * 2654435761);
  return {
    ...state,
    index: next,
    currentOptions: shuffle(state.queue[next].options, rand),
    feedback: null,
  };
}

/** Append the CRM handoff beat, which is always played. */
function toHandoff(state: State, reason: EndReason): State {
  // Being hung up on is a refusal — the number stays workable, so
  // "Not interested" is the truthful disposition, not "Not qualified".
  const flags =
    reason === "hangup" ? { ...state.flags, refused: true } : state.flags;
  const beat = handoffOptions(flags);
  const rand = rng(state.seed ^ 0x5bf03635);
  return {
    ...state,
    flags,
    endReason: reason,
    queue: [...state.queue.slice(0, state.index + 1), beat],
    index: state.index + 1,
    currentOptions: shuffle(beat.options, rand),
    feedback: null,
  };
}

/** After the handoff beat, or on an automatic failure, compute the result. */
export function finish(
  state: State,
  reason: EndReason,
  failure: FailureKind | null,
): State {
  const possible = { ...state.possible };

  if (reason === "closed-out") {
    // The call ended legitimately, so unattempted moves aren't counted
    // against the rep — only what they actually reached, plus the handoff.
    possible.handoff = 10;
  } else {
    // Hung up on, or an automatic failure: everything counts, unearned is lost.
    for (const c of CATEGORIES) possible[c.key] = c.points;
  }

  return {
    ...state,
    phase: "result",
    endReason: reason,
    failure: failure ?? state.failure,
    possible,
  };
}

/** Called after the rep answers the handoff beat. */
export function completeHandoff(state: State): State {
  const fb = state.feedback;
  if (!fb) return state;
  if (fb.option.failure) {
    return finish(state, "failure", fb.option.failure);
  }
  return finish(state, state.endReason ?? "completed", null);
}

/* ----------------------------------------------------------------- results */

export type Result = {
  earned: number;
  possible: number;
  percent: number;
  passed: boolean;
  failure: FailureKind | null;
  failureLabel: string | null;
  failureRule: string | null;
  /** What the recording actually supports. */
  disposition: Disposition;
  /** What the rep logged, when they reached the handoff. */
  logged: Disposition | null;
  headline: string;
  summary: string;
  /** The lowest-scoring category — the SOP's "one skill to practice". */
  practice: { label: string; passing: string; drill: string } | null;
  rows: {
    key: Category;
    label: string;
    passing: string;
    earned: number;
    possible: number;
  }[];
};

const DRILLS: Record<Category, string> = {
  opening:
    "Run the Move 1 opener and your industry easy-question ten times out loud, at 120–135 WPM. Verify the person, name the business, ask the easy question, then stop talking.",
  observation:
    "Pull five real leads and write one truthful, specific observation for each in under a minute. No adjectives, no numbers you can't source.",
  transition:
    "Say the Move 5 offer twenty times until the '30-minute' and the 'if there isn't, no problem' land without hesitation.",
  calendar:
    "Drill the two-time close and the live confirmation back to back. Two real openings, then email, phone, invite sent, invite accepted — in that order, 10% slower.",
  commitment:
    "Practise Move 8 with a partner and hold the silence after 'Can I get your word that you'll be there?' Count to three before you speak again.",
  handoff:
    "Take five recordings and log the disposition for each from the recording alone. Confirmed means all four conditions were met — nothing less.",
};

const LOGGED_AS: Record<string, Disposition> = {
  "h-confirmed": "Booked-confirmed",
  "h-unconfirmed": "Booked-unconfirmed",
  "h-callback": "Callback set",
  "h-dnc": "Do not call",
  "h-not-interested": "Not interested",
};

/**
 * On an automatic failure the scorecard is void, so the only useful
 * coaching is about the rule that was broken.
 */
const FAILURE_DRILL: Record<
  FailureKind,
  { label: string; passing: string; drill: string }
> = {
  fabrication: {
    label: "Truthful observations",
    passing: "Only approved proof and things you can actually see.",
    drill:
      "Take ten leads and write one observation each using only what is visible from the outside — the site, the listing, the reviews, the posts. If you cannot point at where you saw it, you cannot say it. Nothing about referrals, results, other clients, where you're from, or how much time is left.",
  },
  "do-not-call": {
    label: "Do-not-call compliance",
    passing: "Acknowledge, mark it, end the call. Nothing else.",
    drill:
      "Rehearse the three-sentence removal response until it is automatic: 'Absolutely. I'll mark that now. Have a good day.' No clarifying question, no alternative channel, no last word. Then log Do not call and suppress the number immediately.",
  },
  "false-appointment": {
    label: "Disposition accuracy",
    passing:
      "Confirmed means all four conditions were met — attendee, data, invite accepted, commitment.",
    drill:
      "Pull five of your own recordings and log each disposition from the recording alone. If the invite was not accepted on the call, it is Booked-unconfirmed — every time, regardless of how well the conversation went.",
  },
};

export function result(state: State): Result {
  const rows = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    passing: c.passing,
    earned: state.scores[c.key],
    possible: state.possible[c.key],
  }));

  const earned = rows.reduce((n, r) => n + r.earned, 0);
  const possible = rows.reduce((n, r) => n + r.possible, 0) || 100;
  const percent = Math.round((earned / possible) * 100);
  const failure = state.failure;
  const passed = !failure && percent >= PASSING_SCORE;

  const disposition = dispositionFor(state);

  // Only coach on moves the rep actually reached — telling someone to drill
  // the calendar close after they got hung up on at Move 2 is noise.
  const attempted = new Set(state.turns.map((t) => t.category));
  const weakest = rows
    .filter((r) => r.possible > 0 && attempted.has(r.key))
    .sort((a, b) => a.earned / a.possible - b.earned / b.possible)[0];

  const practice = failure
    ? FAILURE_DRILL[failure]
    : weakest && weakest.earned / weakest.possible < 1
      ? {
          label: weakest.label,
          passing: weakest.passing,
          drill: DRILLS[weakest.key],
        }
      : null;

  const handoffTurn = state.turns.find((t) => t.beatId === "handoff");
  const logged = handoffTurn ? (LOGGED_AS[handoffTurn.optionId] ?? null) : null;

  let headline: string;
  let summary: string;

  if (failure) {
    headline = "Automatic failure";
    summary =
      failure === "fabrication"
        ? "Everything else on the call is irrelevant once something was invented. Score is void."
        : failure === "do-not-call"
          ? "A removal request was not honoured. Score is void."
          : "A meeting was logged as confirmed when the quality rule was not met. Score is void.";
  } else if (state.endReason === "hangup") {
    headline = "They hung up";
    summary =
      "Patience ran out before the booking. Everything you didn't reach is scored as zero — the call was live and you lost it.";
  } else if (state.endReason === "closed-out") {
    headline = "Call closed out";
    summary =
      "No booking, but the call ended cleanly and you logged it honestly. Only the moves you reached are scored.";
  } else if (passed) {
    headline = "Passed";
    summary =
      "You held the structure, named one real problem, and left the closer something they can actually work with.";
  } else {
    headline = "Below passing";
    summary = `${PASSING_SCORE} is the bar. The structure held in places, but not enough of it to count as a clean call.`;
  }

  return {
    earned,
    possible,
    percent,
    passed,
    failure,
    failureLabel: failure ? FAILURES[failure].label : null,
    failureRule: failure ? FAILURES[failure].rule : null,
    disposition,
    logged,
    headline,
    summary,
    practice,
    rows,
  };
}

function dispositionFor(state: State): Disposition {
  const f = state.flags;
  if (f.doNotCall) return "Do not call";
  if (f.inviteAccepted && f.dataVerified && f.commitment) return "Booked-confirmed";
  if (f.timeAgreed) return "Booked-unconfirmed";
  if (f.callbackSet) return "Callback set";
  if (f.refused) return "Not interested";
  if (state.endReason === "hangup") return "Not interested";
  return "Not qualified";
}

export { CATEGORIES, PASSING_SCORE, FAILURES };
