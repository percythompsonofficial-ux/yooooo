/**
 * Single source of truth for Songy Brothers Lawn & Landscape.
 *
 * Phone is the real business number. The email is a placeholder address —
 * set up an inbox at this address (or swap in the owner's preferred email,
 * e.g. a Gmail) so the contact form and mailto links actually reach someone.
 */

export const site = {
  name: "Songy Brothers",
  fullName: "Songy Brothers Lawn & Landscape",
  shortName: "Songy Brothers",
  tagline: "Family-owned lawn care & landscaping on the Mississippi Gulf Coast.",
  established: "Family owned & operated",

  contact: {
    // Real business number
    phoneDisplay: "(601) 590-0893",
    phoneHref: "tel:+16015900893",
    // Made-up address — set up this inbox, or swap in the owner's real email
    email: "info@songybrotherslawn.com",
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
