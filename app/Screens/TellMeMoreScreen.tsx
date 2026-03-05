import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAssessment } from "../../contexts/AssessmentContext";

// --- 1. CONFIGURATION & TYPES ---

type UrgencyLevel =
  | "Monitor at Home"
  | "Schedule Veterinary Visit"
  | "Urgent Veterinary Care";

interface QuestionDef {
  id: string;
  text: string;
  hint: string;
  img: string;
}

const DOCTOR_IMAGES: Record<string, any> = {
  dog1: require("../../assets/images/doctor_1.png"),
  dog2: require("../../assets/images/doctor_2.png"),
  dog3: require("../../assets/images/doctor_3.png"),
  dog4: require("../../assets/images/doctor_4.png"),
  dog5: require("../../assets/images/doctor_5.png"),
  dog6: require("../../assets/images/doctor_6.png"),
  dog7: require("../../assets/images/doctor_7.png"),
  dog8: require("../../assets/images/doctor_8.png"),
  dog9: require("../../assets/images/doctor_9.png"),
  dog10: require("../../assets/images/doctor_10.png"),
};

// --- QUESTION LIBRARY (Mapped to Scoring Needs) ---
const QUESTION_LIBRARY: Record<string, QuestionDef> = {
  itchy: {
    id: "itchy",
    text: "Is your pet itchy (scratching, biting, or licking)?",
    hint: "Itching is a primary indicator for Sarcoptic Mange and Hypersensitivity.",
    img: "dog8",
  },
  severe_itch: {
    id: "severe_itch",
    text: "Is the itching severe, constant, or worse at night?",
    hint: "Severe itching strongly increases the likelihood of Sarcoptic Mange.",
    img: "dog7",
  },
  spreading: {
    id: "spreading",
    text: "Are the lesions spreading to other parts of the body?",
    hint: "Spreading suggests an active infection like Ringworm or Yeast.",
    img: "dog5",
  },
  exposure: {
    id: "exposure",
    text: "Did this start after a change in food, shampoo, or environment?",
    hint: "This helps identify Hypersensitivity (Allergies).",
    img: "dog9",
  },
  other_pets: {
    id: "other_pets",
    text: "Are other pets in the household showing similar signs?",
    hint: "Contagion points to Sarcoptic Mange or Ringworm.",
    img: "dog4",
  },
  skin_texture: {
    id: "skin_texture",
    text: "Is the skin greasy, smelly, or thickened (elephant skin)?",
    hint: "These are classic signs of Malassezia (Yeast) Dermatitis.",
    img: "dog6",
  },
  trauma: {
    id: "trauma",
    text: "Was there a recent wound, chemical contact, or excessive grooming?",
    hint: "This suggests Irritant or Bacterial Dermatitis.",
    img: "dog10",
  },
};

// --- SCORING SYSTEM CONSTANTS ---
const DISEASE_KEYS = {
  RINGWORM: "dermatophytosis",
  YEAST: "malassezia_dermatitis",
  DEMODECTIC: "demodectic_mange",
  SARCOPTIC: "sarcoptic_mange",
  ALLERGY: "hypersensitivity_dermatitis",
  IRRITANT: "irritant_dermatitis",
};

const DISEASE_DISPLAY_NAMES: Record<string, string> = {
  [DISEASE_KEYS.RINGWORM]: "Dermatophytosis (Ringworm)",
  [DISEASE_KEYS.YEAST]: "Malassezia Dermatitis (Yeast Infection)",
  [DISEASE_KEYS.DEMODECTIC]: "Demodectic Mange",
  [DISEASE_KEYS.SARCOPTIC]: "Sarcoptic Mange",
  [DISEASE_KEYS.ALLERGY]: "Hypersensitivity Dermatitis",
  [DISEASE_KEYS.IRRITANT]: "Irritant / Bacterial Dermatitis",
};

