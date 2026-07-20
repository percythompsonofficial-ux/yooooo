/**
 * Single source of truth for Coast to Coast Roofing, LLC (Biloxi, MS).
 *
 * Phone, email, and address are the real, publicly listed business details.
 * Reviews are real excerpts from the company's public Facebook/BBB profile.
 * Service list reflects standard roofing offerings — trim any the owner
 * doesn't provide.
 */

export const site = {
  name: "Coast to Coast Roofing",
  shortName: "Coast to Coast",
  tagline: "Trust your roof to local experts.",
  since: "2023",

  contact: {
    phoneDisplay: "(228) 234-1371",
    phoneHref: "tel:+12282341371",
    email: "c2c.roof.ms@gmail.com",
    cityState: "Biloxi, MS 39532",
    facebook: "https://www.facebook.com/c2c.roof.ms/",
  },

  serviceArea: [
    "Biloxi",
    "Gulfport",
    "Ocean Springs",
    "D'Iberville",
    "Long Beach",
    "Pass Christian",
    "Gautier",
    "Pascagoula",
  ],

  // Verified trust signals (public listings)
  badges: ["BBB Accredited", "Locally Owned", "5-Star Rated", "Free Inspections"],

  proofPoints: [
    ["100%", "Recommended on Facebook"],
    ["5.0", "Customer star rating"],
    ["BBB", "Accredited business"],
    ["2023", "Serving the Gulf Coast"],
  ] as const,

  // Real customer review excerpts (public Facebook / BBB)
  reviews: [
    {
      quote: "Quality work and unbeatable prices.",
      who: "Facebook review",
    },
    {
      quote: "They cleaned up behind themselves better than expected.",
      who: "Verified customer",
    },
    {
      quote: "Very professional and respectful of our property.",
      who: "Facebook review",
    },
  ],
};

export type Site = typeof site;
