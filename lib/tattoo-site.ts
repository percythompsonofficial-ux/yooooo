/**
 * Single source of truth for Iron Tide Tattoo.
 *
 * Iron Tide is a demo studio: every contact detail below is a placeholder.
 * Swap in the real phone, email, address, and socials before launch.
 *
 * Visuals: each entry ships with an original drawn flash design. Drop the
 * studio's own photographs into /public/photos/tattoo using each entry's
 * `photo` filename and the photo takes over automatically — no code change.
 */

export const site = {
  name: "Iron Tide",
  fullName: "Iron Tide Tattoo",
  tagline: "Custom tattoos on the Mississippi Gulf Coast.",

  contact: {
    // Placeholder — replace with the studio's real number
    phoneDisplay: "(228) 555-0144",
    phoneHref: "tel:+12285550144",
    // Placeholder — set up this inbox or swap in the studio's email
    email: "bookings@irontidetattoo.com",
    instagram: "https://instagram.com/irontidetattoo",
    address: "1214 Howard Ave, Biloxi, MS 39530",
    mapsHref: "https://maps.google.com/?q=1214+Howard+Ave+Biloxi+MS",
  },

  hours: [
    { days: "Tue – Sat", time: "12 pm – 9 pm" },
    { days: "Sun", time: "1 pm – 6 pm" },
    { days: "Mon", time: "Closed" },
  ],

  // The flash-sheet marquee strip
  styles: [
    "American Traditional",
    "Fine Line",
    "Blackwork",
    "Neo-Traditional",
    "Japanese",
    "Realism",
    "Script & Lettering",
    "Cover-Ups",
  ],

  services: [
    {
      title: "Custom pieces",
      body: "Bring a reference, an idea, or a half-formed thought. Your artist draws it for you — nothing traced from the wall of another shop.",
    },
    {
      title: "Walk-ins",
      body: "Flash and small pieces, first come first served, every day we're open. Check the day's availability on Instagram before you drive over.",
    },
    {
      title: "Cover-ups & reworks",
      body: "Old ink, faded lines, names that didn't age well. We'll tell you honestly what a cover-up can and can't do before any deposit changes hands.",
    },
    {
      title: "Flash days",
      body: "One-day sheets at a flat price, announced on Instagram. First tide gets the pick of the sheet.",
    },
  ],

  artists: [
    {
      slug: "mara-vex",
      name: "Mara Vex",
      role: "Owner · American Traditional & Neo-Trad",
      years: "14 years",
      bio: "Mara apprenticed in New Orleans and opened Iron Tide in 2016. Bold lines, heavy color, and flash that nods to the sailor shops that used to line the coast highway.",
      instagram: "https://instagram.com/irontidetattoo",
      photo: "", // set to "/photos/tattoo/artist-<name>.jpg" once the photo exists
      design: "rose" as const,
    },
    {
      slug: "theo-reyes",
      name: "Theo Reyes",
      role: "Fine Line & Black-and-Grey Realism",
      years: "9 years",
      bio: "Theo works single-needle. Portraits, botanical pieces, and micro lettering — the kind of detail you lean in close to read.",
      instagram: "https://instagram.com/irontidetattoo",
      photo: "", // set to "/photos/tattoo/artist-<name>.jpg" once the photo exists
      design: "swallow" as const,
    },
    {
      slug: "june-okafor",
      name: "June Okafor",
      role: "Blackwork & Japanese",
      years: "11 years",
      bio: "June builds large-scale work — sleeves, back pieces, full compositions planned across sessions. Book a consult; big pieces start with a conversation.",
      instagram: "https://instagram.com/irontidetattoo",
      photo: "", // set to "/photos/tattoo/artist-<name>.jpg" once the photo exists
      design: "moth" as const,
    },
  ],

  /**
   * The work wall. Each entry shows the studio's photograph when `photo`
   * names a file under /public/photos/tattoo, and falls back to the drawn
   * flash design otherwise — so a slot is never empty while photos are
   * still being shot.
   */
  flash: [
    { name: "Traditional Swallow", design: "swallow" as const, photo: "", artist: "Mara Vex", style: "American Traditional", size: '3–4"', price: "$160" },
    { name: "Rose & Banner", design: "rose" as const, photo: "", artist: "Mara Vex", style: "American Traditional", size: '4–5"', price: "$200" },
    { name: "Coast Serpent", design: "snake" as const, photo: "", artist: "June Okafor", style: "Neo-Traditional", size: '6–8"', price: "$260" },
    { name: "Anchor & Rope", design: "anchor" as const, photo: "", artist: "Mara Vex", style: "American Traditional", size: '4"', price: "$180" },
    { name: "Death's-Head Moth", design: "moth" as const, photo: "", artist: "June Okafor", style: "Neo-Traditional", size: '5"', price: "$240" },
    { name: "Dagger & Heart", design: "dagger" as const, photo: "", artist: "Mara Vex", style: "American Traditional", size: '4–5"', price: "$200" },
    { name: "Nautical Star", design: "star" as const, photo: "", artist: "Theo Reyes", style: "American Traditional", size: '2–3"', price: "$120" },
    { name: "Biloxi Light", design: "lighthouse" as const, photo: "", artist: "Theo Reyes", style: "Neo-Traditional", size: '5"', price: "$210" },
  ],

  // A real sequence — the only place the site numbers anything
  process: [
    {
      step: "01",
      title: "Consult",
      body: "Free, in person or by email. Bring references and honest expectations. We talk placement, size, and budget before anything else.",
    },
    {
      step: "02",
      title: "Design",
      body: "Your artist draws the piece. A deposit holds your session and comes off the final price. One revision round is included.",
    },
    {
      step: "03",
      title: "Session",
      body: "Eat first. Sessions run from forty minutes to six hours by the piece. Numbing available for long sits — ask ahead.",
    },
    {
      step: "04",
      title: "Aftercare",
      body: "Written instructions go home with you, and free touch-ups within ninety days. Healed photos welcome — we want to see it settled in.",
    },
  ],

  reviews: [
    {
      quote:
        "Mara took a photo of my grandfather's boat and turned it into the best tattoo I own. Booked session two before I left the chair.",
      name: "Danielle R.",
      detail: "Neo-trad, upper arm",
    },
    {
      quote:
        "Theo's line work is unreal. Tiny script, six words, and every letter is clean a year later.",
      name: "Marcus T.",
      detail: "Fine line, collarbone",
    },
    {
      quote:
        "Walked in on a Saturday with a bad idea. Walked out with a better one and a flash piece I get asked about constantly.",
      name: "Alex P.",
      detail: "Walk-in flash",
    },
  ],

  faqs: [
    {
      q: "How much will my tattoo cost?",
      a: "The shop minimum is $100. Small flash runs $100–$250; custom work is quoted by the piece after your consult, and large-scale work is billed by the session. Your quote is settled before the deposit, not after.",
    },
    {
      q: "Do I need an appointment?",
      a: "For custom work, yes — book a consult first. Walk-ins are welcome for flash and small pieces any day we're open, first come first served.",
    },
    {
      q: "How does the deposit work?",
      a: "A $50–$100 deposit holds your session and comes off the final price. It covers drawing time, so it's non-refundable if you no-show — reschedules with 48 hours' notice keep the deposit.",
    },
    {
      q: "How old do I have to be?",
      a: "18, with a valid photo ID. Mississippi law — no exceptions, including with parental consent.",
    },
    {
      q: "How should I prepare for a session?",
      a: "Sleep, eat a real meal, hydrate, and skip alcohol for 24 hours before. Wear clothing that leaves the placement easy to reach.",
    },
    {
      q: "Do you do touch-ups?",
      a: "Free within ninety days on work we did, once it's fully healed. After that, touch-ups are the shop minimum.",
    },
  ],
} as const;

export type FlashItem = (typeof site.flash)[number];
export type Artist = (typeof site.artists)[number];
