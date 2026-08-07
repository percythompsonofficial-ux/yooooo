import type { Lead } from "./types";

/**
 * Practice leads. Each one exercises a different combination of
 * industry easy-question, website branch, mood, and objection set,
 * so repeated runs don't drill the same path.
 *
 * Every business here is fictional. The observations marked
 * `fabricated` are the traps — they invent a referral, a result, a
 * customer relationship, a local connection, or urgency, all of which
 * the SOP lists under NEVER.
 */
export const LEADS: Lead[] = [
  {
    id: "gulf-shine",
    firstName: "Marcus",
    lastName: "Bell",
    business: "Gulf Shine Auto Detailing",
    industry: "Detailing",
    service: "mobile detailing",
    area: "Gulfport",
    webState: "none",
    mood: "receptive",
    email: "marcus@gulfshinedetail.com",
    phone: "(228) 555-0143",
    timezone: "Central",
    brief: [
      "Facebook page with 1.2k followers, posts 3-4 times a week.",
      "No website — the page bio links to a Linktree with a phone number.",
      "Recent posts show ceramic coating and interior packages.",
      "Comments asking for pricing go unanswered for days.",
    ],
    easyQuestion:
      "Do you mostly run fixed packages, or can you customize it around the vehicle?",
    observations: [
      {
        id: "no-site",
        text: "there isn't a clear website where someone can understand the services, request a quote, or book",
      },
      {
        id: "unanswered",
        text: "a few pricing questions in your recent comments look like they went unanswered for a couple of days",
      },
      {
        id: "vague",
        text: "your online presence could probably be a lot stronger",
        vague: true,
        note: "Truthful, but it names no specific gap. The SOP asks for one clear observation, not a general critique.",
      },
      {
        id: "fab-referral",
        text: "a buddy of mine had you detail his truck last month and said I should reach out",
        fabricated: true,
        note: "Invents a referral and a customer relationship.",
      },
      {
        id: "fab-result",
        text: "we took a detailer in Mobile from 12 to 40 bookings a month doing exactly this",
        fabricated: true,
        note: "Invents a result. Only approved proof may be used.",
      },
    ],
    objections: ["how-much", "send-information"],
  },
  {
    id: "delta-air",
    firstName: "Renee",
    lastName: "Okafor",
    business: "Delta Air Solutions",
    industry: "HVAC",
    service: "HVAC service and installs",
    area: "Hattiesburg",
    webState: "weak",
    mood: "busy",
    email: "office@deltaairsolutions.com",
    phone: "(601) 555-0188",
    timezone: "Central",
    brief: [
      "Five-page website, last blog post is from 2023.",
      "Contact page is a form only — no phone number above the fold.",
      "No booking widget; the form says 'we respond within 48 hours'.",
      "Google listing shows 61 reviews at 4.6 stars.",
    ],
    easyQuestion: "Are you mostly residential calls, or commercial too?",
    observations: [
      {
        id: "after-hours",
        text: "there isn't an easy way for a visitor to book or get an immediate response — the form says 48 hours",
      },
      {
        id: "no-phone",
        text: "the contact page doesn't show a phone number until you scroll, so an after-hours visitor has one slow option",
      },
      {
        id: "vague",
        text: "the website looks a little dated compared to your competitors",
        vague: true,
        note: "It's an opinion about appearance, not a growth-system gap. Nothing here connects to a lead leak.",
      },
      {
        id: "fab-urgency",
        text: "we only have two onboarding slots left this quarter for the Hattiesburg area",
        fabricated: true,
        note: "Invents a reason for urgency and a local exclusivity that does not exist.",
      },
      {
        id: "fab-relationship",
        text: "we already work with a couple of other HVAC companies in your market",
        fabricated: true,
        note: "Invents customer relationships as social proof.",
      },
    ],
    objections: ["im-busy", "already-have-it"],
  },
  {
    id: "keystone-plumb",
    firstName: "Dwight",
    lastName: "Ramos",
    business: "Keystone Plumbing Co.",
    industry: "Plumbing",
    service: "residential plumbing",
    area: "Slidell",
    webState: "strong",
    mood: "guarded",
    email: "dwight@keystoneplumbingco.com",
    phone: "(985) 555-0117",
    timezone: "Central",
    brief: [
      "Modern website with online booking and live chat.",
      "Emergency line advertised 24/7.",
      "Runs Google Ads — site appears in the top sponsored slot.",
      "No visible way to tell what happens to a lead after it comes in.",
    ],
    easyQuestion:
      "Is it mostly scheduled jobs, emergency calls, or both?",
    observations: [
      {
        id: "post-lead",
        text: "what I couldn't tell from the outside is what happens after a lead calls or submits a form — whether it's all tracked in one system",
      },
      {
        id: "ads-spend",
        text: "you're paying for the top ad slot, and I couldn't tell from outside whether every one of those clicks gets a second follow-up attempt",
      },
      {
        id: "vague",
        text: "there are probably some gaps in your process somewhere",
        vague: true,
        note: "This names nothing. A guarded prospect will read it as a script with no homework behind it.",
      },
      {
        id: "fab-audit",
        text: "we ran an audit on your account and found you're losing about 30% of your leads",
        fabricated: true,
        note: "Invents a result and an audit that never happened.",
      },
      {
        id: "fab-connection",
        text: "I grew up right there in Slidell, so I know the market well",
        fabricated: true,
        note: "Invents a local connection.",
      },
    ],
    objections: ["not-interested", "already-have-it"],
  },
  {
    id: "ridgeline",
    firstName: "Tara",
    lastName: "Whitfield",
    business: "Ridgeline Roofing",
    industry: "Roofing",
    service: "roof repairs and replacements",
    area: "Mobile",
    webState: "weak",
    mood: "neutral",
    email: "tara@ridgelineroofs.com",
    phone: "(251) 555-0164",
    timezone: "Central",
    brief: [
      "One-page website with a gallery and a phone number.",
      "No quote request form; the CTA is 'Call us today'.",
      "Facebook shows storm-damage jobs posted weekly.",
      "Reviews mention 'took a while to hear back'.",
    ],
    easyQuestion: "Do you do repairs, replacements, or both?",
    observations: [
      {
        id: "no-form",
        text: "the only way to reach you from the site is to call — there's no way to request a quote if someone's looking at midnight",
      },
      {
        id: "reviews",
        text: "a couple of your reviews mention it took a while to hear back, which usually points at follow-up rather than the work itself",
      },
      {
        id: "vague",
        text: "I think there's some money being left on the table",
        vague: true,
        note: "A claim, not an observation. It also edges toward inventing a result.",
      },
      {
        id: "fab-storm",
        text: "after the last storm we helped three roofers in Mobile double their booked inspections",
        fabricated: true,
        note: "Invents results and customer relationships, and leans on storm urgency.",
      },
    ],
    objections: ["send-information", "call-later"],
  },
  {
    id: "harbor-lending",
    firstName: "Priya",
    lastName: "Nandal",
    business: "Harbor Point Lending",
    industry: "Mortgage",
    service: "residential mortgage lending",
    area: "Pensacola",
    webState: "strong",
    mood: "guarded",
    email: "priya@harborpointlending.com",
    phone: "(850) 555-0129",
    timezone: "Central",
    brief: [
      "Polished website with a rate calculator and application portal.",
      "Team page lists six loan officers.",
      "Active on LinkedIn; posts market updates twice a week.",
      "No indication of how inbound applications are routed or chased.",
    ],
    easyQuestion:
      "Is it mostly purchase, refinance, or investor borrowers?",
    observations: [
      {
        id: "routing",
        text: "with six officers on the team, I couldn't tell from outside how an inbound application gets routed or who owns the follow-up",
      },
      {
        id: "calculator",
        text: "someone can run a rate calculation without ever leaving a name, so I couldn't tell whether those visits turn into anything trackable",
      },
      {
        id: "fab-volume",
        text: "I know you're doing about $40 million a year and could be doing more",
        fabricated: true,
        note: "Invents a number about the business. The SOP is explicit: do not invent numbers, ask for them.",
      },
      {
        id: "fab-dnc",
        text: "one of your loan officers filled out our form asking for a callback",
        fabricated: true,
        note: "Invents a prior relationship and a reason for the call.",
      },
    ],
    objections: ["not-interested", "take-me-off"],
  },
  {
    id: "bayou-hvac",
    firstName: "Curtis",
    lastName: "Lemieux",
    business: "Bayou Comfort Heating & Air",
    industry: "HVAC",
    service: "heating and air",
    area: "Lafayette",
    webState: "none",
    mood: "neutral",
    email: "bayoucomfort@gmail.com",
    phone: "(337) 555-0192",
    timezone: "Central",
    brief: [
      "No website at all — a Google Business Profile and a Facebook page.",
      "Profile lists a mobile number as the primary contact.",
      "Photos are from two years ago.",
      "Messenger shows 'Typically replies within a day'.",
    ],
    easyQuestion: "Are you mostly residential calls, or commercial too?",
    observations: [
      {
        id: "no-site",
        text: "I couldn't find a website where someone can see the services or request a quote — it looks like the Google profile is doing all the work",
      },
      {
        id: "messenger",
        text: "your Messenger says it typically replies within a day, and for heating and air that's usually after they've called somebody else",
      },
      {
        id: "vague",
        text: "your marketing could use some help",
        vague: true,
        note: "Generic and slightly insulting. It names no gap and invites a defensive answer.",
      },
      {
        id: "fab-competitor",
        text: "your main competitor down the road is already using our system",
        fabricated: true,
        note: "Invents a customer relationship and manufactures competitive urgency.",
      },
    ],
    objections: ["im-busy", "how-much"],
  },
];

export function leadById(id: string): Lead | undefined {
  return LEADS.find((l) => l.id === id);
}
