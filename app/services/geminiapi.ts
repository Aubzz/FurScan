import axios from "axios";
import {
  buildRagContext,
  getRagRuntimeStatus,
  initializeRagIndex,
  retrieveRelevantKnowledge,
  type RetrievedChunk,
  type SymptomProfile,
} from "./ragService";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_MODEL_PATH =
  GEMINI_MODEL.startsWith("models/") || GEMINI_MODEL.startsWith("tunedModels/")
    ? GEMINI_MODEL
    : `models/${GEMINI_MODEL}`;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL_PATH}:generateContent`;
const OUT_OF_SCOPE_REPLY =
  "I can assess for dog skin diseases only. I'm here to help with conditions like ringworm, dermatitis, mange, and other skin-related issues. Please ask about your dog's skin concerns!";
const UNKNOWN_DOG_DISEASE_REPLY =
  "Sorry, I don't have information about that specific dog disease in my knowledge base. We have limited chat replies. If you'd like help with this condition, please send a message through our app support. Thank you!";
const MAX_RETRIES = 1;
const GENERATION_RATE_LIMIT_COOLDOWN_SECONDS = Number.parseInt(
  process.env.EXPO_PUBLIC_RATE_LIMIT_COOLDOWN_SECONDS || "180",
  10,
);

const VET_DISCLAIMER =
  "This assessment is educational only. Please consult a licensed veterinarian for diagnosis and treatment.";

const RAG_SYSTEM_PROMPT = `You are FurScan Assistant, a chatbot integrated into the FurScan system.

Purpose:
- Help users understand common dog skin diseases and FurScan results.
- Answer related follow-up questions naturally, clearly, and concisely.

Supported conditions:
- Fungal infection
- Ringworm
- Dermatitis
- Sarcoptic mange
- Demodectic mange
- Hypersensitivity dermatitis
- Alopecia

Rules:
- Use retrieved veterinary knowledge as factual anchor.
- You may enrich with general dog dermatology knowledge when helpful and non-contradictory.
- Never claim final diagnosis.
- Never prescribe medication doses.
- Always encourage veterinary consultation for confirmation.
- Do not output internal reasoning, hidden thoughts, or planning notes.
- If unrelated to dog skin diseases, reply exactly:
"${OUT_OF_SCOPE_REPLY}"

