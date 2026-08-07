"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LEADS } from "@/lib/practice/leads";
import {
  advance,
  answer,
  chooseObservation,
  completeHandoff,
  fill,
  result,
  startRun,
  toPrep,
  type State,
} from "@/lib/practice/engine";
import { CATEGORIES, FAILURES, PASSING_SCORE } from "@/lib/practice/types";
import { Button, Eyebrow, Line, Meter, Panel, VERDICT_STYLE } from "./parts";

const WEB_STATE_LABEL = {
  none: "No website",
  weak: "Weak website",
  strong: "Strong website",
} as const;

const MOOD_LABEL = {
  receptive: "Receptive",
  neutral: "Neutral",
  busy: "Busy",
  guarded: "Guarded",
} as const;

export default function CallGame() {
  const [state, setState] = useState<State | null>(null);
  const [leadId, setLeadId] = useState<string>(LEADS[0].id);
  const [repName, setRepName] = useState("");

  if (!state) {
    return (
      <Setup
        leadId={leadId}
        setLeadId={setLeadId}
        repName={repName}
        setRepName={setRepName}
        onStart={() =>
          setState(startRun(leadId, repName, Date.now() & 0x7fffffff))
        }
      />
    );
  }

  if (state.phase === "brief") {
    return (
      <Brief state={state} onNext={() => setState(toPrep(state))} />
    );
  }

  if (state.phase === "prep") {
    return (
      <Prep
        state={state}
        onChoose={(id) => setState(chooseObservation(state, id))}
      />
    );
  }

  if (state.phase === "call") {
    return (
      <Call
        state={state}
        onAnswer={(id) => setState(answer(state, id))}
        onContinue={() =>
          setState(
            state.queue[state.index]?.id === "handoff"
              ? completeHandoff(state)
              : advance(state),
          )
        }
      />
    );
  }

  return (
    <Result
      state={state}
      onAgain={() => setState(startRun(leadId, repName, Date.now() & 0x7fffffff))}
      onNewLead={() => setState(null)}
    />
  );
}

/* ------------------------------------------------------------------- setup */

