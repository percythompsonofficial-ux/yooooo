/**
 * Single source of truth for InkdUpJo.
 *
 * CONFIRMED from the artist's own Instagram: the handle @inkdupjo, the
 * studio name "Spittin Ink Kreations", and that booking runs through
 * Instagram DMs.
 *
 * STILL PLACEHOLDER — replace before launch: phone, email, address, hours,
 * the artist bio, and every FAQ answer. Nothing below invents a price, a
 * deposit amount, a guarantee, or a client review.
 *
 * Photos: drop files in /public/photos/tattoo and point each `photo` field
 * at them. A slot with no photo holds its space with a plain panel.
 */

export const site = {
  name: "InkdUpJo",
  fullName: "InkdUpJo Tattoo",
  studio: "Spittin Ink Kreations",
  tagline: "Custom script, black-and-grey, and sleeve work.",

  contact: {
    // Real, from the artist's Instagram
    instagram: "https://instagram.com/inkdupjo",
    instagramHandle: "@inkdupjo",
    // Placeholders — replace with the shop's real details
    phoneDisplay: "(000) 000-0000",
    phoneHref: "tel:+10000000000",
    email: "bookings@inkdupjo.com",
    // No street address until the artist supplies one
    area: "Ask for the shop location when you book",
  },

  // Placeholder — confirm real opening hours
  hours: [
    { days: "Tue – Sat", time: "By appointment" },
    { days: "Sun – Mon", time: "Closed" },
  ],

  /** Styles visible in the artist's own posted work. */
  styles: [
    "Script & Lettering",
    "Black & Grey",
    "Realism",
    "Portraits",
    "Religious Pieces",
    "Sleeve Work",
    "Cloud & Smoke Fill",
    "Color Accents",
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
      role: "Spittin Ink Kreations",
      // Placeholder — replace with the artist's own words
      bio: "Custom script, black-and-grey and sleeve work. Booking runs through Instagram DMs — send your idea, placement, and rough size to get started.",
      instagram: "https://instagram.com/inkdupjo",
      photo: "", // "/photos/tattoo/artist-jo.jpg"
    },
  ],

  /**
   * The artist's real posted work. `photo` stays empty until the image file
   * is added to /public/photos/tattoo — no stand-in art is shown in its place.
   */
  work: [
    {
      slug: "proverbs",
      name: "Proverbs 13:4",
      placement: "Upper arm — sleeve finish",
      style: "Script & Black-and-Grey",
      note: "Red script heading over a fine-script passage, with a winged cherub, cross, and cloud fill closing out the sleeve.",
      photo: "", // "/photos/tattoo/work-proverbs.jpg"
    },
    {
      slug: "in-his-time",
      name: "When the Time Is Right",
      placement: "Forearm",
      style: "Script & Realism",
      note: "A realistic eye above banked cloudwork, script running down the forearm into stacked gothic crosses.",
      photo: "", // "/photos/tattoo/work-in-his-time.jpg"
    },
    {
      slug: "no-mercy",
      name: "Protect · Respect · Mercy",
      placement: "Forearm to hand",
      style: "Script & Colour Accents",
      note: "Three-line script with the key words picked out in colour, running into smoke and skull work across the hand.",
      photo: "", // "/photos/tattoo/work-no-mercy.jpg"
    },
    {
      slug: "madonna",
      name: "Madonna",
      placement: "Half sleeve",
      style: "Black & Grey Realism",
      note: "Veiled portrait with a single red tear above a radiant cross, shaded in soft black and grey.",
      photo: "", // "/photos/tattoo/work-madonna.jpg"
    },
  ],

  /** Generic and safe — confirm each answer with the artist before launch. */
  faqs: [
    {
      q: "How do I book?",
      a: "Send a DM on Instagram to @inkdupjo with your idea, the placement, and a rough size. Reference photos help.",
    },
    {
      q: "How much will my tattoo cost?",
      a: "Pricing is quoted per piece once the design and size are settled. Ask when you send your idea over and you'll get a straight answer before anything is booked.",
    },
    {
      q: "Do you take walk-ins?",
      a: "Message first to check the day's availability — appointments come first.",
    },
    {
      q: "How old do I have to be?",
      a: "18 or over, with a valid government photo ID. Bring it to every session.",
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
