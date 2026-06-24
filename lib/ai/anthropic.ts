import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

// Server-only. Never import this module from a client component.
function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MODERATION_MODEL = process.env.ANTHROPIC_MODEL_MODERATION ?? "claude-haiku-4-5-20251001";
export const MATCHING_MODEL = process.env.ANTHROPIC_MODEL_MATCHING ?? "claude-sonnet-4-6";

export interface ModerationResult {
  flagged: boolean;
  severity: "low" | "medium" | "high";
  categories: string[];
  reason: string;
}

const MODERATION_SYSTEM_PROMPT = `You moderate content for Qubool, a marriage-focused matrimonial platform for a
Pakistan/Muslim audience and members abroad. Flag: sexual/explicit content, harassment or abuse,
scams, attempts to move the conversation off-platform (phone numbers, WhatsApp, other apps used to
evade moderation), and anything illegal. Respond with strict JSON only, no prose:
{"flagged": boolean, "severity": "low"|"medium"|"high", "categories": string[], "reason": string}`;

// Cheap first pass on every message/profile field. Caller escalates to a
// larger model only when this flags something borderline (Section 7 cost control).
export async function moderateText(text: string): Promise<ModerationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // No key configured (local/dev scaffold) — fail open as "clean" rather
    // than blocking the product; admins should set ANTHROPIC_API_KEY before
    // going live since moderation is a non-negotiable per the requirements doc.
    return { flagged: false, severity: "low", categories: [], reason: "moderation disabled: no API key" };
  }

  const response = await getClient().messages.create({
    model: MODERATION_MODEL,
    max_tokens: 300,
    system: MODERATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const raw = response.content.find((block) => block.type === "text")?.text ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      flagged: Boolean(parsed.flagged),
      severity: parsed.severity ?? "low",
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      reason: parsed.reason ?? "",
    };
  } catch {
    return { flagged: true, severity: "medium", categories: ["unparseable_response"], reason: raw };
  }
}

export interface MatchExplanation {
  reason: string;
}

const MATCH_SYSTEM_PROMPT = `You write a single short, honest, warm sentence (max 200 characters) explaining
why two matrimonial profiles were matched, based on their free-text "about me" and "what I'm looking for"
fields plus their shared structured values. Be specific and plain-spoken, never generic, never romantic/cheesy.
Respond with strict JSON only: {"reason": string}`;

export async function explainMatch(input: {
  aboutA: string;
  lookingForA: string;
  aboutB: string;
  lookingForB: string;
  sharedValues: string[];
}): Promise<MatchExplanation> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { reason: input.sharedValues.length > 0 ? `You both value ${input.sharedValues[0]}.` : "You share several values in common." };
  }

  const response = await getClient().messages.create({
    model: MATCHING_MODEL,
    max_tokens: 200,
    system: MATCH_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const raw = response.content.find((block) => block.type === "text")?.text ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return { reason: parsed.reason ?? "You share several values in common." };
  } catch {
    return { reason: "You share several values in common." };
  }
}
