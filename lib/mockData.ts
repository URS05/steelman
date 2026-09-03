import type { ResearchCard } from "@/lib/types";

export const DEMO_TOPIC =
  "Does social media negatively affect teenage mental health?";

const CLAIM_ID = "11111111-1111-4111-8111-111111111111";
const EVIDENCE_ID = "22222222-2222-4222-8222-222222222222";
const CONTRADICTION_ID = "33333333-3333-4333-8333-333333333333";
const SUMMARY_ID = "44444444-4444-4444-8444-444444444444";

export const mockCards: ResearchCard[] = [
  {
    id: CLAIM_ID,
    type: "claim",
    title: "Heavy social media use is linked to higher teen depression rates",
    content:
      "Multiple observational studies report that adolescents who spend more than three hours per day on social platforms show elevated depressive symptoms compared with lighter users.",
    source: "CDC Youth Risk Behavior Survey",
    sourceUrl: "https://www.cdc.gov/healthyyouth/data/yrbs/index.htm",
    status: "pending",
    linkedCardIds: [EVIDENCE_ID],
    createdAt: 1_720_000_000_000,
    challengeCount: 0,
    confidence: 0.72,
  },
  {
    id: EVIDENCE_ID,
    type: "evidence",
    title: "Longitudinal data shows sleep disruption as a mediating factor",
    content:
      "Night-time phone use and delayed sleep onset mediate part of the association between social media and next-day mood, suggesting sleep quality is a plausible pathway rather than a direct causal effect of the apps themselves.",
    source: "JAMA Pediatrics",
    sourceUrl: "https://jamanetwork.com/journals/jamapediatrics",
    status: "pending",
    linkedCardIds: [CLAIM_ID, CONTRADICTION_ID],
    createdAt: 1_720_000_000_100,
    challengeCount: 0,
    confidence: 0.68,
  },
  {
    id: CONTRADICTION_ID,
    type: "contradiction",
    title: "Some cohorts show no increase after controlling for offline risk",
    content:
      "When researchers control for preexisting anxiety, family conflict, and socioeconomic status, the remaining effect of social media on teen mental health is small or statistically undetectable in several large datasets.",
    source: "Nature Human Behaviour",
    sourceUrl: "https://www.nature.com/nathumbehav/",
    status: "pending",
    linkedCardIds: [EVIDENCE_ID],
    createdAt: 1_720_000_000_200,
    challengeCount: 0,
    confidence: 0.61,
  },
  {
    id: SUMMARY_ID,
    type: "summary",
    title: "Current evidence is mixed and likely bidirectional",
    content:
      "Social media is associated with worse mental-health markers for some teenagers, especially with high night-time use, but causation is not settled. Offline risk factors and individual vulnerability appear to matter as much as platform exposure.",
    source: "Steelman demo synthesis",
    status: "pending",
    linkedCardIds: [],
    createdAt: 1_720_000_000_300,
    challengeCount: 0,
    confidence: 0.64,
  },
];

export function searchMockCards(query: string): ResearchCard[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return mockCards;
  }

  return mockCards.filter((card) => {
    const haystack =
      `${card.title} ${card.content} ${card.source ?? ""}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}
