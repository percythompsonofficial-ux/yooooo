/**
 * Saltline Surface Co. — Mississippi Gulf Coast exterior cleaning.
 *
 * ⚠ BEFORE LAUNCH — replace every value marked PLACEHOLDER.
 * The phone number below is in the 555-01xx range, which is reserved for
 * fictional use, and the reviews are sample copy written for layout. Swap in
 * the real number, email, address, insurance figure and genuine customer
 * quotes (with permission) before this site goes live.
 */

export const site = {
  name: "Saltline Surface Co.",
  shortName: "Saltline",
  tagline: "Exterior surface restoration for the Gulf Coast.",
  since: "2019", // PLACEHOLDER

  contact: {
    phoneDisplay: "(228) 555-0142", // PLACEHOLDER
    phoneHref: "tel:+12285550142", // PLACEHOLDER
    email: "quotes@saltlinesurface.com", // PLACEHOLDER
    cityState: "Ocean Springs, MS 39564", // PLACEHOLDER
    hours: "Mon–Sat, 7am–6pm",
  },

  serviceArea: [
    "Ocean Springs",
    "Biloxi",
    "Gulfport",
    "D'Iberville",
    "Gautier",
    "Pascagoula",
    "Long Beach",
    "Pass Christian",
    "Diamondhead",
    "Bay St. Louis",
  ],

  /** Equipment specs — true of a professional hot-water rig. Confirm insurance. */
  rig: [
    ["4,000", "PSI at the pump", "Dialed down per surface, never up"],
    ["8.0", "Gallons per minute", "Volume rinses; pressure only cuts"],
    ["200°F", "Hot water", "Lifts grease and oil cold water leaves"],
    ["$2M", "Liability insured", "Certificate on request"], // PLACEHOLDER figure
  ] as const,

  badges: [
    "Licensed & insured",
    "Soft-wash trained",
    "Free written quotes",
    "Gulf Coast owned",
  ],

  /** PLACEHOLDER — sample copy. Replace with real, permitted customer quotes. */
  reviews: [
    {
      quote:
        "I had written the driveway off and budgeted to replace it. Two hours later it looked like the day it was poured.",
      who: "Sample review",
      where: "Ocean Springs",
    },
    {
      quote:
        "They soft-washed the roof instead of talking me into a new one. That honesty is why they get the house every spring.",
      who: "Sample review",
      where: "Biloxi",
    },
    {
      quote:
        "Showed up when they said, taped the outlets, flushed the beds afterward. You could not tell anyone had been in the yard.",
      who: "Sample review",
      where: "Gulfport",
    },
  ],
};

/**
 * Services carry their real working spec. The tip colour is the industry
 * nozzle code (red 0°, yellow 15°, green 25°, white 40°, black soap), so the
 * label tells a homeowner exactly how much force touches their property.
 */
export type TipCode = "red" | "yellow" | "green" | "white" | "soap";

export const tipMeta: Record<TipCode, { color: string; label: string }> = {
  red: { color: "#e8402a", label: "0° red tip" },
  yellow: { color: "#d8951b", label: "15° yellow tip" },
  green: { color: "#2fa75f", label: "25° green tip" },
  white: { color: "#c9d2d6", label: "40° white tip" },
  soap: { color: "#0b1c26", label: "Black soap tip" },
};

export type Service = {
  slug: string;
  title: string;
  surface: string;
  tip: TipCode;
  spec: string;
  body: string;
  detail: string[];
};