export default function TellMeMoreScreen() {
  const router = useRouter();
  const { updateAssessment } = useAssessment();
  const { imageUri, petName, petAge, petBreed, allResults } =
    useLocalSearchParams();

  // --- STATE ---
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [detectedLesions, setDetectedLesions] = useState<string[]>([]);

  // --- STEP 1: READ & NORMALIZE DETECTED LESIONS ---
  useEffect(() => {
    let lesions: string[] = [];
    try {
      if (allResults) {
        const parsed = JSON.parse(allResults as string);
        if (Array.isArray(parsed)) {
          lesions = parsed
            .map((p: any) => {
              const label = (p.label || p.name || "").toLowerCase();
              if (label === "hairloss") return "hair loss"; // Normalize
              return label;
            })
            .filter((l) =>
              [
                "redness",
                "scaling",
                "hair loss",
                "circular bald patches",
              ].includes(l),
            );
        }
      }
    } catch (e) {
      console.error("Error parsing lesions:", e);
    }

    const uniqueLesions = [...new Set(lesions)];
    setDetectedLesions(uniqueLesions);

    // Start with the most generic but important question
    setCurrentQuestionId("itchy");
  }, [allResults]);

  // --- QUESTION FLOW LOGIC ---
  const getNextQuestion = (
    currentAnswers: Record<string, "yes" | "no">,
  ): string | null => {
    // 1. Itchiness check (Fundamental)
    if (!currentAnswers.hasOwnProperty("itchy")) return "itchy";

    // 2. Severity check (Only if itchy)
    if (
      currentAnswers["itchy"] === "yes" &&
      !currentAnswers.hasOwnProperty("severe_itch")
    ) {
      return "severe_itch";
    }

    // 3. Spreading check (Important for Ringworm/Yeast)
    if (!currentAnswers.hasOwnProperty("spreading")) return "spreading";

    // 4. Exposure check (Allergy)
    if (!currentAnswers.hasOwnProperty("exposure")) return "exposure";

    // 5. Other Pets (Contagion)
    if (!currentAnswers.hasOwnProperty("other_pets")) return "other_pets";

    // 6. Skin Texture (Yeast specific)
    if (!currentAnswers.hasOwnProperty("skin_texture")) return "skin_texture";

    // 7. Trauma (Irritant) - Last check
    if (!currentAnswers.hasOwnProperty("trauma")) return "trauma";

    return null; // All data points collected
  };

  const handleAnswer = (val: "yes" | "no") => {
    if (!currentQuestionId) return;

    const updatedAnswers = { ...answers, [currentQuestionId]: val };
    setAnswers(updatedAnswers);
    setQuestionHistory((prev) => [...prev, currentQuestionId]);

    const nextQ = getNextQuestion(updatedAnswers);

    if (nextQ) {
      setCurrentQuestionId(nextQ);
    } else {
      finishAssessment(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (questionHistory.length > 0) {
      const prevQ = questionHistory[questionHistory.length - 1];
      const newHistory = questionHistory.slice(0, -1);
      const newAnswers = { ...answers };
      delete newAnswers[prevQ as string];

      setQuestionHistory(newHistory);
      setAnswers(newAnswers);
      setCurrentQuestionId(prevQ);
    } else {
      router.back();
    }
  };

  // --- CLINICAL SCORING ENGINE (THE CORE LOGIC) ---
  const calculateClinicalAssessment = (
    lesions: string[],
    ans: Record<string, string>,
    ageStr: string,
    breedStr: string,
  ) => {
    // Initialize Scores
    const scores: Record<string, number> = {
      [DISEASE_KEYS.RINGWORM]: 0,
      [DISEASE_KEYS.YEAST]: 0,
      [DISEASE_KEYS.DEMODECTIC]: 0,
      [DISEASE_KEYS.SARCOPTIC]: 0,
      [DISEASE_KEYS.ALLERGY]: 0,
      [DISEASE_KEYS.IRRITANT]: 0,
    };

    const reasoning: string[] = [];

    // --- 4. LESION-BASED LOGIC ---
    if (lesions.includes("circular bald patches")) {
      scores[DISEASE_KEYS.RINGWORM] += 30;
      reasoning.push("Circular bald patches strongly suggest Ringworm.");
    }

    if (lesions.includes("scaling")) {
      scores[DISEASE_KEYS.YEAST] += 15;
      scores[DISEASE_KEYS.RINGWORM] += 10;
      scores[DISEASE_KEYS.IRRITANT] += 10;
      reasoning.push(
        "Scaling indicates possible Yeast, Ringworm, or Irritation.",
      );
    }

    if (lesions.includes("redness")) {
      scores[DISEASE_KEYS.YEAST] += 15;
      scores[DISEASE_KEYS.ALLERGY] += 15;
      scores[DISEASE_KEYS.IRRITANT] += 15;
      reasoning.push(
        "Redness suggests inflammation (Yeast, Allergy, Irritant).",
      );
    }

    if (lesions.includes("hair loss")) {
      scores[DISEASE_KEYS.DEMODECTIC] += 20;
      scores[DISEASE_KEYS.SARCOPTIC] += 20;
      scores[DISEASE_KEYS.RINGWORM] += 10;
      reasoning.push("Hair loss is common in Mange (Demodectic/Sarcoptic).");
    }

    // --- 5. SYMPTOM-BASED LOGIC ---
    if (ans["itchy"] === "yes") {
      scores[DISEASE_KEYS.SARCOPTIC] += 20;
      scores[DISEASE_KEYS.ALLERGY] += 20;
      scores[DISEASE_KEYS.YEAST] += 10;
      reasoning.push(
        "Itching increases likelihood of Sarcoptic Mange & Allergies.",
      );
    }

    if (ans["severe_itch"] === "yes") {
      scores[DISEASE_KEYS.SARCOPTIC] += 30;
      reasoning.push("Severe itching is a hallmark of Sarcoptic Mange.");
    }

    if (ans["spreading"] === "yes") {
      scores[DISEASE_KEYS.RINGWORM] += 10;
      scores[DISEASE_KEYS.YEAST] += 10;
    }

    if (ans["exposure"] === "yes") {
      scores[DISEASE_KEYS.ALLERGY] += 30;
      reasoning.push(
        "Reaction to triggers strongly suggests Hypersensitivity.",
      );
    }

    if (ans["other_pets"] === "yes") {
      scores[DISEASE_KEYS.SARCOPTIC] += 25;
      scores[DISEASE_KEYS.RINGWORM] += 15;
      reasoning.push("Contagion points to Sarcoptic Mange or Ringworm.");
    }

    if (ans["skin_texture"] === "yes") {
      scores[DISEASE_KEYS.YEAST] += 25;
      reasoning.push("Thickened/Greasy skin is typical of Malassezia.");
    }

    if (ans["trauma"] === "yes") {
      scores[DISEASE_KEYS.IRRITANT] += 25;
      reasoning.push("History of trauma/contact suggests Irritant Dermatitis.");
    }

    // --- 6. AGE MODIFIER LOGIC ---
    const ageVal = parseAge(ageStr);
    if (ageVal !== null) {
      if (ageVal < 12) {
        scores[DISEASE_KEYS.DEMODECTIC] += 15;
        reasoning.push("Young age increases risk of Demodectic Mange.");
      } else if (ageVal >= 12 && ageVal <= 36) {
        scores[DISEASE_KEYS.ALLERGY] += 10;
        scores[DISEASE_KEYS.YEAST] += 5;
      } else if (ageVal > 84) {
        // > 7 years
        scores[DISEASE_KEYS.IRRITANT] += 10;
      }
    }

    // --- 7. BREED MODIFIER LOGIC ---
    const b = (breedStr || "").toLowerCase();
    if (
      ["bulldog", "pitbull", "shar-pei", "shepherd"].some((x) => b.includes(x))
    ) {
      scores[DISEASE_KEYS.DEMODECTIC] += 10;
    }
    if (
      ["retriever", "labrador", "shih tzu", "terrier"].some((x) =>
        b.includes(x),
      )
    ) {
      scores[DISEASE_KEYS.ALLERGY] += 10;
      scores[DISEASE_KEYS.YEAST] += 5;
    }
    if (["shih tzu", "poodle", "retriever"].some((x) => b.includes(x))) {
      scores[DISEASE_KEYS.RINGWORM] += 5;
    }

    // --- 8. FINAL RESULT SELECTION ---
    // Sort by score descending
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winnerKey = sorted[0][0];
    const winnerScore = sorted[0][1];
    const possibleCause = DISEASE_DISPLAY_NAMES[winnerKey];

    // Calculate generic confidence (0-100 scale relative to max possible typically ~100)
    // Capping at 95% because "No Diagnosis" rule.
    const confidence = Math.min(Math.round((winnerScore / 100) * 100), 95);

    // --- 9. URGENCY LEVEL LOGIC ---
    let urgency: UrgencyLevel = "Monitor at Home";

    if (winnerKey === DISEASE_KEYS.SARCOPTIC) {
      urgency = "Urgent Veterinary Care";
    } else if (
      [
        DISEASE_KEYS.RINGWORM,
        DISEASE_KEYS.YEAST,
        DISEASE_KEYS.DEMODECTIC,
        DISEASE_KEYS.IRRITANT,
      ].includes(winnerKey)
    ) {
      urgency = "Schedule Veterinary Visit";
    } else if (winnerKey === DISEASE_KEYS.ALLERGY) {
      urgency = "Monitor at Home";
    }

    // Override Urgency
    if (ans["severe_itch"] === "yes" || ans["spreading"] === "yes") {
      urgency = "Urgent Veterinary Care";
      reasoning.push(
        "Urgency elevated due to severe symptoms (itching/spreading).",
      );
    }

    return {
      possibleCause,
      urgency,
      confidence,
      reasoning: [...new Set(reasoning)], // Dedupe
      scores,
    };
  };

  const parseAge = (ageStr: string): number | null => {
    // Basic parser for "2 years", "5 months"
    try {
      if (!ageStr) return null;
      const lower = ageStr.toLowerCase();
      const num = parseInt(lower.replace(/\D/g, ""), 10);
      if (isNaN(num)) return null;

      if (lower.includes("year") || lower.includes("yr")) return num * 12;
      if (lower.includes("month") || lower.includes("mo")) return num;
      return num * 12; // Default to years if unit missing
    } catch (e) {
      return null;
    }
  };

  const finishAssessment = (finalAnswers: Record<string, string>) => {
    const result = calculateClinicalAssessment(
      detectedLesions,
      finalAnswers,
      (petAge as string) || "2 years",
      (petBreed as string) || "Mixed",
    );

    // Map urgency to UI colors
    let severity: "low" | "moderate" | "high" = "low";
    if (result.urgency === "Schedule Veterinary Visit") severity = "moderate";
    if (result.urgency === "Urgent Veterinary Care") severity = "high";

    const diagnosisDetails = {
      severity,
      category: result.urgency.toUpperCase(),
      urgency: result.urgency,
      title: result.possibleCause,
      features: detectedLesions.join(", "),
      description: `Assessment indicates ${result.possibleCause}. \n\nReasoning:\n• ${result.reasoning.join("\n• ")}`,
      disclaimer:
        "This assessment is not a diagnosis. Veterinary examination is required.",
    };

    const summary = Object.keys(finalAnswers)
      .filter((k) => finalAnswers[k] === "yes")
      .map((k) => QUESTION_LIBRARY[k]?.text);

    updateAssessment({
      symptoms: summary,
      possibleCauses: [result.possibleCause],
      diagnosisDetails: diagnosisDetails,
    });

    router.push({
      pathname: "/Screens/DiagnosisReportScreen" as any,
      params: {
        condition: result.possibleCause.toUpperCase(),
        diagnosisDetails: JSON.stringify(diagnosisDetails),
        confidence: result.confidence.toString(),
        summary: JSON.stringify(summary),
        imageUri,
        petName,
        petAge,
        petBreed,
        allResults,
      },
    });
  };

  // --- RENDER HELPERS ---
  const currentQ = currentQuestionId
    ? QUESTION_LIBRARY[currentQuestionId]
    : null;
  const currentStep = Math.min(questionHistory.length + 1, 7); // 7 total questions max

  return (
    <SafeAreaView style={styles.container}>
      {/* Explanation Modal */}
      <Modal visible={showExplanation} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowExplanation(false)}
        >
          <View style={styles.explanationBubble}>
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleTitle}>Clinical Relevance</Text>
              <TouchableOpacity onPress={() => setShowExplanation(false)}>
                <Ionicons name="close-circle" size={24} color="#E89152" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bubbleText}>
              {currentQ ? currentQ.hint : ""}
            </Text>
            <TouchableOpacity
              style={styles.closeBtnSmall}
              onPress={() => setShowExplanation(false)}
            >
              <Text style={styles.closeBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.wrapper}>
        <View>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#E89152" />
          </TouchableOpacity>

          <View style={styles.stepper}>
            {[1, 2, 3, 4, 5, 6].map((step, idx) => (
              <React.Fragment key={step}>
                <View
                  style={[styles.dot, idx < currentStep && styles.activeDot]}
                >
                  <Text style={styles.dotText}>{step}</Text>
                </View>
                {step < 6 && (
                  <View
                    style={[
                      styles.line,
                      idx < currentStep - 1 && styles.activeLine,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.textHeader}>
            <Text style={styles.title}>Clinical Assessment</Text>
            {detectedLesions.length > 0 && (
              <Text style={styles.subtitle}>
                Observed: {detectedLesions.join(", ")}
              </Text>
            )}
          </View>
        </View>

        {currentQ ? (
          <View style={styles.centerArea}>
            <Image
              source={DOCTOR_IMAGES[currentQ.img] || DOCTOR_IMAGES["dog1"]}
              style={styles.mascot}
              resizeMode="contain"
            />
            <View style={styles.card}>
              <Text style={styles.qText}>{currentQ.text}</Text>
              <TouchableOpacity
                style={styles.helpIconButton}
                onPress={() => setShowExplanation(true)}
              >
                <Ionicons name="medical-outline" size={24} color="#E89152" />
                <Text style={styles.helpIconText}>Why we ask</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.centerArea}>
            <Text>Calculating Risk Score...</Text>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.choice}
            onPress={() => handleAnswer("yes")}
          >
            <Text style={styles.choiceText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choice, styles.noBtn]}
            onPress={() => handleAnswer("no")}
          >
            <Text style={styles.choiceText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  wrapper: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  backBtn: { marginTop: 10 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  dot: {
    width: 25,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F2D9C7",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: { backgroundColor: "#E89152" },
  dotText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  line: { width: 40, height: 3, backgroundColor: "#F2D9C7" },
  activeLine: { backgroundColor: "#E89152" },
  textHeader: { marginBottom: 10, alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E89152",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
    textAlign: "center",
  },
  centerArea: { alignItems: "center", justifyContent: "center", flex: 1 },
  mascot: { width: 160, height: 160, marginBottom: -35, zIndex: 1 },
  card: {
    backgroundColor: "#FFF9F5",
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#F0E0D5",
    alignItems: "center",
  },
  qText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    lineHeight: 28,
  },
  helpIconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  helpIconText: {
    marginLeft: 5,
    color: "#E89152",
    fontSize: 13,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  explanationBubble: {
    backgroundColor: "white",
    width: "85%",
    padding: 25,
    borderRadius: 30,
    borderLeftWidth: 6,
    borderLeftColor: "#E89152",
    elevation: 10,
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  bubbleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E89152",
    textTransform: "uppercase",
  },
  bubbleText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    marginBottom: 20,
  },
  closeBtnSmall: {
    backgroundColor: "#E89152",
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  closeBtnText: { color: "white", fontWeight: "bold", fontSize: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  choice: {
    backgroundColor: "#E89152",
    width: "47%",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  noBtn: { backgroundColor: "#333" },
  choiceText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