Response style:
- Conversational, owner-friendly, and practical.
- Directly answer the user's question first.
- When appropriate, include possible condition, causes, and safe next steps.
- End with this reminder (or equivalent): ${VET_DISCLAIMER}`;

export interface ChatContext {
  detectedFeatures?: string[];
  symptomAnswers?: string[];
  dogAge?: string;
  dogBreed?: string;
  urgencyLevel?: string;
  possibleCause?: string;
  guidance?: string;
  recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

type SymptomField = keyof SymptomProfile;

const SYMPTOM_FIELD_ORDER: SymptomField[] = [
  "dogAge",
  "dogBreed",
  "itchingSeverity",
  "hasLesions",
  "hasHairLoss",
  "affectedAreas",
];

const SYMPTOM_QUESTIONS: Record<SymptomField, string> = {
  dogAge: "How old is your dog?",
  dogBreed: "What is your dog's breed?",
  itchingSeverity: "How severe is the itching? (mild / moderate / severe)",
  hasLesions: "Are skin lesions present? (yes / no)",
  hasHairLoss: "Is there noticeable hair loss? (yes / no)",
  affectedAreas: "Which body areas are affected? (for example: ears, paws, belly, back)",
};

let conversationHistory: Array<{
  role: "user" | "model";
  parts: Array<{ text: string }>;
}> = [];

let symptomProfile: Partial<SymptomProfile> = {};
let pendingSymptomField: SymptomField | null = null;
let symptomFlowStarted = false;
let initialSymptomNarrative = "";

let ragInitPromise: Promise<void> | null = null;
let generationRateLimitedUntil = 0;

const normalize = (value: string) => value.trim().toLowerCase();

const DOMAIN_TOKENS = [
  "dog",
  "dogs",
  "puppy",
  "puppies",
  "pet",
  "canine",
  "skin",
  "itch",
  "itching",
  "itchy",
  "rash",
  "rashes",
  "lesion",
  "lesions",
  "hair",
  "loss",
  "hairloss",
  "redness",
  "scaling",
  "bald",
  "alopecia",
  "sarcoptic_mange",
  "demodectic_mange",
  "bacterial_skin_infection",
  "yeast_infection",
  "flea_allergy_dermatitis",
  "hotspot",
  "seborrhea",
  "ticks_infestation",
  "lice_infestation",
  "ringworm",
  "fungal",
  "fungus",
  "dermatitis",
  "mange",
  "sarcoptic",
  "fungal_infection",
  "demodectic",
  "demodex",
  "hypersensitivity",
  "allergy",
  "allergic",
  "scratching",
  "symptom",
  "symptoms",
  "cause",
  "causes",
  "treat",
  "treatment",
  "prevent",
  "prevention",
  "assessment",
  "assess",
  "triage",
  "condition",
  "infection",
  "contagious",
  "curable",
];

const COMMON_TYPO_MAP: Record<string, string> = {
  skn: "skin",
  skinn: "skin",
  skiin: "skin",
  dof: "dog",
  dod: "dog",
  dg: "dog",
  itchng: "itching",
  itchnig: "itching",
  itchin: "itching",
  iching: "itching",
  ithcing: "itching",
  rashh: "rash",
  rsh: "rash",
  lession: "lesion",
  leasion: "lesion",
  lesons: "lesions",
  lesionn: "lesion",
  hairlos: "hairloss",
  hairls: "hairloss",
  rednes: "redness",
  scalng: "scaling",
  ringwom: "ringworm",
  ringworn: "ringworm",
  ringwrm: "ringworm",
  fungel: "fungal",
  fangal: "fungal",
  dermatis: "dermatitis",
  dermatits: "dermatitis",
  dermatitiss: "dermatitis",
  demodetic: "demodectic",
  demodectic: "demodectic",
  demodectik: "demodectic",
  sarcoptik: "sarcoptic",
  sarcoptc: "sarcoptic",
  sarcopticc: "sarcoptic",
  hypersensitivty: "hypersensitivity",
  hypersensetivity: "hypersensitivity",
  hypersenstivity: "hypersensitivity",
  alergy: "allergy",
  alergic: "allergic",
  symtom: "symptom",
  simptom: "symptom",
  treatmant: "treatment",
  treatmnt: "treatment",
  assesment: "assessment",
  asses: "assess",
};

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
};

const getFuzzyDomainToken = (token: string): string | null => {
  if (token.length < 4) return null;

  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of DOMAIN_TOKENS) {
    if (Math.abs(candidate.length - token.length) > 2) continue;
    const distance = levenshteinDistance(token, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  const maxDistance = token.length >= 7 ? 2 : 1;
  if (!best || bestDistance > maxDistance) return null;
  return best;
};

const normalizeForSemantics = (value: string): string => {
  const clean = normalize(value).replace(/[^a-z0-9\s]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);

  const normalizedTokens = tokens.map((token) => {
    const mapped = COMMON_TYPO_MAP[token];
    if (mapped) return mapped;
    if (DOMAIN_TOKENS.includes(token)) return token;
    return getFuzzyDomainToken(token) || token;
  });

  return normalizedTokens.join(" ");
};

const isDogSkinRelated = (text: string): boolean =>
  /\b(dog|dogs|puppy|puppies|pet|canine|skin|itch|itching|itchy|rash|rashes|lesion|lesions|hair\s*loss|hairloss|redness|scaling|bald|alopecia|ring\s*worm|ringworm|fungal|fungus|dermatitis|mange|sarcoptic|demodectic|demodex|hypersensitivity|allergy|allergic|scratching|affected\s*area|affected\s*areas)\b/i.test(
    text,
  );
const isDogRelated = (text: string): boolean =>
  /\b(dog|dogs|puppy|puppies|pet|canine)\b/i.test(text);
const isMentioningDiseaseOrCondition = (text: string): boolean =>
  /\b(disease|condition|illness|infection|problem|issue|complaint|disorder)\b/i.test(text);
const isUnknownDogDisease = (text: string): boolean => {
  if (!isDogRelated(text)) return false;
  if (!isMentioningDiseaseOrCondition(text) && !/my\s+(dog|puppy|pet)/i.test(text)) return false;
  const normalized = normalizeForSemantics(text);
  const isDogSkin = isDogSkinRelated(text);
  if (isDogSkin) return false;
  const looksLikeDiseaseQuestion = /\b(what|is|has|got|have|does|do|my)\b.*\b(disease|condition|illness|infection|problem)\b/i.test(text);
  return looksLikeDiseaseQuestion || isDogRelated(text);
};
const isFollowUpQuestion = (text: string): boolean =>
  /\b(it|that|this|these|those|condition|disease|infection|symptom|symptoms|cause|causes|treat|treatment|prevent|prevention|contagious|serious|curable|home care|next step|what about)\b/i.test(
    text,
  );
const hasRecentSkinContext = (context?: ChatContext): boolean => {
  const recent = context?.recentMessages || [];
  if (!recent.length) return false;
  const joined = recent
    .slice(-6)
    .map((m) => m.content)
    .join(" ");
  return isDogSkinRelated(normalizeForSemantics(joined));
};
const isConversationalSkinQuery = (
  text: string,
  context?: ChatContext,
): boolean =>
  isDogSkinRelated(text) || (isFollowUpQuestion(text) && hasRecentSkinContext(context));

const isRestartRequest = (text: string): boolean =>
  /\b(reset|restart|new assessment|start over)\b/i.test(text);
const isAssessmentIntent = (text: string): boolean =>
  /\b(assess|assessment|evaluate|check symptoms|triage|question flow|start assessment)\b/i.test(
    text,
  );
const isCancelAssessmentIntent = (text: string): boolean =>
  /\b(cancel assessment|stop assessment|skip assessment|no assessment)\b/i.test(
    text,
  );
const isClosingAcknowledgment = (text: string): boolean =>
  /\b(thank|thanks|thankyou|thank you|okay|ok|got it|gotit|got it|understood|u got it|nice|good|appreciate|great)\b/i.test(text) &&
  text.length < 50 &&
  !/\?|question|problem|help|what|why|how|need|issue|concerned/i.test(text);

const normalizeYesNo = (value: string): string => {
  const compact = normalize(value).replace(/[^a-z]/g, "");
  if (/^(yes|y|yeah|yep|yea|yess|yas|opo)$/i.test(compact)) return "yes";
  if (/^(no|n|nope|nah|hindi|noh|nop)$/i.test(compact)) return "no";
  return value.trim();
};

const normalizeItchSeverity = (value: string): string => {
  const v = normalizeForSemantics(value);
  if (/severe|intense|very/.test(v)) return "severe";
  if (/moderate|medium/.test(v)) return "moderate";
  if (/mild|light|slight/.test(v)) return "mild";

  const severityWords = ["mild", "moderate", "severe"] as const;
  const tokens = v.split(/\s+/).filter(Boolean);
  let best: (typeof severityWords)[number] | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const token of tokens) {
    for (const severity of severityWords) {
      const distance = levenshteinDistance(token, severity);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = severity;
      }
    }
  }

  if (best && bestDistance <= 2) return best;
  return value.trim();
};

const getNextMissingField = (
  profile: Partial<SymptomProfile>,
): SymptomField | null => {
  for (const field of SYMPTOM_FIELD_ORDER) {
    if (!profile[field]) return field;
  }
  return null;
};

const setSymptomAnswer = (field: SymptomField, answer: string) => {
  if (field === "hasLesions" || field === "hasHairLoss") {
    symptomProfile[field] = normalizeYesNo(answer);
    return;
  }
  if (field === "itchingSeverity") {
    symptomProfile[field] = normalizeItchSeverity(answer);
    return;
  }
  symptomProfile[field] = answer.trim();
};

const buildSymptomSummary = (profile: Partial<SymptomProfile>): string => {
  return [
    `Dog age: ${profile.dogAge || "unknown"}`,
    `Dog breed: ${profile.dogBreed || "unknown"}`,
    `Itching severity: ${profile.itchingSeverity || "unknown"}`,
    `Lesions present: ${profile.hasLesions || "unknown"}`,
    `Hair loss present: ${profile.hasHairLoss || "unknown"}`,
    `Affected body areas: ${profile.affectedAreas || "unknown"}`,
  ].join("\n");
};

const buildRetrievalQuery = (
  userMessage: string,
  semanticUserMessage: string,
  profile: Partial<SymptomProfile>,
  context?: ChatContext,
): string => {
  const recentChat = context?.recentMessages?.length
    ? context.recentMessages
        .slice(-6)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n")
    : "none";

  return [
    `User message: ${userMessage}`,
    `Semantic-normalized message: ${semanticUserMessage}`,
    initialSymptomNarrative
      ? `Initial symptom narrative: ${initialSymptomNarrative}`
      : "",
    buildSymptomSummary(profile),
    `Detected features: ${(context?.detectedFeatures || []).join(", ") || "none"}`,
    `Additional symptom answers: ${(context?.symptomAnswers || []).join(" | ") || "none"}`,
    `Recent chat context:\n${recentChat}`,
  ]
    .filter(Boolean)
    .join("\n");
};

const buildFallbackResponse = (
  retrieved: RetrievedChunk[],
  reason?: string,
): string => {
  const top = retrieved[0];
  const possibleCondition = top?.disease || "Not enough information";
  const causes = retrieved
    .slice(0, 3)
    .map((item) => item.disease)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(", ");

  return [
    `One possible condition is ${possibleCondition}.`,
    reason ||
      "Your question and symptom details are consistent with the available veterinary references and general skin-health guidance.",
    `Likely related causes include: ${causes || "insufficient retrieved information"}.`,
    "Recommended next steps: keep the skin clean and dry, prevent excessive scratching, avoid harsh shampoos, and monitor if lesions spread or worsen.",
    VET_DISCLAIMER,
  ].join("\n\n");
};

const formatBulletPoints = (text: string): string => {
  return text.replace(/^\*\s+/gm, "• ");
};

const enforceStructuredOutput = (text: string, retrieved: RetrievedChunk[]): string => {
  const trimmed = text.trim();
  if (trimmed === OUT_OF_SCOPE_REPLY) return OUT_OF_SCOPE_REPLY;

  if (!trimmed) {
    return buildFallbackResponse(retrieved);
  }

  const formatted = formatBulletPoints(trimmed);
  if (!new RegExp(VET_DISCLAIMER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(formatted)) {
    return `${formatted}\n\n${VET_DISCLAIMER}`;
  }

  return formatted;
};

const ensureRagInitialized = async () => {
  if (!ragInitPromise) {
    ragInitPromise = initializeRagIndex();
  }
  await ragInitPromise;
};

export const sendMessage = async (
  userMessage: string,
  context?: ChatContext,
): Promise<string> => {
  const normalized = normalize(userMessage);
  const semanticUserMessage = normalizeForSemantics(userMessage);

  if (!normalized) {
    return "Please describe your dog's skin concern so I can help.";
  }

  if (isRestartRequest(semanticUserMessage)) {
    resetConversation();
    symptomFlowStarted = true;
    pendingSymptomField = "dogAge";
    return `Let's restart the skin assessment.\n${SYMPTOM_QUESTIONS.dogAge}`;
  }

  if (isClosingAcknowledgment(userMessage) && conversationHistory.length > 0) {
    return "You're welcome! Feel free to reach out anytime you have concerns about your dog's skin. Take care! 🐾";
  }

  const inSymptomFlow = symptomFlowStarted || pendingSymptomField !== null;
  if (!inSymptomFlow && !isConversationalSkinQuery(semanticUserMessage, context)) {
    if (isUnknownDogDisease(userMessage)) {
      return UNKNOWN_DOG_DISEASE_REPLY;
    }
    return OUT_OF_SCOPE_REPLY;
  }

  await ensureRagInitialized();

  if (isCancelAssessmentIntent(semanticUserMessage) && pendingSymptomField) {
    pendingSymptomField = null;
    symptomFlowStarted = false;
    return "Okay, I stopped the assessment flow. You can ask any dog skin question directly.";
  }

  if (!symptomFlowStarted && isAssessmentIntent(semanticUserMessage)) {
    symptomFlowStarted = true;
    initialSymptomNarrative = userMessage.trim();
    pendingSymptomField = "dogAge";
    return [
      "To guide this skin assessment, I need a few details.",
      SYMPTOM_QUESTIONS.dogAge,
    ].join("\n");
  }

  if (pendingSymptomField) {
    const parserValue =
      pendingSymptomField === "itchingSeverity" ||
      pendingSymptomField === "hasLesions" ||
      pendingSymptomField === "hasHairLoss"
        ? semanticUserMessage
        : userMessage;
    setSymptomAnswer(pendingSymptomField, parserValue);
    pendingSymptomField = getNextMissingField(symptomProfile);

    if (pendingSymptomField) {
      return SYMPTOM_QUESTIONS[pendingSymptomField];
    }
  }

  const query = buildRetrievalQuery(
    userMessage,
    semanticUserMessage,
    symptomProfile,
    context,
  );
  const retrieved = await retrieveRelevantKnowledge(
    query,
    symptomProfile as SymptomProfile,
    4,
  );
  const ragContext = buildRagContext(retrieved);
  const ragRuntime = getRagRuntimeStatus();
  const now = Date.now();

  if (!GEMINI_API_KEY) {
    return buildFallbackResponse(
      retrieved,
      "Cloud model is not configured right now, so this guidance is provided from available veterinary references.",
    );
  }

  if (now < generationRateLimitedUntil) {
    return buildFallbackResponse(
      retrieved,
      "Cloud model is temporarily rate-limited, but I can still guide you using veterinary references.",
    );
  }

  const composedUserInput = [
    `Current user message: ${userMessage}`,
    "",
    "Structured Symptom Collection:",
    buildSymptomSummary(symptomProfile),
    "",
    "Retrieved Veterinary Knowledge (RAG):",
    ragContext,
    "",
    "Instruction: Answer directly. Use retrieved context as anchor and enrich with general dermatology knowledge when helpful.",
  ].join("\n");

  conversationHistory.push({
    role: "user",
    parts: [{ text: composedUserInput }],
  });

  try {
    let response;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        response = await axios.post(
          `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
          {
            systemInstruction: { parts: [{ text: RAG_SYSTEM_PROMPT }] },
            contents: conversationHistory,
            generationConfig: {
              temperature: 0.3,
              topP: 0.8,
              maxOutputTokens: 5000,
            },
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 45000,
          },
        );
        break;
      } catch (retryError: any) {
        const status = retryError?.response?.status as number | undefined;
        const isLastAttempt = attempt === MAX_RETRIES;
        if (status !== 429 || isLastAttempt) {
          throw retryError;
        }
        await new Promise((resolve) => setTimeout(resolve, 1200 * Math.pow(2, attempt)));
      }
    }

    if (!response) {
      return buildFallbackResponse(
        retrieved,
        "Cloud model is temporarily unavailable, but I can still guide you using available veterinary references.",
      );
    }

    const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!botReply) {
      return buildFallbackResponse(
        retrieved,
        "No model text was returned, so I am using available veterinary references to guide you.",
      );
    }

    conversationHistory.push({
      role: "model",
      parts: [{ text: botReply }],
    });

    if (conversationHistory.length > 16) {
      conversationHistory = conversationHistory.slice(-16);
    }

    return enforceStructuredOutput(botReply, retrieved);
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;
    if (status === 429) {
      generationRateLimitedUntil =
        Date.now() + Math.max(30, GENERATION_RATE_LIMIT_COOLDOWN_SECONDS) * 1000;
    }
    console.error("[RAG Chatbot] Generation error", {
      status,
      message: error?.message,
      details: error?.response?.data,
      ragRuntime,
    });

    if (conversationHistory.length > 0) {
      conversationHistory.pop();
    }

    return buildFallbackResponse(
      retrieved,
      status === 429
        ? "Cloud model is rate-limited, so I am continuing with available veterinary references."
        : "Cloud model request failed, so I am continuing with available veterinary references.",
    );
  }
};

export const resetConversation = () => {
  conversationHistory = [];
  symptomProfile = {};
  pendingSymptomField = null;
  symptomFlowStarted = false;
  initialSymptomNarrative = "";
  generationRateLimitedUntil = 0;
  console.log("[RAG Chatbot] Conversation reset");
};