export const services: Service[] = [
  {
    slug: "concrete",
    title: "Driveways & flatwork",
    surface: "concrete",
    tip: "green",
    spec: "25° · 3,200 PSI · surface cleaner",
    body: "The rotating surface cleaner passes at a fixed height, so the whole slab lifts evenly instead of leaving the striped zebra pattern a hand-held wand leaves behind.",
    detail: [
      "Oil and transmission spots pre-treated and hot-water lifted",
      "Rust and battery-acid staining treated chemically, not by grinding",
      "Edges and control joints cut in by hand after the machine pass",
    ],
  },
  {
    slug: "house-wash",
    title: "House soft wash",
    surface: "vinyl, stucco & Hardie",
    tip: "white",
    spec: "40° · under 150 PSI · detergent dwell",
    body: "Siding is cleaned with chemistry and rinse volume, not force. High pressure drives water behind lap joints and past window flashing — the damage shows up months later as a stain inside the wall.",
    detail: [
      "Outlets, lights and vents taped before anything is applied",
      "Detergent dwells to kill the growth so it stays gone longer",
      "Beds and foundation plantings pre-soaked and flushed after",
    ],
  },
  {
    slug: "roof",
    title: "Roof soft wash",
    surface: "asphalt shingle, tile & metal",
    tip: "soap",
    spec: "Soap tip · under 100 PSI · no scrubbing",
    body: "Those black streaks are gloeocapsa magma, a living algae feeding on the limestone filler in your shingles. Pressure would strip the granules — the only correct method applies a cleaner and lets it rinse.",
    detail: [
      "Meets shingle-manufacturer cleaning guidance; will not void a warranty",
      "Gutters and downspouts flushed as part of the job",
      "Typical result holds three to five years on the coast",
    ],
  },
  {
    slug: "masonry",
    title: "Brick & masonry",
    surface: "brick, block & stone",
    tip: "yellow",
    spec: "15° · 2,400 PSI · efflorescence treatment",
    body: "Old mortar is softer than the brick around it. We test an inconspicuous section first and step the pressure to whatever the weakest joint on the wall can take, not whatever the brick can.",
    detail: [
      "White efflorescence bloom dissolved rather than blasted off",
      "Repointing flagged for you if we find joints that need a mason",
      "Painted masonry handled at low pressure to keep the coating intact",
    ],
  },
  {
    slug: "wood",
    title: "Decks & fencing",
    surface: "cedar, pine & composite",
    tip: "white",
    spec: "40° · 1,200 PSI · brightener finish",
    body: "Wood is the surface most often ruined by pressure washing. Held too close, the wand tears out the soft summer grain and leaves furring no stain will ever sit flat on again.",
    detail: [
      "Cleaned along the grain at a consistent stand-off distance",
      "Neutralising brightener restores pH and evens the tone",
      "Left ready to seal — we'll tell you when it's dry enough",
    ],
  },
  {
    slug: "pavers",
    title: "Pavers & pool decks",
    surface: "travertine, paver & Kool Deck",
    tip: "green",
    spec: "25° · 2,000 PSI · re-sand included",
    body: "Washing pavers strips the joint sand that keeps them locked together. If nobody re-sands afterward the field starts to shift within a season, so we treat re-sanding as part of the job.",
    detail: [
      "Polymeric sand swept back into every joint and set",
      "Travertine and Kool Deck run at reduced pressure to protect the finish",
      "Pool chemistry protected — rinse water directed away from the water",
    ],
  },
];

/** A genuine sequence — the order is how the job actually runs. */
export const process = [
  {
    stage: "Walkthrough",
    body: "We look at the surface with you, test a small area out of sight, and tell you what will come off and what will not. Some staining is permanent, and you should hear that before you pay.",
  },
  {
    stage: "Pre-treat",
    body: "Detergent goes on and dwells. This is the step that actually kills the algae and mildew — skipping it is why a cheap wash looks green again by August.",
  },
  {
    stage: "Wash",
    body: "The right tip at the right distance, in consistent overlapping passes. Nothing gets a higher pressure than the material can take, even when it would be faster.",
  },
  {
    stage: "Rinse & detail",
    body: "Edges, glass, thresholds and light fixtures by hand. Plants and beds get flushed with clean water, and the runoff is directed away from the pool and the storm drain.",
  },
  {
    stage: "Walk it with you",
    body: "You look at the finished surface before we load the trailer. If something needs another pass, it gets another pass — that is not a change order.",
  },
];

export type Site = typeof site;
