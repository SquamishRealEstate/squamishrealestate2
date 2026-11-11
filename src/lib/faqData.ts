/**
 * Shared FAQ content for the home page.
 *
 * EDIT ME: change, add, or remove questions below — the visible FAQ section
 * AND the FAQ structured data (JSON-LD) both update automatically from this
 * single list. Keep answers concise (2–4 sentences) and plain text only.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Is now a good time to buy a home in Squamish?",
    answer:
      "It depends on the property type. Detached homes and condos are currently in buyer's-market territory with more selection and room to negotiate, while townhomes remain in a seller's market and move quickly. Every situation is different — contact Sean Brawley PREC* for current numbers on the segment you're shopping in.",
  },
  {
    question: "What is the difference between a buyer's market and a seller's market?",
    answer:
      "It comes down to the sales-to-active-listings ratio. Below roughly 12% is a buyer's market (more homes than buyers, softer prices), 12–20% is balanced, and above 20% is a seller's market (competition and upward pressure on prices). Each property type in Squamish can sit in a different market at the same time.",
  },
  {
    question: "Why do I need to register to see sold prices and property history?",
    answer:
      "Real Estate Board rules require registration before sold data, price history, and assessment details can be shown. Creating a free account takes less than a minute and unlocks sold prices, tax history, BC Assessment data, and saved searches across every property in Squamish.",
  },
  {
    question: "What is the HonestDoor price shown on property pages?",
    answer:
      "HonestDoor is an independent automated estimate of a property's current market value, updated monthly. It's a useful starting point, but it can miss renovations, views, and lot-specific factors — for an accurate valuation, request a free market evaluation from Sean.",
  },
  {
    question: "Which Squamish neighbourhood is right for me?",
    answer:
      "Each neighbourhood has its own character: Downtown and Dentville for walkability, Garibaldi Estates and Brackendale for family streets and larger lots, the University area and Garibaldi Highlands for newer homes and trail access. Browse the Neighbourhoods section for photos, stats, and current listings in each area.",
  },
  {
    question: "How much is my Squamish home worth?",
    answer:
      "Your property page on this site shows the HonestDoor estimate, tax history, and recent sales nearby. For a precise figure, Sean prepares a complimentary comparative market analysis using live MLS® data — no obligation, and it usually takes less than 24 hours.",
  },
];

/** schema.org FAQPage structured data for the home page */
export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
