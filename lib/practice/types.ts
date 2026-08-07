/**
 * Types for the AI AT WORK cold-call practice game.
 *
 * Everything here is modelled directly on the internal document
 * "Cold Call Script + Appointment SOP" (John's call structure):
 * the 8 moves, the objection cheat sheet, the manager scorecard,
 * and the automatic-failure rules.
 */

/** The six manager-scorecard categories. Points must total 100. */
export type Category =
  | "opening"
  | "observation"
  | "transition"
  | "calendar"
  | "commitment"
  | "handoff";

export type CategorySpec = {
  key: Category;
  label: string;
  points: number;
  passing: string;
};

/** Manager scorecard, verbatim from section 6 of the SOP. */
export const CATEGORIES: CategorySpec[] = [
  {
    key: "opening",
    label: "Opening + relevance",
    points: 20,
    passing: "Human opener and accurate business question",
  },
  {
    key: "observation",
    label: "Reason + observation",
    points: 20,
    passing: "One clear, truthful growth-system gap",
  },
  {
    key: "transition",
    label: "Meeting transition",
    points: 15,
    passing: "Low pressure and clear 30-minute review",
  },
  {
    key: "calendar",
    label: "Calendar execution",
    points: 20,
    passing: "Two times; data verified; invite accepted",
  },
  {
    key: "commitment",
    label: "Show commitment",
    points: 15,
    passing: "Risk question plus explicit commitment",
  },
  {
    key: "handoff",
    label: "CRM handoff",
    points: 10,
    passing: "Correct disposition and useful closer notes",
  },
];

export const PASSING_SCORE = 80;

/** The three automatic failures named in the SOP. */
export type FailureKind = "fabrication" | "do-not-call" | "false-appointment";

export const FAILURES: Record<FailureKind, { label: string; rule: string }> = {
  fabrication: {
    label: "Fabricated claim",
    rule: "NEVER invent a referral, result, customer relationship, local connection, or reason for urgency. Use only approved proof and truthful observations.",
  },
  "do-not-call": {
    label: "Ignored a do-not-call request",
    rule: "When a prospect asks to be removed, acknowledge it, mark it, and end the call. Nothing else is acceptable.",
  },
  "false-appointment": {
    label: "False appointment",
    rule: "A booked meeting only counts as confirmed when the correct person is attending, the contact information is verified, the invitation is accepted, and the commitment is received.",
  },
};

export type WebState = "none" | "weak" | "strong";

export type Industry =
  | "Detailing"
  | "HVAC"
  | "Plumbing"
  | "Roofing"
  | "Mortgage";

export type Mood = "receptive" | "neutral" | "busy" | "guarded";

/** An observation the rep can choose during pre-call prep. */
export type Observation = {
  id: string;
  /** Shown in the prep list and spoken on Move 3. */
  text: string;
  /**
   * True observations are verifiable from the lead brief.
   * Fabricated ones invent a referral, result, relationship or urgency
   * and are an automatic failure the moment they are selected.
   */
  fabricated?: boolean;
  /** Why it is a fabrication, or why it is weak. */
  note?: string;
  /** A truthful but vague observation still costs points on Move 3. */
  vague?: boolean;
};

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  business: string;
  industry: Industry;
  /** Primary service, used in the Move 1 verification question. */
  service: string;
  area: string;
  webState: WebState;
  mood: Mood;
  email: string;
  phone: string;
  timezone: string;
  /** What the rep can actually see before dialing. */
  brief: string[];
  observations: Observation[];
  /** Objections this lead raises, in order, at the scripted injection points. */
  objections: ObjectionId[];
  /** The easy industry question for Move 2, per the SOP's list. */
  easyQuestion: string;
};

export type ObjectionId =
  | "not-interested"
  | "send-information"
  | "how-much"
  | "already-have-it"
  | "im-busy"
  | "call-later"
  | "take-me-off";

export type Verdict = "correct" | "acceptable" | "weak" | "poor";

export type Option = {
  id: string;
  /** What the rep says. Supports {token} interpolation. */
  text: string;
  verdict: Verdict;
  /** Fraction of the beat's points, 0..1. */
  credit: number;
  /** Change to the prospect's patience. */
  patience: number;
  /** The prospect's spoken reply. Supports {token} interpolation. */
  reply: string;
  /** Coaching shown after the choice. */
  note: string;
  /** Set when the option is an automatic failure. */
  failure?: FailureKind;
  /** Set when the option ends the call cleanly (e.g. honouring a DNC). */
  endsCall?: boolean;
  /**
   * Facts this choice establishes. The handoff beat reads these to decide
   * which CRM disposition is actually truthful.
   */
  flags?: {
    inviteSent?: boolean;
    inviteAccepted?: boolean;
    dataVerified?: boolean;
    commitment?: boolean;
    timeAgreed?: boolean;
    callbackSet?: boolean;
    refused?: boolean;
    doNotCall?: boolean;
  };
};

export type RunFlags = NonNullable<Option["flags"]>;

export type Beat = {
  id: string;
  /** Move number in the SOP, or null for objections and the handoff. */
  move: number | null;
  label: string;
  category: Category;
  /** Points this beat contributes. Beats within a category sum to its total. */
  points: number;
  /** What the prospect says immediately before the rep speaks. */
  prospect: string;
  /** The SOP delivery note, revealed as coaching after the choice. */
  delivery: string;
  options: Option[];
};

export type Objection = {
  id: ObjectionId;
  /** The prospect's line, from the cheat sheet's "They say" column. */
  says: string;
  /** The approved rep response, from the "Rep response" column. */
  approved: string;
  options: Option[];
};

/** Interpolation context built from the lead and the rep's prep choices. */
export type Ctx = {
  firstName: string;
  lastName: string;
  business: string;
  service: string;
  area: string;
  email: string;
  phone: string;
  timezone: string;
  observation: string;
  optionA: string;
  optionB: string;
  chosenTime: string;
  eventTitle: string;
  repName: string;
  closer: string;
};

export type Disposition =
  | "Booked-confirmed"
  | "Booked-unconfirmed"
  | "Callback set"
  | "Not interested"
  | "Do not call"
  | "Not qualified"
  | "Gatekeeper"
  | "No answer"
  | "Reschedule";

/** One recorded exchange, replayed on the scorecard. */
export type Turn = {
  beatId: string;
  optionId: string;
  label: string;
  category: Category;
  prospect: string;
  said: string;
  reply: string;
  verdict: Verdict;
  note: string;
  delivery: string;
  earned: number;
  possible: number;
};
