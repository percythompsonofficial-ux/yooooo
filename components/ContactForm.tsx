"use client";

import { useState } from "react";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const inputClass =
  "w-full bg-white/70 border border-ink/25 px-4 py-3.5 text-ink placeholder:text-ink/40 focus:border-brass-deep transition-colors duration-200";

function validate(form: HTMLFormElement): Errors {
  const data = new FormData(form);
  const errors: Errors = {};
  if (!String(data.get("name") ?? "").trim()) {
    errors.name = "Please tell us your name.";
  }
  const email = String(data.get("email") ?? "").trim();
  if (!email) {
    errors.email = "Please provide an email so we can reply.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That email doesn't look complete — check the address.";
  }
  if (!String(data.get("message") ?? "").trim()) {
    errors.message = "Tell us a little about your grounds.";
  }
  return errors;
}

export default function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = form.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    const data = new FormData(form);
    const subject = encodeURIComponent(
      `Consultation request — ${data.get("name")}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Phone: ${data.get("phone") || "—"}`,
        `Property: ${data.get("location") || "—"}`,
        `Interest: ${data.get("service")}`,
        "",
        String(data.get("message")),
      ].join("\n"),
    );
    window.location.href = `mailto:studio@beaujardin.co?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="border border-brass-deep/50 bg-white/60 p-10 text-center"
      >
        <p className="font-display text-3xl font-semibold text-ink">
          Thank you.
        </p>
        <p className="mt-4 text-ink/75 leading-relaxed">
          Your email draft has opened in your mail app — send it on its way and
          we&apos;ll reply within one business day. If it didn&apos;t open,
          write us directly at{" "}
          <a
            href="mailto:studio@beaujardin.co"
            className="text-brass-deep underline underline-offset-4"
          >
            studio@beaujardin.co
          </a>{" "}
          or call{" "}
          <a
            href="tel:+12285550184"
            className="text-brass-deep underline underline-offset-4"
          >
            (228) 555-0184
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-xs uppercase tracking-[0.18em] text-ink/70 mb-2">
            Name <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
            placeholder="Marguerite Fontaine"
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-2 text-sm text-red-800">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-[0.18em] text-ink/70 mb-2">
            Email <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-2 text-sm text-red-800">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-xs uppercase tracking-[0.18em] text-ink/70 mb-2">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="(228) 555-0000"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-xs uppercase tracking-[0.18em] text-ink/70 mb-2">
            Property location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className={inputClass}
            placeholder="Biloxi, Ocean Springs…"
          />
        </div>
      </div>

      <div>
        <label htmlFor="service" className="block text-xs uppercase tracking-[0.18em] text-ink/70 mb-2">
          What can we help with?
        </label>
        <select id="service" name="service" className={`${inputClass} cursor-pointer`}>
          <option>Landscape design & build</option>
          <option>Native & coastal planting</option>
          <option>Estate grounds care</option>
          <option>Garden lighting</option>
          <option>Irrigation & drainage</option>
          <option>Outdoor living</option>
          <option>Not sure yet — let&apos;s talk</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs uppercase tracking-[0.18em] text-ink/70 mb-2">
          About your grounds <span aria-hidden="true" className="text-brass-deep">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : "message-help"}
          className={inputClass}
          placeholder="The property, what you love about it, what isn't working…"
        />
        {errors.message ? (
          <p id="message-error" role="alert" className="mt-2 text-sm text-red-800">
            {errors.message}
          </p>
        ) : (
          <p id="message-help" className="mt-2 text-xs text-ink/50">
            A sentence or two is plenty — we&apos;ll ask the rest on the walk.
          </p>
        )}
      </div>

      <button
        type="submit"
        className="inline-block text-[0.78rem] uppercase tracking-[0.22em] px-10 py-4 bg-brass-deep text-linen hover:bg-ink transition-colors duration-200 cursor-pointer"
      >
        Send Request
      </button>
    </form>
  );
}