function Setup({
  leadId,
  setLeadId,
  repName,
  setRepName,
  onStart,
}: {
  leadId: string;
  setLeadId: (v: string) => void;
  repName: string;
  setRepName: (v: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <Eyebrow>AI AT WORK · Academy</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2.1rem,5.5vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white">
        The Dial
      </h1>
      <p className="mt-4 max-w-2xl text-dial-dim">
        A live-fire rehearsal of the eight-move cold call. You prep the lead,
        make every choice the script asks for, and get scored on the manager
        scorecard — {PASSING_SCORE} out of 100 to pass.
      </p>

      <Panel className="mt-10 p-6 sm:p-8">
        <Eyebrow>One job</Eyebrow>
        <p className="mt-3 text-lg leading-relaxed text-dial-text">
          Create a real conversation, book a qualified 30-minute meeting,
          confirm the invitation, and secure the show.
        </p>
        <div className="mt-6 border-t border-dial-line pt-5">
          <p className="font-display text-xs font-semibold uppercase tracking-cap text-danger">
            Never
          </p>
          <p className="mt-2 text-sm leading-relaxed text-dial-dim">
            Invent a referral, result, customer relationship, local connection,
            or reason for urgency. Fabricated claims, ignored do-not-call
            requests, and false appointments are automatic failures — they void
            the score no matter how the rest of the call went.
          </p>
        </div>
      </Panel>

      <div className="mt-10">
        <label
          htmlFor="rep-name"
          className="font-display text-[0.68rem] font-semibold uppercase tracking-cap text-dial-dim"
        >
          Rep name
        </label>
        <input
          id="rep-name"
          value={repName}
          onChange={(e) => setRepName(e.target.value)}
          placeholder="Percy"
          className="mt-2 block w-full max-w-xs border border-dial-line bg-dial-3 px-4 py-3 text-dial-text placeholder:text-dial-dim/60 focus:border-cyan focus:outline-none"
        />
      </div>

      <div className="mt-10">
        <Eyebrow>Pick a lead</Eyebrow>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {LEADS.map((lead) => {
            const selected = lead.id === leadId;
            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => setLeadId(lead.id)}
                aria-pressed={selected}
                className={`cursor-pointer border p-5 text-left transition-colors duration-200 ${
                  selected
                    ? "border-cyan bg-cyan/5"
                    : "border-dial-line bg-dial-2 hover:border-dial-dim"
                }`}
              >
                <p className="font-display text-base font-semibold text-white">
                  {lead.business}
                </p>
                <p className="mt-1 text-sm text-dial-dim">
                  {lead.firstName} {lead.lastName} · {lead.industry} ·{" "}
                  {lead.area}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag>{WEB_STATE_LABEL[lead.webState]}</Tag>
                  <Tag>{MOOD_LABEL[lead.mood]}</Tag>
                  <Tag>
                    {lead.objections.length} objection
                    {lead.objections.length === 1 ? "" : "s"}
                  </Tag>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <Button onClick={onStart}>Open the lead record</Button>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-dial-line px-2 py-1 font-display text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-dial-dim">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- brief */

function Brief({ state, onNext }: { state: State; onNext: () => void }) {
  const { lead, ctx } = state;
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <Eyebrow>Before dialing</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4.5vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
        {lead.business}
      </h1>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Panel className="p-6">
          <Eyebrow>What you can see</Eyebrow>
          <ul className="mt-4 space-y-2.5">
            {lead.brief.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-dial-text">
                <span className="mt-2 h-1 w-1 shrink-0 bg-cyan" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-6">
          <Eyebrow>The five fields</Eyebrow>
          <dl className="mt-4 space-y-3 text-sm">
            <Field label="Business" value={lead.business} />
            <Field label="Service" value={lead.service} />
            <Field label="Area" value={lead.area} />
            <Field label="Calendar A" value={ctx.optionA} />
            <Field label="Calendar B" value={ctx.optionB} />
          </dl>
          <p className="mt-5 border-t border-dial-line pt-4 text-xs text-dial-dim">
            The sixth field — your true observation — is the one you have to
            choose yourself.
          </p>
        </Panel>
      </div>

      <Panel className="mt-5 p-6">
        <Eyebrow>Contact record</Eyebrow>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <Field label="Name" value={`${lead.firstName} ${lead.lastName}`} />
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
        </div>
      </Panel>

      <div className="mt-10">
        <Button onClick={onNext}>Choose your observation</Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
        {label}
      </dt>
      <dd className="mt-0.5 text-dial-text">{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------- prep */

function Prep({
  state,
  onChoose,
}: {
  state: State;
  onChoose: (id: string) => void;
}) {
  const { lead } = state;
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <Eyebrow>Pre-call prep</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(1.7rem,4.2vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-white">
        One true observation
      </h1>
      <p className="mt-4 text-dial-dim">
        This is the line you'll deliver on Move 3. It has to be specific, and it
        has to be something you can actually see from the outside.
      </p>

      <Panel className="mt-6 border-danger/30 bg-danger/5 p-5">
        <p className="font-display text-xs font-semibold uppercase tracking-cap text-danger">
          Never
        </p>
        <p className="mt-2 text-sm leading-relaxed text-dial-text">
          Invent a referral, result, customer relationship, local connection, or
          reason for urgency.
        </p>
      </Panel>

      <Panel className="mt-5 p-5">
        <Eyebrow>What you can see</Eyebrow>
        <ul className="mt-3 space-y-2">
          {lead.brief.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-dial-dim">
              <span className="mt-2 h-1 w-1 shrink-0 bg-dial-dim" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-8 space-y-3">
        {lead.observations.map((obs) => (
          <button
            key={obs.id}
            type="button"
            onClick={() => onChoose(obs.id)}
            className="block w-full cursor-pointer border border-dial-line bg-dial-2 p-5 text-left transition-colors duration-200 hover:border-cyan hover:bg-cyan/5"
          >
            <span className="text-[0.94rem] leading-relaxed text-dial-text">
              &ldquo;…I was looking at your setup and noticed {obs.text}.&rdquo;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- call */

function Call({
  state,
  onAnswer,
  onContinue,
}: {
  state: State;
  onAnswer: (id: string) => void;
  onContinue: () => void;
}) {
  const beat = state.queue[state.index];
  const fb = state.feedback;
  const endRef = useRef<HTMLDivElement>(null);

  const attempted = useMemo(
    () => state.turns.reduce((n, t) => n + t.possible, 0),
    [state.turns],
  );
  const earned = useMemo(
    () => state.turns.reduce((n, t) => n + t.earned, 0),
    [state.turns],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.turns.length, fb]);

  if (!beat) return null;

  const isHandoff = beat.id === "handoff";
  const isObjection = beat.label === "Objection";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <div className="min-w-0">
          {/* Transcript. While feedback is showing, the newest turn is
              rendered by <Feedback> instead, so drop it here. */}
          <div className="space-y-5">
            {(fb ? state.turns.slice(0, -1) : state.turns).map((turn, i) => (
              <div key={`${turn.beatId}-${i}`} className="space-y-3">
                <Line who="prospect" name={state.lead.firstName}>
                  {turn.prospect}
                </Line>
                <Line who="rep" name={state.repName}>
                  {turn.said}
                </Line>
                {turn.reply && turn.beatId !== "handoff" && (
                  <Line who="prospect" name={state.lead.firstName}>
                    {turn.reply}
                  </Line>
                )}
              </div>
            ))}

            {!fb &&
              (isHandoff ? (
                <p className="py-2 text-center font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
                  {state.endReason === "hangup"
                    ? "— they hung up —"
                    : "— call ended —"}
                </p>
              ) : (
                <Line who="prospect" name={state.lead.firstName}>
                  {fill(beat.prospect, state.ctx)}
                </Line>
              ))}
          </div>

          {/* current beat */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`border px-2.5 py-1 font-display text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                  isObjection
                    ? "border-caution/50 text-caution"
                    : isHandoff
                      ? "border-cyan/50 text-cyan"
                      : "border-dial-line text-dial-dim"
                }`}
              >
                {beat.move ? `Move ${beat.move}` : beat.label}
              </span>
              <span className="font-display text-sm font-semibold text-white">
                {beat.move ? beat.label : ""}
              </span>
              {beat.points > 0 && (
                <span className="text-xs text-dial-dim">
                  {beat.points} pts ·{" "}
                  {CATEGORIES.find((c) => c.key === beat.category)?.label}
                </span>
              )}
            </div>

            {!fb ? (
              <div className="mt-5 space-y-3">
                {state.currentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onAnswer(opt.id)}
                    className="block w-full cursor-pointer border border-dial-line bg-dial-2 p-5 text-left text-[0.94rem] leading-relaxed text-dial-text transition-colors duration-200 hover:border-cyan hover:bg-cyan/5"
                  >
                    {isHandoff ? opt.text : `"${fill(opt.text, state.ctx)}"`}
                  </button>
                ))}
              </div>
            ) : (
              <Feedback state={state} onContinue={onContinue} />
            )}
          </div>

          <div ref={endRef} />
        </div>

        {/* sidebar */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <span className="dial-live h-2 w-2 rounded-full bg-signal" />
              <span className="font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
                On the line
              </span>
            </div>
            <p className="mt-3 font-display text-base font-semibold text-white">
              {state.lead.firstName} {state.lead.lastName}
            </p>
            <p className="text-sm text-dial-dim">{state.lead.business}</p>

            <div className="mt-6 space-y-5">
              <Meter
                value={state.patience}
                label="Patience"
                hint={
                  state.patience > 60
                    ? "Engaged."
                    : state.patience > 30
                      ? "Losing them."
                      : "About to hang up."
                }
              />
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <Eyebrow>Score</Eyebrow>
                  <span className="font-display text-sm tabular-nums text-dial-text">
                    {earned}
                    <span className="text-dial-dim">/{attempted || 0}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-dial-dim">
                  {PASSING_SCORE}/100 to pass.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-dial-line pt-4">
              <Eyebrow>Your observation</Eyebrow>
              <p className="mt-2 text-xs leading-relaxed text-dial-dim">
                {state.observation?.text}
              </p>
            </div>

            <div className="mt-5 border-t border-dial-line pt-4">
              <Eyebrow>Calendar</Eyebrow>
              <p className="mt-2 text-xs text-dial-dim">A · {state.ctx.optionA}</p>
              <p className="text-xs text-dial-dim">B · {state.ctx.optionB}</p>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Feedback({
  state,
  onContinue,
}: {
  state: State;
  onContinue: () => void;
}) {
  const fb = state.feedback!;
  const style = VERDICT_STYLE[fb.option.verdict];
  const failure = fb.option.failure;

  const isHandoff = fb.beat.id === "handoff";

  return (
    <div className="mt-5 space-y-4">
      {isHandoff ? (
        <p className="py-2 text-center font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
          {state.endReason === "hangup" ? "— they hung up —" : "— call ended —"}
        </p>
      ) : (
        <Line who="prospect" name={state.lead.firstName}>
          {fill(fb.beat.prospect, state.ctx)}
        </Line>
      )}
      <Line who="rep" name={state.repName}>
        {isHandoff ? fb.option.text : `"${fill(fb.option.text, state.ctx)}"`}
      </Line>
      <Line who="prospect" name={isHandoff ? "CRM" : state.lead.firstName}>
        {fill(fb.option.reply, state.ctx)}
      </Line>

      <Panel className={`${style.border} ${style.bg} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`font-display text-[0.68rem] font-semibold uppercase tracking-cap ${style.text}`}
          >
            {failure ? FAILURES[failure].label : style.label}
          </span>
          {fb.possible > 0 && (
            <span className="font-display text-sm tabular-nums text-dial-text">
              {fb.earned}/{fb.possible} pts
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-dial-text">
          {fb.option.note}
        </p>
        {failure && (
          <p className="mt-3 border-t border-danger/30 pt-3 text-sm leading-relaxed text-danger">
            {FAILURES[failure].rule}
          </p>
        )}
        <p className="mt-4 border-t border-dial-line/60 pt-3 text-xs leading-relaxed text-dial-dim">
          <span className="font-display font-semibold uppercase tracking-[0.1em]">
            SOP delivery note ·{" "}
          </span>
          {fb.beat.delivery}
        </p>
      </Panel>

      <Button onClick={onContinue}>
        {failure
          ? "See the scorecard"
          : fb.beat.id === "handoff"
            ? "See the scorecard"
            : state.patience <= 0
              ? "Log the call"
              : "Continue"}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ result */

function Result({
  state,
  onAgain,
  onNewLead,
}: {
  state: State;
  onAgain: () => void;
  onNewLead: () => void;
}) {
  const r = result(state);
  const tone = r.failure
    ? "text-danger"
    : r.passed
      ? "text-signal"
      : "text-caution";

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <Eyebrow>Manager scorecard</Eyebrow>
      <h1
        className={`mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.02] tracking-[-0.02em] ${tone}`}
      >
        {r.headline}
      </h1>
      <p className="mt-4 max-w-2xl text-dial-dim">{r.summary}</p>

      <div className="mt-8 flex flex-wrap items-end gap-8">
        <div>
          <Eyebrow>Score</Eyebrow>
          <p className="mt-1 font-display text-5xl font-bold tabular-nums text-white">
            {r.failure ? "—" : r.percent}
            {!r.failure && (
              <span className="text-2xl text-dial-dim">/100</span>
            )}
          </p>
          {r.possible !== 100 && !r.failure && (
            <p className="mt-1 text-xs text-dial-dim">
              {r.earned} of {r.possible} points attempted
            </p>
          )}
        </div>
        <div>
          <Eyebrow>
            {r.logged && r.logged !== r.disposition
              ? "You logged"
              : "CRM disposition"}
          </Eyebrow>
          <p
            className={`mt-1 font-display text-xl font-semibold ${
              r.logged && r.logged !== r.disposition
                ? "text-danger"
                : "text-white"
            }`}
          >
            {r.logged ?? r.disposition}
          </p>
          {r.logged && r.logged !== r.disposition && (
            <p className="mt-1 text-xs text-dial-dim">
              The recording supports{" "}
              <span className="text-dial-text">{r.disposition}</span>.
            </p>
          )}
        </div>
      </div>

      {r.failure && (
        <Panel className="mt-8 border-danger/40 bg-danger/5 p-6">
          <p className="font-display text-xs font-semibold uppercase tracking-cap text-danger">
            {r.failureLabel}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-dial-text">
            {r.failureRule}
          </p>
        </Panel>
      )}

      {/* scorecard */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-dial-line">
              <th className="py-3 pr-4 font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
                Category
              </th>
              <th className="py-3 pr-4 font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
                Passing behavior
              </th>
              <th className="py-3 text-right font-display text-[0.62rem] font-semibold uppercase tracking-cap text-dial-dim">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row) => {
              const ratio = row.possible ? row.earned / row.possible : 0;
              const cell =
                ratio >= 0.8
                  ? "text-signal"
                  : ratio >= 0.5
                    ? "text-caution"
                    : "text-danger";
              return (
                <tr key={row.key} className="border-b border-dial-line/60">
                  <td className="py-3 pr-4 font-medium text-dial-text">
                    {row.label}
                  </td>
                  <td className="py-3 pr-4 text-dial-dim">{row.passing}</td>
                  <td
                    className={`py-3 text-right font-display tabular-nums ${cell}`}
                  >
                    {row.earned}
                    <span className="text-dial-dim">/{row.possible}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {r.practice && (
        <Panel className="mt-8 border-cyan/40 bg-cyan/5 p-6">
          <Eyebrow>One skill to practice before your next call</Eyebrow>
          <p className="mt-3 font-display text-lg font-semibold text-white">
            {r.practice.label}
          </p>
          <p className="mt-1 text-sm text-dial-dim">{r.practice.passing}</p>
          <p className="mt-4 text-sm leading-relaxed text-dial-text">
            {r.practice.drill}
          </p>
        </Panel>
      )}

      {/* call review */}
      {state.turns.length > 0 && (
        <div className="mt-12">
          <Eyebrow>Call review</Eyebrow>
          <div className="mt-5 space-y-4">
            {state.turns.map((turn, i) => {
              const style = VERDICT_STYLE[turn.verdict];
              return (
                <details
                  key={`${turn.beatId}-${i}`}
                  className="border border-dial-line bg-dial-2"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <span className="font-display text-sm font-semibold text-dial-text">
                      {turn.label}
                    </span>
                    <span className="flex items-center gap-4">
                      <span
                        className={`font-display text-[0.62rem] font-semibold uppercase tracking-cap ${style.text}`}
                      >
                        {style.label}
                      </span>
                      <span className="font-display text-sm tabular-nums text-dial-dim">
                        {turn.earned}/{turn.possible}
                      </span>
                    </span>
                  </summary>
                  <div className="space-y-3 border-t border-dial-line px-5 py-5">
                    <p className="text-sm italic leading-relaxed text-dial-dim">
                      &ldquo;{turn.said}&rdquo;
                    </p>
                    <p className="text-sm leading-relaxed text-dial-text">
                      {turn.note}
                    </p>
                    <p className="border-t border-dial-line/60 pt-3 text-xs leading-relaxed text-dial-dim">
                      <span className="font-display font-semibold uppercase tracking-[0.1em]">
                        Delivery ·{" "}
                      </span>
                      {turn.delivery}
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <Button onClick={onAgain}>Run it again</Button>
        <Button variant="ghost" onClick={onNewLead}>
          Different lead
        </Button>
      </div>
    </div>
  );
}
