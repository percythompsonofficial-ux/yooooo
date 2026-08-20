/**
 * Single source of truth for InkdUpJo.
 *
 * CONFIRMED from the artist's own Instagram profile (@inkdupjo, verified):
 * the display name "Tatz by Jo", the location Gautier, Mississippi, the
 * shop account @spittin_ink_kreations, the $50 non-refundable deposit, the
 * 18+ / ID-required policy, and the posted price list below.
 *
 * STILL PLACEHOLDER — replace before launch: phone, email, street address,
 * opening hours, and the artist bio. Nothing below invents a price, a
 * guarantee, or a client review.
 *
 * Photos: drop files in /public/photos/tattoo and point each `photo` field
 * at them. A slot with no photo holds its space with a plain panel.
 */

export const site = {
  name: "InkdUpJo",
  fullName: "InkdUpJo Tattoo",
  studio: "Spittin Ink Kreations",
  altName: "Tatz by Jo",
  tagline: "Custom script, black-and-grey, and sleeve work.",
  location: "Gautier, Mississippi",

  contact: {
    // Real, from the artist's Instagram
    instagram: "https://instagram.com/inkdupjo",
    instagramHandle: "@inkdupjo",
    // The shop account, per the artist's profile
    shopInstagram: "https://instagram.com/spittin_ink_kreations",
    shopHandle: "@spittin_ink_kreations",
    // Placeholders — replace with the shop's real details
    phoneDisplay: "(000) 000-0000",
    phoneHref: "tel:+10000000000",
    email: "bookings@inkdupjo.com",
    // Real city, per the artist's profile. No street address supplied yet.
    area: "Gautier, Mississippi",
  },

  // Placeholder — confirm real opening hours
  hours: [
    { days: "Tue – Sat", time: "By appointment" },
    { days: "Sun – Mon", time: "Closed" },
  ],

  /** Booking terms, straight from the artist's Instagram profile. */
  booking: {
    deposit: "$50",
    depositNote: "Non-refundable, and it comes off the final price.",
    minimumAge: "18+ with a valid photo ID",
  },

  /**
   * The artist's posted price list. Every figure is his own; the note is a
   * paraphrase of the one printed on his price sheet.
   */
  pricing: [
    { item: "Name tattoos", price: "$40" },
    { item: "Palm-sized tattoos", price: "$100+" },
    { item: "Hand tattoos", price: "$120+" },
    { item: "Spine tattoos", price: "$120+" },
    { item: "Chest — half", price: "$150+" },
    { item: "Quarter sleeves", price: "$200+" },
    { item: "Chest — full", price: "$300+" },
    { item: "Full sleeves", price: "$500+" },
  ],
  pricingNote:
    "Prices vary with detail, size, placement, and complexity. Custom designs may require a deposit, and final pricing is always confirmed before tattooing starts.",

  /** Styles visible in the artist's own posted work. */
  styles: [
    "Script & Lettering",
    "Black & Grey",
    "Realism",
    "Portraits",
    "Religious Pieces",
    "Japanese",
    "Colour Work",
    "Sleeve Work",
    "Cloud & Smoke Fill",
  ],

  services: [
    {
      title: "Custom pieces",
      body: "Bring a reference, a verse, or an idea and it gets drawn for you. Every piece on this page started as somebody's own idea.",
    },
    {
      title: "Sleeves, session by session",
      body: "Large work is planned across sittings — filler, background, and flow mapped out so the finished arm reads as one piece.",
    },
    {
      title: "Script & lettering",
      body: "Verses, names, and passages in fine script, with colour picked out where it should carry weight.",
    },
    {
      title: "Finishing work",
      body: "Gaps closed, backgrounds tied together, existing pieces brought into one composition.",
    },
  ],

  artists: [
    {
      slug: "inkdupjo",
      name: "InkdUpJo",
      role: "Tatz by Jo · Gautier, Mississippi",
      // Placeholder — replace with the artist's own words
      bio: "Custom script, black-and-grey and sleeve work. Booking runs through Instagram DMs — send your idea, placement, and rough size to get started.",
      instagram: "https://instagram.com/inkdupjo",
      photo: "", // "/photos/tattoo/artist-jo.jpg"
    },
  ],

  /**
   * The artist's real posted work. `style` is kept to a few broad buckets so
   * the gallery filter actually groups pieces; the finer description of each
   * piece lives in its `note`. `photo` stays empty until the image file is
   * added to /public/photos/tattoo — no stand-in art is shown in its place.
   */
  work: [
    {
      slug: "proverbs",
      name: "Proverbs 13:4",
      placement: "Upper arm — sleeve finish",
      style: "Script & Lettering",
      note: "Red script heading over a fine-script passage, with a winged cherub, cross, and cloud fill closing out the sleeve.",
      focus: "center",
      photo: "/photos/tattoo/work-proverbs.jpg",
    },
    {
      slug: "in-his-time",
      name: "When the Time Is Right",
      placement: "Forearm",
      style: "Script & Lettering",
      note: "A realistic eye above banked cloudwork, script running down the forearm into stacked gothic crosses.",
      focus: "center",
      photo: "/photos/tattoo/work-in-his-time.jpg",
    },
    {
      slug: "no-mercy",
      name: "Protect · Respect · Mercy",
      placement: "Forearm to hand",
      style: "Script & Lettering",
      note: "Three-line script with the key words picked out in colour, running into smoke and skull work across the hand.",
      focus: "58% 34%",
      photo: "/photos/tattoo/work-no-mercy.jpg",
    },
    {
      slug: "madonna",
      name: "Madonna",
      placement: "Half sleeve",
      style: "Black & Grey",
      note: "Veiled portrait with a single red tear above a radiant cross, shaded in soft black and grey.",
      focus: "center",
      photo: "/photos/tattoo/work-madonna.jpg",
    },
    {
      slug: "dragon-hibiscus",
      name: "Dragon & Hibiscus",
      placement: "Leg", // inferred from the photo — confirm with the artist
      style: "Colour",
      note: "A coiled dragon in full colour over a hibiscus bloom, finished with red lettering — the brightest piece in the portfolio.",
      focus: "center",
      photo: "", // "/photos/tattoo/work-dragon.jpg"
    },
    {
      slug: "sun-lilies-sleeve",
      name: "Sun & Lilies",
      placement: "Full sleeve",
      style: "Colour",
      note: "A red sun and crescent moon set over lilies, a rose, and butterflies, with black-and-grey shading carrying the fill down the arm.",
      focus: "center 40%",
      photo: "/photos/tattoo/work-sun-sleeve.jpg"
    },
  ],

  /** Generic and safe — confirm each answer with the artist before launch. */
  faqs: [
    {
      q: "How do I book?",
      a: "Send a DM on Instagram to @inkdupjo with your idea, the placement, and a rough size. Reference photos help. A $50 deposit holds the session.",
    },
    {
      q: "How much will my tattoo cost?",
      a: "There's a posted price list — name tattoos start at $40, palm-sized at $100, quarter sleeves at $200, full sleeves at $500. Prices move with detail, size, placement, and complexity, and the final figure is confirmed before any needle touches skin.",
    },
    {
      q: "How does the deposit work?",
      a: "A $50 deposit books your session and comes off the final price. It's non-refundable — it covers the drawing time already spent on your piece.",
    },
    {
      q: "Do you take walk-ins?",
      a: "Message first to check the day's availability — appointments come first.",
    },
    {
      q: "How old do I have to be?",
      a: "18 or over, with a valid photo ID — no exceptions. Bring it to every session.",
    },
    {
      q: "How should I prepare for a session?",
      a: "Sleep, eat a real meal beforehand, drink water, and skip alcohol for 24 hours. Wear something that leaves the placement easy to reach.",
    },
    {
      q: "How long does a sleeve take?",
      a: "Large work runs across several sittings. You'll get a plan for how many, and roughly how long each one runs, before the first needle.",
    },
  ],
} as const;

export type WorkItem = (typeof site.work)[number];
export type Artist = (typeof site.artists)[number];
