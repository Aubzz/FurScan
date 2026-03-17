import axios from "axios";

export interface SymptomProfile {
  dogAge?: string;
  dogBreed?: string;
  itchingSeverity?: string;
  hasLesions?: string;
  hasHairLoss?: string;
  affectedAreas?: string;
}

interface KnowledgeFile {
  id: string;
  disease: string;
  key: string;
}

interface KnowledgeDocument {
  id: string;
  disease: string;
  source: string;
  content: string;
}

interface ChunkRecord {
  id: string;
  disease: string;
  source: string;
  text: string;
  embedding: number[];
}

export interface RetrievedChunk {
  id: string;
  disease: string;
  source: string;
  text: string;
  score: number;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_EMBED_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_EMBED_MODEL || "gemini-embedding-001";
const EMBED_MODEL_FALLBACKS = [GEMINI_EMBED_MODEL, "gemini-embedding-001", "text-embedding-004"];

const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 120;
const LOCAL_EMBED_DIM = 384;

const KNOWLEDGE_FILES: KnowledgeFile[] = [
  {
    id: "fungal-infection",
    disease: "Fungal Infection",
    key: "fungal_infection",
  },
  {
    id: "ringworm",
    disease: "Dermatophytosis (Ringworm)",
    key: "ringworm",
  },
  {
    id: "dermatitis",
    disease: "Dermatitis",
    key: "dermatitis",
  },
  {
    id: "sarcoptic-mange",
    disease: "Sarcoptic Mange",
    key: "sarcoptic_mange",
  },
  {
    id: "demodectic-mange",
    disease: "Demodectic Mange",
    key: "demodectic_mange",
  },
  {
    id: "hypersensitivity-dermatitis",
    disease: "Hypersensitivity Dermatitis",
    key: "hypersensitivity_dermatitis",
  },
];

const KNOWLEDGE_DOCS: Record<string, string> = {
  fungal_infection:
    "Disease: Fungal Infection\nOverview: Fungal skin disease may cause scaling, redness, patchy hair loss, and itching.\nDiagnosis: Veterinary exam with skin tests.\nTreatment: Keep skin clean and dry and follow veterinary antifungal management.",

  ringworm:
    "Disease: Dermatophytosis (Ringworm)\nOverview: Contagious fungal disease with circular bald patches and scaling.\nDiagnosis: Vet culture or microscopy.\nTreatment: Hygiene, disinfection, and veterinary antifungal treatment.",

  dermatitis:
    "Disease: Dermatitis\nOverview: Inflammatory skin condition with redness, itching, odor, and moist lesions.\nDiagnosis: Vet skin exam and cause identification.\nTreatment: Remove triggers and follow veterinary plan.",

  sarcoptic_mange:
    "Disease: Sarcoptic Mange\nOverview: Highly itchy and contagious mite infestation.\nDiagnosis: Vet skin scraping and clinical assessment.\nTreatment: Prompt veterinary parasite control and isolation precautions.",

  demodectic_mange:
    "Disease: Demodectic Mange\nOverview: Demodex mite overgrowth causing patchy hair loss and irritation.\nDiagnosis: Deep skin scraping.\nTreatment: Veterinary-directed mite management.",

  hypersensitivity_dermatitis:
    "Disease: Hypersensitivity Dermatitis\nOverview: Allergy-related skin inflammation with itching and redness.\nDiagnosis: Vet allergy workup.\nTreatment: Trigger avoidance and veterinary care.",

  alopecia:
    "Disease: Alopecia\nOverview: Hair loss that may be patchy or widespread, caused by allergies, parasites, hormonal imbalance, or genetics.\nDiagnosis: Vet examination, skin tests, and possible blood tests.\nTreatment: Depends on underlying cause; may include medication, diet changes, or parasite control.",

  bacterial_skin_infection:
    "Disease: Pyoderma (Bacterial Skin Infection)\nOverview: Common bacterial infection causing red bumps, pus-filled lesions, odor, and itching.\nDiagnosis: Vet skin cytology or culture.\nTreatment: Antibiotics, medicated shampoos, and hygiene management.",

  yeast_infection:
    "Disease: Yeast Infection (Malassezia Dermatitis)\nOverview: Overgrowth of yeast causing greasy skin, bad odor, redness, and itching.\nDiagnosis: Skin cytology.\nTreatment: Antifungal medications and medicated baths.",

  flea_allergy_dermatitis:
    "Disease: Flea Allergy Dermatitis\nOverview: Allergic reaction to flea bites causing intense itching, redness, and hair loss.\nDiagnosis: Presence of fleas and clinical signs.\nTreatment: Strict flea control and anti-itch medications.",

  hot_spots:
    "Disease: Acute Moist Dermatitis (Hot Spots)\nOverview: Rapidly developing red, moist, and painful skin lesions due to licking or scratching.\nDiagnosis: Physical examination.\nTreatment: Cleaning, topical treatment, and preventing further irritation.",

  seborrhea:
    "Disease: Seborrhea\nOverview: Skin disorder causing flaky dandruff or oily, greasy coat with odor.\nDiagnosis: Vet evaluation to determine primary or secondary cause.\nTreatment: Medicated shampoos and treatment of underlying condition.",

  ticks_infestation:
    "Disease: Tick Infestation\nOverview: External parasites attaching to skin, causing irritation and potential disease transmission.\nDiagnosis: Visual identification of ticks.\nTreatment: Tick removal and preventive medications.",

  lice_infestation:
    "Disease: Lice Infestation\nOverview: Small parasites causing itching, dry coat, and hair loss.\nDiagnosis: Visual inspection or microscopic exam.\nTreatment: Topical insecticides and hygiene control.",

  skin_abscess:
    "Disease: Skin Abscess\nOverview: Localized swelling filled with pus due to infection, often from wounds or bites.\nDiagnosis: Physical exam and possible drainage.\nTreatment: Drainage, antibiotics, and wound care."
};

let indexedChunks: ChunkRecord[] = [];
let initialized = false;
let initializingPromise: Promise<void> | null = null;
let remoteEmbeddingDisabledUntil = 0;
let remoteEmbeddingPermanentlyDisabled = false;
let remoteEmbeddingDisableReason = "";

const canUseRemoteEmbedding = (): boolean => {
  if (remoteEmbeddingPermanentlyDisabled) return false;
  return Date.now() >= remoteEmbeddingDisabledUntil;
};

const disableRemoteEmbedding = (reason: string, cooldownMs: number = 0) => {
  remoteEmbeddingDisableReason = reason;
  if (cooldownMs > 0) {
    remoteEmbeddingDisabledUntil = Date.now() + cooldownMs;
  } else {
    remoteEmbeddingPermanentlyDisabled = true;
  }
  console.warn(`[RAG] Remote embedding disabled: ${reason}`);
};

const normalizeVector = (vec: number[]): number[] => {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (!norm) return vec;
  return vec.map((v) => v / norm);
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  const len = Math.min(a.length, b.length);
  if (!len) return 0;
  let dot = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
  }
  return dot;
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

const hashToken = (token: string): number => {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const buildLocalEmbedding = (text: string): number[] => {
  const vector = new Array(LOCAL_EMBED_DIM).fill(0);
  for (const token of tokenize(text)) {
    const idx = hashToken(token) % LOCAL_EMBED_DIM;
    vector[idx] += 1;
  }
  return normalizeVector(vector);
};

const splitIntoChunks = (text: string): string[] => {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (candidate.length <= CHUNK_SIZE) {
      buffer = candidate;
      continue;
    }

    if (buffer) {
      chunks.push(buffer);
      const overlap = buffer.slice(-CHUNK_OVERLAP);
      buffer = `${overlap}\n${paragraph}`.slice(0, CHUNK_SIZE);
    } else {
      chunks.push(paragraph.slice(0, CHUNK_SIZE));
      buffer = paragraph.slice(CHUNK_SIZE - CHUNK_OVERLAP);
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
};

const loadKnowledgeDocuments = async (): Promise<KnowledgeDocument[]> => {
  const docs: KnowledgeDocument[] = [];

  for (const file of KNOWLEDGE_FILES) {
    const content = KNOWLEDGE_DOCS[file.key];
    if (!content) {
      throw new Error(`Unable to load knowledge document: ${file.key}`);
    }
    docs.push({
      id: file.id,
      disease: file.disease,
      source: `${file.key}.txt`,
      content,
    });
  }

  return docs;
};

const embedWithGemini = async (text: string): Promise<number[] | null> => {
  if (!GEMINI_API_KEY || !canUseRemoteEmbedding()) return null;

  for (const model of EMBED_MODEL_FALLBACKS) {
    try {
      const modelPath = model.startsWith("models/") ? model : `models/${model}`;
      const embedUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:embedContent`;
      const response = await axios.post(
        `${embedUrl}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          content: {
            parts: [{ text }],
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        },
      );

      const values =
        response.data?.embedding?.values ||
        response.data?.embeddings?.[0]?.values ||
        null;

      if (!Array.isArray(values)) continue;
      return normalizeVector(values.map((v: unknown) => Number(v) || 0));
    } catch (error: any) {
      const status = error?.response?.status as number | undefined;
      if (status === 404) {
        // Try next model alias.
        continue;
      }
      if (status === 401 || status === 403) {
        disableRemoteEmbedding("invalid or restricted embedding API key");
        return null;
      }
      if (status === 429) {
        disableRemoteEmbedding("embedding quota/rate-limit reached", 5 * 60 * 1000);
        return null;
      }
      // For transient network errors, fall back locally for this call only.
      return null;
    }
  }

  disableRemoteEmbedding("no embedding model endpoint available (404)");
  return null;
};

const getEmbedding = async (text: string): Promise<number[]> => {
  const geminiVec = await embedWithGemini(text);
  if (geminiVec && geminiVec.length > 0) return geminiVec;
  return buildLocalEmbedding(text);
};

export const initializeRagIndex = async (): Promise<void> => {
  if (initialized) return;
  if (initializingPromise) return initializingPromise;

  initializingPromise = (async () => {
    const docs = await loadKnowledgeDocuments();
    const chunksToEmbed: Omit<ChunkRecord, "embedding">[] = [];

    for (const doc of docs) {
      const chunks = splitIntoChunks(doc.content);
      chunks.forEach((text, idx) => {
        chunksToEmbed.push({
          id: `${doc.id}-${idx + 1}`,
          disease: doc.disease,
          source: doc.source,
          text,
        });
      });
    }

    const embedded: ChunkRecord[] = [];
    for (const chunk of chunksToEmbed) {
      const embedding = await getEmbedding(chunk.text);
      embedded.push({
        ...chunk,
        embedding,
      });
    }

    indexedChunks = embedded;
    initialized = true;
  })();

  return initializingPromise;
};

export const retrieveRelevantKnowledge = async (
  query: string,
  symptomProfile: SymptomProfile,
  topK: number = 4,
): Promise<RetrievedChunk[]> => {
  await initializeRagIndex();

  if (indexedChunks.length === 0) return [];

  const profileQuery = [
    query,
    `Dog age: ${symptomProfile.dogAge || "unknown"}`,
    `Dog breed: ${symptomProfile.dogBreed || "unknown"}`,
    `Itching severity: ${symptomProfile.itchingSeverity || "unknown"}`,
    `Lesions present: ${symptomProfile.hasLesions || "unknown"}`,
    `Hair loss present: ${symptomProfile.hasHairLoss || "unknown"}`,
    `Affected body areas: ${symptomProfile.affectedAreas || "unknown"}`,
  ].join("\n");

  const queryEmbedding = await getEmbedding(profileQuery);
  const scored = indexedChunks.map((chunk) => ({
    id: chunk.id,
    disease: chunk.disease,
    source: chunk.source,
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
};

export const getRagRuntimeStatus = () => ({
  remoteEmbeddingEnabled: canUseRemoteEmbedding(),
  remoteEmbeddingDisabledReason: remoteEmbeddingDisableReason || null,
});

export const buildRagContext = (chunks: RetrievedChunk[]): string => {
  if (!chunks.length) return "No knowledge base context retrieved.";
  return chunks
    .map(
      (chunk, idx) =>
        `Document ${idx + 1}\nDisease: ${chunk.disease}\nSource: ${chunk.source}\nSimilarity: ${chunk.score.toFixed(
          4,
        )}\nContent:\n${chunk.text}`,
    )
    .join("\n\n---\n\n");
};
