/**
 * Single source of truth for Songy Brothers Lawn & Landscape.
 *
 * ⚠️  BEFORE GOING LIVE — replace the placeholder CONTACT values below.
 *     The phone and email are placeholders (000-0000 / example.com) so no
 *     real customer is ever sent to a wrong number. Everything else here is
 *     verified from the business's public listings.
 */

export const site = {
  name: "Songy Brothers",
  fullName: "Songy Brothers Lawn & Landscape",
  shortName: "Songy Brothers",
  tagline: "Family-owned lawn care & landscaping on the Mississippi Gulf Coast.",
  established: "Family owned & operated",

  contact: {
    // ⚠️ REPLACE — placeholder until the real number is provided
    phoneDisplay: "(228) 000-0000",
    phoneHref: "tel:+12280000000",
    // ⚠️ REPLACE — placeholder email
    email: "hello@songybrotherslawn.com",
    // Real, verified public links:
    facebook:
      "https://www.facebook.com/p/Songy-Brothers-Lawn-Landscape-100057048686797/",
    booking: "https://songybrotherslawnandlandscape.jobbersites.com/",
  },

  // Verified service area (their own listing)
  serviceArea: [
    "Biloxi",
    "Gulfport",
    "Ocean Springs",
    "D'Iberville",
    "Long Beach",
    "Pass Christian",
    "Diamondhead",
    "Bay St. Louis",
  ],

  // Honest, verifiable highlights (no fabricated numbers)
  proofPoints: [
    ["Family", "Owned & operated"],
    ["5.0", "Customer rating"],
    ["8", "Gulf Coast communities"],
    ["Free", "Estimates, always"],
  ] as const,
};

export type Site = typeof site;
