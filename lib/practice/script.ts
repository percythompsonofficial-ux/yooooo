import type { Beat, Lead, Objection, ObjectionId, RunFlags } from "./types";

/**
 * The call, as beats.
 *
 * Every "correct" option is the SAY box from the master script, with the
 * lead's details interpolated. The distractors are the failure modes the
 * SOP calls out by name: telemarketer energy, listing every product,
 * open-ended availability, hanging up before the invite is accepted,
 * talking over the commitment, and inventing anything at all.
 *
 * Points per beat sum to the manager scorecard's category totals:
 *   opening 20 · observation 20 · transition 15 · calendar 20
 *   commitment 15 · handoff 10  =  100
 */
export function buildBeats(lead: Lead): Beat[] {
  const branchQuestion = {
    none: "Is most of your business coming through referrals and social media right now?",
    weak: "What normally happens when someone visits after hours?",
    strong: "Is everything tracked and followed up through one system?",
  }[lead.webState];

  return [
    // ---------------------------------------------------------------- Move 1
    {
      id: "m1",
      move: 1,
      label: "Open",
      category: "opening",
      points: 10,
      prospect: "Hello?",
      delivery:
        "Slow and curious. Slight upward inflection on the business question. Pause for the answer.",
      options: [
        {
          id: "m1-a",
          text: "Hey, is this {firstName}? … Hey {firstName}, how's it going, man? … Good, man. It's going. I was looking at {business}'s pages. You handle {service} around {area}, right?",
          verdict: "correct",
          credit: 1,
          patience: 5,
          reply:
            "Yeah, this is {firstName}. Doing alright. Yeah, that's us — {service}, all over {area}.",
          note: "This is the master script. You verified the person, sounded human, and used the business question to earn the next twenty seconds.",
        },
        {
          id: "m1-b",
          text: "Hi, may I please speak with the owner or manager of {business}?",
          verdict: "poor",
          credit: 0.15,
          patience: -20,
          reply: "…Who's calling?",
          note: "Telemarketer energy — the exact thing the tonality guide tells you to avoid at the opening. Asking for 'the owner or manager' announces that you don't know who you called.",
        },
        {
          id: "m1-c",
          text: "Hi {firstName}, my name is {repName} and I'm calling from AI AT WORK. We help service businesses capture and convert more leads. Do you have a couple of minutes?",
          verdict: "poor",
          credit: 0.2,
          patience: -18,
          reply: "I'm good, man. We're not looking for anything right now.",
          note: "You opened with a pitch and then asked permission. Move 1 verifies the person and asks about their business — it does not introduce the product.",
        },
        {
          id: "m1-d",
          text: "Hey, is this {firstName}? Hey man, good to finally talk — I've been meaning to reach out for a while now.",
          verdict: "poor",
          credit: 0.1,
          patience: -22,
          reply: "Have we talked before? I don't think I know you.",
          note: "'Finally' and 'meaning to reach out' imply a prior relationship. That is a fabricated connection and the SOP lists it under NEVER.",
          failure: "fabrication",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 2
    {
      id: "m2",
      move: 2,
      label: "Ask about the business",
      category: "opening",
      points: 10,
      prospect:
        "Yeah, that's right. What's this about though — you selling something?",
      delivery:
        "Ask an easy question the owner will enjoy answering. Listen completely.",
      options: [
        {
          id: "m2-a",
          text: "I was looking through your services. {easyQuestion}",
          verdict: "correct",
          credit: 1,
          patience: 6,
          reply:
            "Ha — depends. Honestly it's a bit of both, and it changes week to week. Most guys don't ask that.",
          note: "The industry easy-question from the SOP. It gets the owner talking about their own operation, which is the whole point of Move 2.",
        },
        {
          id: "m2-b",
          text: "I'll be straight with you — yes, we sell growth systems. But give me thirty seconds and you'll see why I called.",
          verdict: "weak",
          credit: 0.35,
          patience: -10,
          reply: "Alright, thirty seconds.",
          note: "Honest, but you skipped Move 2 entirely and put yourself on a stopwatch. You now have to pitch before you know anything about the business.",
        },
        {
          id: "m2-c",
          text: "Not selling anything. I just had a quick question about how you handle your leads and your follow-up process — do you have a CRM in place?",
          verdict: "poor",
          credit: 0.2,
          patience: -14,
          reply: "I mean… we've got a system. Why?",
          note: "Two problems. 'Not selling anything' isn't true, and a CRM question is an interrogation about your product, not an easy question about their business.",
        },
        {
          id: "m2-d",
          text: "How many jobs are you closing a month right now?",
          verdict: "poor",
          credit: 0.1,
          patience: -20,
          reply: "That's not really something I'd get into with someone I don't know.",
          note: "You'll need this number later, but not now. Asking for revenue before you've earned any trust reads as qualifying, not curiosity.",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 3
    {
      id: "m3",
      move: 3,
      label: "Give the reason for calling",
      category: "observation",
      points: 12,
      prospect: "Okay… so what's the actual reason for the call?",
      delivery:
        "Calm, factual, downward inflection. Name one problem, not every service.",
      options: [
        {
          id: "m3-a",
          text: "Got it. The reason I called is we work with businesses like yours to find holes in how leads are captured and followed up — things like the website, missed calls, booking, CRM, and follow-up. I was looking at your setup and noticed {observation}. " +
            branchQuestion,
          verdict: "correct",
          credit: 1,
          patience: 4,
          reply:
            "Yeah… that's fair, actually. We've talked about fixing that. It just never gets to the top of the list.",
          note: "Master script, one truthful observation, then the branch question for this lead's website state. You named a single problem and handed the conversation back.",
        },
        {
          id: "m3-b",
          text: "We build AI receptionists, outbound dialers, missed-call text-back, custom CRMs, booking systems, websites, lead-gen, call tracking, dashboards — basically the whole growth stack. Which of those sounds most useful?",
          verdict: "poor",
          credit: 0.1,
          patience: -25,
          reply: "That's a lot of stuff, man. I don't even know what half of that is.",
          note: "Listing every product is named in the tonality guide as the thing to avoid here. It also makes the prospect do your diagnostic work for you.",
        },
        {
          id: "m3-c",
          text: "I noticed a few things about your setup that are probably costing you business. I'd rather walk you through them properly than do it over the phone.",
          verdict: "weak",
          credit: 0.3,
          patience: -12,
          reply: "Like what? Just tell me.",
          note: "Withholding the observation to force a meeting is a pressure tactic. Move 3 wants one clear, named gap — say it out loud.",
        },
        {
          id: "m3-d",
          text: "The reason I called is we've been getting great results for other {industry} companies in {area}, and I wanted to see if you'd be a fit for the same thing.",
          verdict: "poor",
          credit: 0,
          patience: -25,
          reply: "Which companies? I know pretty much everybody around here.",
          note: "Invents both results and customer relationships in one sentence — and it's the version of the lie a prospect can check fastest.",
          failure: "fabrication",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 4
    {
      id: "m4",
      move: 4,
      label: "Lower the pressure",
      category: "observation",
      points: 8,
      prospect:
        "So what, you're telling me you can fix that? Everybody says that.",
      delivery:
        "Sound honest, not weak. This creates curiosity and earns discovery.",
      options: [
        {
          id: "m4-a",
          text: "To be honest, I don't know yet if we can help or if it would even make sense for us to come in. It is different for every business, and I don't want to pretend I know your operation from the outside.",
          verdict: "correct",
          credit: 1,
          patience: 8,
          reply:
            "…Alright. I appreciate that, honestly. Most people on this call already have the answer before they ask.",
          note: "Exactly the script. Admitting you don't know yet is what separates this from every other call they get — and it's what earns you the discovery.",
        },
        {
          id: "m4-b",
          text: "I can absolutely fix that. It's the most common problem we see and we solve it every day.",
          verdict: "poor",
          credit: 0.1,
          patience: -20,
          reply: "Right. Sure you can.",
          note: "Certainty from the outside is the opposite of Move 4. You've just become every other caller, and you've promised a result you can't control yet.",
        },
        {
          id: "m4-c",
          text: "I mean, I can't promise anything, we're probably not right for everybody, it just depends, you know? Sorry, I know this is a lot.",
          verdict: "weak",
          credit: 0.3,
          patience: -12,
          reply: "You alright, man?",
          note: "The delivery note says honest, not weak. Apologizing turns low pressure into low confidence, and the prospect stops taking the call seriously.",
        },
        {
          id: "m4-d",
          text: "Well, most businesses in your position are losing somewhere between twenty and thirty percent of their leads. You're probably no different.",
          verdict: "poor",
          credit: 0,
          patience: -25,
          reply: "Where'd you get that number?",
          note: "The SOP is explicit: do not invent numbers, help the prospect give you theirs.",
          failure: "fabrication",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 5
    {
      id: "m5",
      move: 5,
      label: "Offer the meeting",
      category: "transition",
      points: 15,
      prospect: "Okay. So what are you actually proposing?",
      delivery:
        "Keep it small and concrete. A 30-minute review with a real out — 'if there isn't, no problem.'",
      options: [
        {
          id: "m5-a",
          text: "The way we normally do it is a quick 30-minute Zoom. We go over the full business, look at where leads or calls may be slipping through, and see if there is anything worth fixing. If there isn't, no problem.",
          verdict: "correct",
          credit: 1,
          patience: 6,
          reply: "Thirty minutes. Okay. And that's just a conversation, right?",
          note: "Master script. Fixed length, clear agenda, and a genuine exit — the 'if there isn't, no problem' is what makes it easy to say yes to.",
        },
        {
          id: "m5-b",
          text: "I'd love to get you on a call with our team to walk you through a full demo of the platform and show you what it can do.",
          verdict: "poor",
          credit: 0.15,
          patience: -18,
          reply: "A demo? I'm not really at that stage.",
          note: "A demo is a product meeting. The Growth Systems Review is a business meeting about their operation — that's why it books.",
        },
        {
          id: "m5-c",
          text: "Let's set up a call. It'd probably take an hour or so to go through everything properly, maybe a bit more.",
          verdict: "weak",
          credit: 0.3,
          patience: -14,
          reply: "An hour? I don't have an hour for something like this.",
          note: "The 30 minutes is doing real work — it's small enough to accept without a decision. Inflating it costs you the booking.",
        },
        {
          id: "m5-d",
          text: "I want to get you booked in for a strategy session — it's normally $500 but I can waive that for you today.",
          verdict: "poor",
          credit: 0,
          patience: -25,
          reply: "So there's a catch.",
          note: "Invents a price and a concession that don't exist, and manufactures urgency. Three NEVERs in one sentence.",
          failure: "fabrication",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 6
    {
      id: "m6",
      move: 6,
      label: "Give two times",
      category: "calendar",
      points: 10,
      prospect: "Yeah, alright. I could probably do something this week.",
      delivery: "Direct and controlled. Never ask, 'When are you free?'",
      options: [
        {
          id: "m6-a",
          text: "I'm looking at the calendar now. I have {optionA} or {optionB}. Which works better?",
          verdict: "correct",
          credit: 1,
          patience: 5,
          reply: "{chosenTime} is better for me.",
          note: "Two real openings, one question, done. This is the whole reason the two-time close exists — it converts vague willingness into a specific slot.",
          flags: { timeAgreed: true },
        },
        {
          id: "m6-b",
          text: "Great — when are you free this week?",
          verdict: "poor",
          credit: 0.1,
          patience: -18,
          reply:
            "Uh… I'd have to look. Things are kind of all over the place right now. Let me check and get back to you.",
          note: "Open-ended availability is called out by name in the tonality guide. You handed control of the calendar to someone with no reason to protect it.",
        },
        {
          id: "m6-c",
          text: "Perfect, I'll send you a link to my calendar and you can grab whatever slot works.",
          verdict: "poor",
          credit: 0.15,
          patience: -15,
          reply: "Sure, send it over.",
          note: "A booking link at this stage is a polite no. You had them on the phone with intent and traded a live booking for a link they won't open.",
        },
        {
          id: "m6-d",
          text: "I've got {optionA}, {optionB}, or I could probably do something Friday, or next week if that's easier — whatever suits you really.",
          verdict: "weak",
          credit: 0.35,
          patience: -10,
          reply: "Let's say… I don't know, maybe next week sometime?",
          note: "You started with the two-time close and then diluted it into an open question. Give two options and stop talking.",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 7
    {
      id: "m7",
      move: 7,
      label: "Confirm live",
      category: "calendar",
      points: 10,
      prospect: "{chosenTime} works. You want to just email me the details?",
      delivery:
        "Slow down 10%. Agreement is not enough; the appointment is complete when the invitation is accepted.",
      options: [
        {
          id: "m7-a",
          text: "Perfect. I have your email as {email} — is that still the best one? And {phone} is the best number? Great, I just sent the calendar invitation. Can you open your email while I have you and make sure it came through? … Do you see {eventTitle} for {chosenTime} {timezone}? Perfect — go ahead and accept that invitation so the time is locked in.",
          verdict: "correct",
          credit: 1,
          patience: 4,
          reply:
            "Hang on… yeah, I see it. {eventTitle}. Alright, accepted.",
          note: "Data verified, invite sent while connected, and accepted live. This is the difference between Booked-unconfirmed and Booked-confirmed.",
          flags: {
            inviteSent: true,
            inviteAccepted: true,
            dataVerified: true,
          },
        },
        {
          id: "m7-b",
          text: "Perfect, I'll get that invite over to you at {email} right after this call. Keep an eye out for it.",
          verdict: "poor",
          credit: 0.15,
          patience: 0,
          reply: "Sounds good.",
          note: "You hung up before the invitation existed. The SOP's quality rule is unambiguous — verified data, invite accepted, commitment received, or it isn't confirmed.",
          flags: { inviteSent: false },
        },
        {
          id: "m7-c",
          text: "Perfect. I have your email as {email} and {phone} as the best number — I've just sent the invitation over now. You should see {eventTitle} come through in a minute.",
          verdict: "weak",
          credit: 0.5,
          patience: 2,
          reply: "Alright, I'll watch for it.",
          note: "You verified the data and sent it live, which is half the move. You never had them open it and accept, so the slot isn't locked into their calendar.",
          flags: { inviteSent: true, dataVerified: true },
        },
        {
          id: "m7-d",
          text: "Yep, I'll email you. What's the best address?",
          verdict: "poor",
          credit: 0.1,
          patience: -8,
          reply: "It's on the website. Just use that one.",
          note: "You had their email in the lead record — asking for it signals you did no prep, and you've left with nothing verified and nothing sent.",
        },
      ],
    },

    // ---------------------------------------------------------------- Move 8
    {
      id: "m8",
      move: 8,
      label: "Secure the show",
      category: "commitment",
      points: 15,
      prospect: "Alright, we're good then. I'll talk to you {chosenTime}.",
      delivery:
        "Warm and serious. Ask for the commitment, then remain silent until they answer.",
      options: [
        {
          id: "m8-a",
          text: "Before I let you go — is there any reason you can think of right now that would keep you from making the call at {chosenTime}? … Good. Can I get your word that you'll be there? … Perfect. I'm going to text you the details and a link so you can look through what we do before the call. I'll see you {chosenTime}.",
          verdict: "correct",
          credit: 1,
          patience: 5,
          reply:
            "No, nothing I can think of. Yeah — you've got my word, I'll be there.",
          note: "Risk question, then the commitment, then silence until they answered. That's the whole of Move 8, and it's the single biggest lever on show rate.",
          flags: { commitment: true },
        },
        {
          id: "m8-b",
          text: "Sounds good {firstName}, I'll see you then. Have a good one!",
          verdict: "poor",
          credit: 0.1,
          patience: 0,
          reply: "You too.",
          note: "You skipped Move 8 entirely. No risk question, no commitment — this is the booking most likely to no-show, and you'll never know why.",
        },
        {
          id: "m8-c",
          text: "Before I let you go — is there any reason you can think of that would keep you from making the call? Because I know things come up, and if something does just let me know, we can always move it, no big deal, whatever works.",
          verdict: "weak",
          credit: 0.3,
          patience: -8,
          reply: "Yeah, I'll let you know if something comes up.",
          note: "You asked the risk question and then talked over the answer — and pre-authorized the reschedule. The tonality guide's instruction for this moment is: then silent.",
        },
        {
          id: "m8-d",
          text: "One thing — we've got a lot of demand right now, so if you miss it I can't promise I'll be able to get you back on the calendar this month.",
          verdict: "poor",
          credit: 0,
          patience: -25,
          reply: "Then don't worry about it.",
          note: "Invents a reason for urgency to force a commitment. It's the last NEVER on the list and it costs you a booking you'd already earned.",
          failure: "fabrication",
        },
      ],
    },
  ];
}

/**
 * The objection cheat sheet (section 3).
 *
 * The rule for all of them: acknowledge, ask one clarifying question,
 * answer briefly, then return to two calendar options. Never debate.
 */
export const OBJECTIONS: Record<ObjectionId, Objection> = {
  "not-interested": {
    id: "not-interested",
    says: "Look, I'm not interested.",
    approved:
      "Totally fair. Is that because you are happy with how leads and calls are handled now, or is it mainly bad timing?",
    options: [
      {
        id: "ni-a",
        text: "Totally fair. Is that because you're happy with how leads and calls are handled now, or is it mainly bad timing?",
        verdict: "correct",
        credit: 1,
        patience: 8,
        reply:
          "…Honestly? Probably timing. It's not that it's perfect, we're just slammed.",
        note: "Acknowledge, one clarifying question, no debate. The either/or makes it easy to answer honestly and it usually surfaces the real reason.",
      },
      {
        id: "ni-b",
        text: "I understand, but most people say that before they see what we found. Just give me two minutes.",
        verdict: "poor",
        credit: 0,
        patience: -30,
        reply: "I said I'm not interested.",
        note: "'I understand, but' is a debate. The cheat sheet's rule is acknowledge, clarify, and return to two times — never argue.",
      },
      {
        id: "ni-c",
        text: "No problem at all. Have a good one.",
        verdict: "weak",
        credit: 0.25,
        patience: 0,
        reply: "Alright. Bye.",
        note: "Respectful, but 'not interested' isn't a do-not-call request. You're allowed one calm clarifying question, and it's the one that saves the call.",
        endsCall: true,
        flags: { refused: true },
      },
      {
        id: "ni-d",
        text: "Can I ask what you're currently using? Because if it's not integrated with your CRM you're almost certainly losing leads without seeing it.",
        verdict: "poor",
        credit: 0.1,
        patience: -22,
        reply: "You don't know anything about my business, man.",
        note: "You answered an objection with a diagnosis and an implied result. It reads as a pitch and it invents a problem you haven't verified.",
      },
    ],
  },

  "send-information": {
    id: "send-information",
    says: "Just send me some information and I'll take a look.",
    approved:
      "Absolutely. What is the bigger priority - getting more opportunities or converting the ones you already have? I will send the relevant information. Is [A] or [B] better for a quick review?",
    options: [
      {
        id: "si-a",
        text: "Absolutely. What's the bigger priority — getting more opportunities, or converting the ones you already have? … I'll send the relevant information. Is {optionA} or {optionB} better for a quick review?",
        verdict: "correct",
        credit: 1,
        patience: 7,
        reply:
          "Converting what we've got, probably. And yeah — {chosenTime} works.",
        note: "Agreed, asked one clarifying question, then went straight back to the two calendar options. The information request becomes qualification.",
      },
      {
        id: "si-b",
        text: "Sure, what's the best email? I'll send over our deck and some case studies.",
        verdict: "poor",
        credit: 0.1,
        patience: -12,
        reply: "Perfect, send it over. I'll let you know.",
        note: "'Send me information' handled this way is a soft no with a follow-up you'll never get. You also just promised case studies — only approved proof exists.",
      },
      {
        id: "si-c",
        text: "I can do that. Honestly though, information isn't going to tell you much without looking at your actual setup.",
        verdict: "weak",
        credit: 0.35,
        patience: -8,
        reply: "Well, send it anyway and we'll see.",
        note: "The instinct is right but you argued the point instead of asking the clarifying question. You also never returned to the two times.",
      },
      {
        id: "si-d",
        text: "I'd rather not send anything generic. Let's just do the 30 minutes — is {optionA} or {optionB} better?",
        verdict: "acceptable",
        credit: 0.6,
        patience: -2,
        reply: "…Alright, {chosenTime} I guess.",
        note: "You got back to the two times, which is the important half. Skipping the acknowledgement and the clarifying question makes it land harder than it needs to.",
      },
    ],
  },

  "how-much": {
    id: "how-much",
    says: "Alright, well — how much is something like this?",
    approved:
      "It depends on what is actually broken. If you only mean the website, those start at $750 one time. The review tells us what really makes sense. Is [A] or [B] better?",
    options: [
      {
        id: "hm-a",
        text: "It depends on what's actually broken. If you only mean the website, those start at $750 one time. The review tells us what really makes sense. Is {optionA} or {optionB} better?",
        verdict: "correct",
        credit: 1,
        patience: 6,
        reply:
          "Okay, that's not as bad as I thought. {chosenTime} then.",
        note: "The one approved number, given briefly, then straight back to the two times. Answering the price question honestly is what keeps it from becoming a wall.",
      },
      {
        id: "hm-b",
        text: "That's exactly what the 30-minute review is for — I couldn't give you a number without seeing the setup.",
        verdict: "weak",
        credit: 0.35,
        patience: -12,
        reply: "So you can't even give me a ballpark?",
        note: "Dodging price makes it the only thing they think about. You have one approved figure — the $750 website starting point. Use it, then move on.",
      },
      {
        id: "hm-c",
        text: "Most of our clients are somewhere in the two-to-five thousand a month range, depending on what they need.",
        verdict: "poor",
        credit: 0,
        patience: -28,
        reply: "Two to five grand a month? Yeah, that's not happening.",
        note: "Invents pricing that isn't approved, and anchors high on a prospect you haven't diagnosed. Fabricated pricing is an automatic failure.",
        failure: "fabrication",
      },
      {
        id: "hm-d",
        text: "Honestly, whatever the budget is, it pays for itself — most people make it back in the first month.",
        verdict: "poor",
        credit: 0,
        patience: -28,
        reply: "Come on.",
        note: "Promises a result AI AT WORK cannot control and invents a payback period. Both are named under NEVER.",
        failure: "fabrication",
      },
    ],
  },

  "already-have-it": {
    id: "already-have-it",
    says: "We've already got something like that in place.",
    approved:
      "Perfect. We do not replace systems just to replace them. How confident are you that every opportunity is being captured, tracked, and followed up?",
    options: [
      {
        id: "ah-a",
        text: "Perfect. We don't replace systems just to replace them. How confident are you that every opportunity is being captured, tracked, and followed up?",
        verdict: "correct",
        credit: 1,
        patience: 8,
        reply:
          "…Confident-ish. I couldn't tell you for certain that nothing slips, no.",
        note: "You removed the threat, then asked the one question their current system probably can't answer. That gap is the whole reason for the meeting.",
      },
      {
        id: "ah-b",
        text: "What are you using? Most of those tools have pretty big holes in the follow-up side.",
        verdict: "poor",
        credit: 0.1,
        patience: -20,
        reply: "It works fine for us.",
        note: "Attacking their current choice makes them defend it. The cheat sheet reframes instead: confidence in coverage, not the brand of the tool.",
      },
      {
        id: "ah-c",
        text: "That's great to hear. In that case I won't take up any more of your time.",
        verdict: "weak",
        credit: 0.2,
        patience: -4,
        reply: "Appreciate it.",
        note: "'Already have it' is not a no — the SOP treats it as the easiest objection to reframe. You folded on the first push.",
        endsCall: true,
        flags: { refused: true },
      },
      {
        id: "ah-d",
        text: "Understood. Would it still be worth 30 minutes to see whether anything's slipping through? Is {optionA} or {optionB} better?",
        verdict: "acceptable",
        credit: 0.55,
        patience: 0,
        reply: "I mean… maybe. {chosenTime}, I suppose.",
        note: "You went back to the two times, which works. Without the confidence question first, they're accepting out of politeness rather than curiosity.",
      },
    ],
  },

  "im-busy": {
    id: "im-busy",
    says: "I'm actually right in the middle of something.",
    approved:
      "I understand. I only need to know which calendar option is better: [A] or [B]?",
    options: [
      {
        id: "ib-a",
        text: "I understand. I only need to know which calendar option is better — {optionA} or {optionB}?",
        verdict: "correct",
        credit: 1,
        patience: 6,
        reply: "{chosenTime}. Alright, I've got to run.",
        note: "One sentence, one decision. 'I'm busy' is answered by shrinking the ask, not by apologising or by calling back later.",
      },
      {
        id: "ib-b",
        text: "No problem at all — when's a better time for me to call you back?",
        verdict: "poor",
        credit: 0.15,
        patience: -12,
        reply: "Try me next week sometime.",
        note: "You converted a live prospect into a callback, which is a much worse asset. The cheat sheet answers 'busy' with the two times, not a reschedule.",
        flags: { callbackSet: true },
      },
      {
        id: "ib-c",
        text: "Sorry, I know you're busy — I'll be really quick, I promise. So as I was saying about the follow-up piece…",
        verdict: "poor",
        credit: 0.05,
        patience: -25,
        reply: "Man, I've got to go.",
        note: "Apologising and then continuing anyway ignores what they told you. Acknowledge, shrink the ask to one decision, and let them go.",
      },
      {
        id: "ib-d",
        text: "Totally understand. {optionA} or {optionB} — I'll take either, just say a word and I'll let you go.",
        verdict: "acceptable",
        credit: 0.7,
        patience: 2,
        reply: "{chosenTime}. Bye.",
        note: "Close to the approved line and it does the job. 'I'll take either' softens the control slightly — the script's version is cleaner.",
      },
    ],
  },

  "call-later": {
    id: "call-later",
    says: "Can you just call me back another time?",
    approved:
      "No problem. What exact time should I call, and will you be the one answering this number?",
    options: [
      {
        id: "cl-a",
        text: "No problem. What exact time should I call, and will you be the one answering this number?",
        verdict: "correct",
        credit: 1,
        patience: 5,
        reply:
          "Thursday around two. Yeah, this is my cell, I'll have it on me.",
        note: "A callback with an exact time and a confirmed number is a real asset. 'Sometime next week' is not — the two questions are what make the difference.",
        flags: { callbackSet: true },
      },
      {
        id: "cl-b",
        text: "Of course, I'll try you again in a few days.",
        verdict: "poor",
        credit: 0.1,
        patience: -6,
        reply: "Sure.",
        note: "No time, no confirmation of the number, nothing to log. This is the callback that never happens.",
        flags: { callbackSet: true },
      },
      {
        id: "cl-c",
        text: "I can — though while I've got you, it's honestly a thirty-second decision. {optionA} or {optionB}?",
        verdict: "acceptable",
        credit: 0.6,
        patience: -6,
        reply: "…{chosenTime}. But I really do have to go.",
        note: "A legitimate attempt to hold the booking, and it worked. It does ignore a direct request, so it costs you goodwill you may need later.",
      },
      {
        id: "cl-d",
        text: "I'd rather not lose the momentum — can we just take two minutes now?",
        verdict: "poor",
        credit: 0,
        patience: -25,
        reply: "I asked you to call back.",
        note: "Refusing a direct request is the closest thing to debating in the cheat sheet, and 'momentum' is your priority, not theirs.",
      },
    ],
  },

  "take-me-off": {
    id: "take-me-off",
    says: "Take me off your list. Don't call this number again.",
    approved: "Absolutely. I will mark that now. Have a good day.",
    options: [
      {
        id: "tmo-a",
        text: "Absolutely. I'll mark that now. Have a good day.",
        verdict: "correct",
        credit: 1,
        patience: 0,
        reply: "Thank you.",
        note: "The only acceptable response. Acknowledge, mark it, end the call — and log the Do-not-call disposition.",
        endsCall: true,
        flags: { doNotCall: true, refused: true },
      },
      {
        id: "tmo-b",
        text: "Absolutely, I'll take you off — can I just ask what made you say that?",
        verdict: "poor",
        credit: 0,
        patience: -40,
        reply: "I said take me off.",
        note: "A do-not-call request gets no clarifying question. Continuing to talk after it is an automatic failure regardless of how politely it's phrased.",
        failure: "do-not-call",
      },
      {
        id: "tmo-c",
        text: "Understood — before I do, would it be alright if I sent one email instead?",
        verdict: "poor",
        credit: 0,
        patience: -40,
        reply: "No. Take me off.",
        note: "Negotiating a channel after a removal request ignores it. Automatic failure.",
        failure: "do-not-call",
      },
      {
        id: "tmo-d",
        text: "No problem, sorry to bother you. I'll make sure nobody from our side reaches out again — you're removed as of right now.",
        verdict: "acceptable",
        credit: 0.75,
        patience: 0,
        reply: "Alright.",
        note: "Compliant and clear, which is what matters. Slightly more words than the moment needs — the approved line is three sentences and out.",
        endsCall: true,
        flags: { doNotCall: true, refused: true },
      },
    ],
  },
};

/**
 * The CRM handoff. Which disposition is truthful depends entirely on what
 * actually happened, so the options are scored against the run's flags
 * rather than against a fixed answer key.
 */
export function handoffOptions(flags: RunFlags): Beat {
  const bookedConfirmed = Boolean(
    flags.inviteAccepted && flags.dataVerified && flags.commitment,
  );
  const bookedAtAll = Boolean(flags.timeAgreed);

  return {
    id: "handoff",
    move: null,
    label: "CRM handoff",
    category: "handoff",
    points: 10,
    prospect: "— call ended —",
    delivery:
      "A booked meeting only counts as confirmed when the correct person is attending, the contact information is verified, the invitation is accepted, and the commitment is received.",
    options: [
      {
        id: "h-confirmed",
        text: "Booked-confirmed — invite accepted live, data verified, commitment received. Notes: observation used, what they said about the current process, confirmed date/time/timezone.",
        verdict: bookedConfirmed ? "correct" : "poor",
        credit: bookedConfirmed ? 1 : 0,
        patience: 0,
        reply: bookedConfirmed
          ? "Closer notified. Reminder sequence armed: immediate email + SMS, 24h, 1h, 5min."
          : "Flagged by the manager on review — the recording doesn't support this disposition.",
        note: bookedConfirmed
          ? "Correct. All four conditions of the quality rule were met on the recording, and the closer gets a clean handoff."
          : "This is a false appointment. One or more of the four conditions was never met, and logging it as confirmed misreports the pipeline.",
        ...(bookedConfirmed ? {} : { failure: "false-appointment" as const }),
      },
      {
        id: "h-unconfirmed",
        text: "Booked-unconfirmed — time agreed, but the invitation was not accepted on the call. Notes: observation used, agreed slot, invite status pending.",
        verdict: bookedAtAll && !bookedConfirmed ? "correct" : "weak",
        credit: bookedAtAll && !bookedConfirmed ? 1 : 0.2,
        patience: 0,
        reply:
          "Logged as unconfirmed. Closer sees the slot is not locked and the invite still needs chasing.",
        note:
          bookedAtAll && !bookedConfirmed
            ? "Correct and honest. The slot exists but the quality rule wasn't satisfied, and the closer needs to know that before they prepare."
            : bookedConfirmed
              ? "Accurate but understated — every condition of the quality rule was met, so this booking was confirmed. Under-reporting distorts the pipeline too."
              : "No time was ever agreed, so there is no booking to log at all.",
      },
      {
        id: "h-callback",
        text: "Callback set — no meeting booked; agreed to a specific time to try again on this number.",
        verdict: flags.callbackSet && !bookedAtAll ? "correct" : "weak",
        credit: flags.callbackSet && !bookedAtAll ? 1 : 0.15,
        patience: 0,
        reply: "Logged. Callback task created on the rep's queue.",
        note:
          flags.callbackSet && !bookedAtAll
            ? "Correct. No meeting exists, but a specific callback time does — that's a real asset and it belongs on your queue, not the closer's."
            : "The call didn't end in a callback. Logging one puts a task on your queue that has nothing behind it.",
      },
      {
        id: "h-dnc",
        text: "Do not call — the prospect asked to be removed. Suppress the number immediately.",
        verdict: flags.doNotCall ? "correct" : "poor",
        credit: flags.doNotCall ? 1 : 0,
        patience: 0,
        reply: flags.doNotCall
          ? "Number suppressed across the dialer and every list."
          : "Suppression applied — a working lead has been permanently removed.",
        note: flags.doNotCall
          ? "Correct and urgent. The suppression has to happen immediately, not at the end of the block."
          : "No removal was requested on this call. Suppressing the number destroys a live lead and misreports why.",
      },
      {
        id: "h-not-interested",
        text: "Not interested — prospect declined; no removal requested, number stays on the list for a future cycle.",
        verdict: flags.refused && !flags.doNotCall ? "correct" : "weak",
        credit: flags.refused && !flags.doNotCall ? 1 : 0.1,
        patience: 0,
        reply: "Logged. Lead returns to the nurture cycle.",
        note:
          flags.refused && !flags.doNotCall
            ? "Correct. They declined but never asked to be removed, so the number stays workable — that distinction matters."
            : flags.doNotCall
              ? "They asked to be removed. 'Not interested' leaves the number on the list, which means it gets dialed again — that's the failure the DNC disposition exists to prevent."
              : "The prospect didn't decline. This disposition writes off a lead that is still live.",
      },
    ],
  };
}
