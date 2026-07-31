"use client";

import { useState } from "react";
import { site, services } from "@/lib/wash-site";
import { IconCheck } from "./icons";

type Field = "name" | "phone" | "message";
type Errors = Partial<Record<Field, string>>;

const inputClass =
  "w-full rounded-md border border-prussian/15 bg-chalk-2 px-4 py-3.5 text-prussian placeholder:text-stone/50 transition-colors duration-200 focus:border-spray";
const labelClass = "spec mb-2 block text-stone";

export default function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const errs: Errors = {};

    if (!String(data.get("name") ?? "").trim()) {
      errs.name = "Enter your name so we know who we're quoting.";
    }
    if (!String(data.get("phone") ?? "").trim()) {
      errs.phone = "Add a phone number — quotes go faster over the phone.";
    }
    if (!String(data.get("message") ?? "").trim()) {
      errs.message = "Describe the surface so we can size the job.";
    }

    setErrors(errs);
    if (Object.keys(errs).length) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    const subject = encodeURIComponent(`Quote request — ${data.get("name")}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Email: ${data.get("email") || "—"}`,
        `Property: ${data.get("location") || "—"}`,
        `Surface: ${data.get("surface")}`,
        "",
        String(data.get("message")),
      ].join("\n"),
    );

    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-lg border border-spray/40 bg-chalk-2 p-9 text-center"
      >
        <IconCheck className="mx-auto h-10 w-10 text-spray" />
        <p className="mt-5 font-display text-2xl font-semibold text-prussian">
          Your email draft is open
        </p>
        <p className="mt-3 leading-relaxed text-stone">
          Send it and we&rsquo;ll come back with a written quote, usually the
          same day. If you&rsquo;d rather just talk it through, call{" "}
          <a
            href={site.contact.phoneHref}
            className="font-semibold text-spray-ink underline underline-offset-4"
          >
            {site.contact.phoneDisplay}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className={labelClass}>
            Name *
          </label>
          <input
            id="q-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "q-name-err" : undefined}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p
              id="q-name-err"
              role="alert"
              className="mt-2 text-sm text-tip-red"
            >
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="q-phone" className={labelClass}>
            Phone *
          </label>
          <input
            id="q-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={errors.phone ? "q-phone-err" : undefined}
            className={inputClass}
            placeholder="(228) 000-0000"
          />
          {errors.phone && (
            <p
              id="q-phone-err"
              role="alert"
              className="mt-2 text-sm text-tip-red"
            >
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-email" className={labelClass}>
            Email
          </label>
          <input
            id="q-email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="q-location" className={labelClass}>
            Property city
          </label>
          <input
            id="q-location"
            name="location"
            type="text"
            autoComplete="address-level2"
            className={inputClass}
            placeholder="Ocean Springs, Biloxi…"
          />
        </div>
      </div>

      <div>
        <label htmlFor="q-surface" className={labelClass}>
          What needs washing?
        </label>
        <select
          id="q-surface"
          name="surface"
          defaultValue={services[0].title}
          className={`${inputClass} cursor-pointer`}
        >
          {services.map((s) => (
            <option key={s.slug}>{s.title}</option>
          ))}
          <option>More than one surface</option>
          <option>Not sure — come take a look</option>
        </select>
      </div>

      <div>
        <label htmlFor="q-message" className={labelClass}>
          About the surface *
        </label>
        <textarea
          id="q-message"
          name="message"
          rows={4}
          required
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "q-message-err" : "q-message-help"}
          className={inputClass}
          placeholder="Two-car driveway, black streaks down the north side of the roof…"
        />
        {errors.message ? (
          <p
            id="q-message-err"
            role="alert"
            className="mt-2 text-sm text-tip-red"
          >
            {errors.message}
          </p>
        ) : (
          <p id="q-message-help" className="mt-2 text-sm text-stone/70">
            Rough size and how long it&rsquo;s looked that way is plenty.
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer rounded-full bg-prussian px-10 py-4 font-display font-semibold text-chalk transition-colors duration-200 hover:bg-spray hover:text-prussian sm:w-auto"
      >
        Request my free quote
      </button>
    </form>
  );
}
