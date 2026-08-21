"use client";

import { useState } from "react";
import { site } from "@/lib/tattoo-site";
import { IconCheck } from "./icons";

type Errors = Partial<Record<"name" | "contact" | "idea", string>>;

const inputClass =
  "w-full bg-char border border-salt/15 px-4 py-3.5 text-salt placeholder:text-smoke/60 focus:border-volt transition-colors duration-200";
const labelClass =
  "block font-mono uppercase text-[0.68rem] tracking-[0.2em] text-smoke mb-2";

export default function BookingForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const errs: Errors = {};
    if (!String(data.get("name") ?? "").trim()) errs.name = "Enter your name.";
    if (!String(data.get("contact") ?? "").trim())
      errs.contact = "A phone number or email lets us reply.";
    if (!String(data.get("idea") ?? "").trim())
      errs.idea = "Describe the piece — a sentence is enough to start.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    const subject = encodeURIComponent(`Consult request — ${data.get("name")}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Phone / email: ${data.get("contact")}`,
        `Rough size: ${data.get("size") || "—"}`,
        `Placement: ${data.get("placement") || "—"}`,
        `Budget: ${data.get("budget") || "—"}`,
        "",
        String(data.get("idea")),
      ].join("\n"),
    );
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border border-volt/50 bg-char p-8 text-center">
        <IconCheck className="w-10 h-10 mx-auto text-volt" />
        <p className="mt-4 font-display text-2xl text-salt">
          Request sent
        </p>
        <p className="mt-3 text-salt/75 leading-relaxed">
          Your email draft opened — hit send and we&apos;ll get back to you
          shortly. In a hurry?{" "}
          <a
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-volt font-semibold underline underline-offset-4"
          >
            DM {site.contact.instagramHandle}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="bk-name" className={labelClass}>
            Name
          </label>
          <input
            id="bk-name"
            name="name"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "bk-name-err" : undefined}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p id="bk-name-err" className="mt-1.5 text-xs text-flash">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="bk-contact" className={labelClass}>
            Phone or email
          </label>
          <input
            id="bk-contact"
            name="contact"
            autoComplete="tel"
            aria-invalid={errors.contact ? "true" : undefined}
            aria-describedby={errors.contact ? "bk-contact-err" : undefined}
            className={inputClass}
            placeholder="How we reach you"
          />
          {errors.contact && (
            <p id="bk-contact-err" className="mt-1.5 text-xs text-flash">
              {errors.contact}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="bk-size" className={labelClass}>
            Rough size
          </label>
          <input
            id="bk-size"
            name="size"
            className={inputClass}
            placeholder='e.g. 6" or half sleeve'
          />
        </div>
        <div>
          <label htmlFor="bk-placement" className={labelClass}>
            Placement
          </label>
          <input
            id="bk-placement"
            name="placement"
            className={inputClass}
            placeholder="Forearm, back…"
          />
        </div>
        <div>
          <label htmlFor="bk-budget" className={labelClass}>
            Budget
          </label>
          <input
            id="bk-budget"
            name="budget"
            className={inputClass}
            placeholder="Rough range"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bk-idea" className={labelClass}>
          The piece
        </label>
        <textarea
          id="bk-idea"
          name="idea"
          rows={5}
          aria-invalid={errors.idea ? "true" : undefined}
          aria-describedby={errors.idea ? "bk-idea-err" : undefined}
          className={inputClass}
          placeholder="What you want, roughly what size, and any references you'll bring"
        />
        {errors.idea && (
          <p id="bk-idea-err" className="mt-1.5 text-xs text-flash">
            {errors.idea}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto font-mono text-[0.72rem] uppercase tracking-[0.22em] bg-volt text-void px-10 py-4 hover:bg-salt transition-colors duration-200 cursor-pointer"
      >
        Request consult
      </button>
      <p className="text-xs text-smoke">
        Sends an email from your own mail app — nothing is stored on this site.
      </p>
    </form>
  );
}
