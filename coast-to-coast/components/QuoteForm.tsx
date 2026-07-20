"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { IconCheck } from "./icons";

type Errors = Partial<Record<"name" | "phone" | "message", string>>;

const inputClass =
  "w-full bg-white border border-slate/20 px-4 py-3.5 text-ink placeholder:text-ink/40 focus:border-amber transition-colors duration-200";
const labelClass =
  "block font-display uppercase text-xs tracking-[0.12em] text-slate/70 mb-2";

export default function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const errs: Errors = {};
    if (!String(data.get("name") ?? "").trim()) errs.name = "Please enter your name.";
    if (!String(data.get("phone") ?? "").trim())
      errs.phone = "A phone number lets us call you right back.";
    if (!String(data.get("message") ?? "").trim())
      errs.message = "Tell us what's going on with your roof.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    const subject = encodeURIComponent(`Free inspection request — ${data.get("name")}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Email: ${data.get("email") || "—"}`,
        `Address/City: ${data.get("location") || "—"}`,
        `Service: ${data.get("service")}`,
        "",
        String(data.get("message")),
      ].join("\n"),
    );
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border border-amber/50 bg-white p-8 text-center">
        <IconCheck className="w-10 h-10 mx-auto text-amber" />
        <p className="mt-4 font-display uppercase text-2xl font-bold text-slate">
          Request sent
        </p>
        <p className="mt-3 text-ink/75 leading-relaxed">
          Your email draft opened — hit send and we&apos;ll call you back to
          schedule your free inspection. Prefer to talk now? Call{" "}
          <a href={site.contact.phoneHref} className="text-amber-deep font-semibold underline underline-offset-4">
            {site.contact.phoneDisplay}
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
          <label htmlFor="name" className={labelClass}>Name *</label>
          <input id="name" name="name" type="text" autoComplete="name" required
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-err" : undefined}
            className={inputClass} placeholder="Your name" />
          {errors.name && <p id="name-err" role="alert" className="mt-1.5 text-sm text-red-700">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone *</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={errors.phone ? "phone-err" : undefined}
            className={inputClass} placeholder="(228) 000-0000" />
          {errors.phone && <p id="phone-err" role="alert" className="mt-1.5 text-sm text-red-700">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className={inputClass} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Property city</label>
          <input id="location" name="location" type="text" className={inputClass} placeholder="Biloxi, Gulfport…" />
        </div>
      </div>

      <div>
        <label htmlFor="service" className={labelClass}>What do you need?</label>
        <select id="service" name="service" className={`${inputClass} cursor-pointer`}>
          <option>Roof replacement</option>
          <option>Roof repair / leak</option>
          <option>Storm damage / insurance claim</option>
          <option>Roof inspection</option>
          <option>Not sure — need an inspection</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>About your roof *</label>
        <textarea id="message" name="message" rows={4} required
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "msg-err" : "msg-help"}
          className={inputClass}
          placeholder="What's going on — a leak, storm damage, age of the roof…" />
        {errors.message ? (
          <p id="msg-err" role="alert" className="mt-1.5 text-sm text-red-700">{errors.message}</p>
        ) : (
          <p id="msg-help" className="mt-1.5 text-xs text-ink/50">A sentence is plenty — we&apos;ll ask the rest on the call.</p>
        )}
      </div>

      <button type="submit"
        className="w-full sm:w-auto font-display uppercase text-sm font-semibold tracking-[0.12em] bg-amber text-slate hover:bg-amber-deep hover:text-white px-10 py-4 transition-colors cursor-pointer">
        Request My Free Inspection
      </button>
    </form>
  );
}
