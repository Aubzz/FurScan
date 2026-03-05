import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Assessment } from "../../types/Assessment";
import { saveAssessmentToHistory } from "../../utils/historyStorage";

// Keep existing library as fallback/defaults
const DISEASE_LIBRARY: Record<string, any> = {
  "NO SKIN DISEASE PRESENT": {
    category: "MONITOR AT HOME",
    title: "Healthy Skin",
    features: "Clear skin, no redness, fur loss, or scaling.",
    description: "Your pet's skin appears healthy with no visible issues.",
    firstAid: [
      "Continue regular grooming",
      "Monitor for changes during play",
      "Maintain flea/tick prevention",
    ],
    urgency: "No urgent care needed. Schedule routine checkups.",
    watchFor: ["Any new red patches", "Excessive scratching", "Hair loss"],
    isContagious: false,
    severity: "low",
  },
  // ... (Other static entries are less relevant now as dynamic logic takes over, but kept for safety)
};

interface GlossaryItem {
  term: string;
  definition: string;
}

const MASTER_GLOSSARY: GlossaryItem[] = [
  {
    term: "Dermatophytosis",
    definition: "Clinical term for Ringworm (fungal infection).",
  },
  { term: "Alopecia", definition: "Technical term for hair loss." },
  {
    term: "Erythema",
    definition: "Superficial redness of the skin, sign of inflammation.",
  },
  {
    term: "Zoonotic",
    definition: "Disease that can spread from animals to humans.",
  },
  {
    term: "Malassezia",
    definition:
      "A type of yeast naturally found on skin that can cause infection.",
  },
  {
    term: "Demodectic",
    definition:
      "Mange caused by mites that live in hair follicles, usually non-contagious.",
  },
  {
    term: "Sarcoptic",
    definition:
      "Mange caused by burrowing mites (Scabies), highly contagious and itchy.",
  },
];

interface ResultItem {
  name: string;
  score: number;
}

const QUESTION_TO_STATEMENT_MAP: Record<string, string> = {
  "Is there visible hair loss or thinning fur?":
    "Visible hair loss or thinning fur",
  "Is the skin red, inflamed, or irritated?":
    "Skin is red, inflamed, or irritated",
  "Is your pet scratching, licking, or biting the area?":
    "Pet is scratching, licking, or biting",
  "Are there any open sores, scabs, or bleeding?":
    "Open sores, scabs, or bleeding present",
  "Is there a bad smell coming from the skin?":
    "Bad smell coming from the skin",
  "Does the skin look dry, flaky, or scaly?": "Skin looks dry, flaky, or scaly",
  "Are there bumps, lumps, or raised spots?":
    "Bumps, lumps, or raised spots present",
  "Has this issue happened before?": "Recurrent issue",
  "Is the area oozing discharge or pus?": "Area is oozing discharge or pus",
};

export default function DiagnosisReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const {
    condition,
    imageUri,
    summary,
    petName,
    petAge,
    petBreed,
    allResults,
    isHistory,
    diagnosisDetails, // NEW: Calculated CDSS data
    confidence,
  } = useLocalSearchParams<{
    condition: string;
    imageUri: string;
    summary: string;
    petName: string;
    petAge: string;
    petBreed: string;
    allResults: string;
    isHistory: string;
    diagnosisDetails?: string;
    confidence?: string;
  }>();

  const currentCondition =
    (condition as string)?.toUpperCase() || "NO SKIN DISEASE PRESENT";

  // --- MODIFIED LOGIC START ---
  // Prioritize the dynamic 'diagnosisDetails' passed from TellMeMoreScreen
  const details = useMemo(() => {
    // 1. Dynamic Data (From Clinical Scoring Engine)
    if (diagnosisDetails) {
      try {
        const parsed = JSON.parse(diagnosisDetails);

        // Construct the full description including the disclaimer (Rule 10)
        let fullDescription = parsed.description || "";
        if (parsed.disclaimer) {
          fullDescription += `\n\nNOTE: ${parsed.disclaimer}`;
        }

        return {
          // Defaults
          firstAid: [
            "Keep the area clean and dry",
            "Prevent scratching (use an E-Collar if needed)",
            "Wash bedding in hot water",
            "Monitor for spreading",
          ],
          watchFor: [
            "Spreading lesions",
            "Increased itching",
            "Oozing or bad odor",
          ],
          isContagious:
            (parsed.title || "").toLowerCase().includes("ringworm") ||
            (parsed.title || "").toLowerCase().includes("sarcoptic") ||
            (parsed.title || "").toLowerCase().includes("scabies"),

          // Merge parsed data (title, urgency, features, severity)
          ...parsed,
          // Override description to include disclaimer
          description: fullDescription,
        };
      } catch (e) {
        console.error("Failed to parse diagnosis details", e);
      }
    }

    // 2. Fallback to Static Library (Legacy/History items)
    if (DISEASE_LIBRARY[currentCondition])
      return DISEASE_LIBRARY[currentCondition];

    const match = Object.keys(DISEASE_LIBRARY).find(
      (key) => key.includes(currentCondition) || currentCondition.includes(key),
    );
    return match
      ? DISEASE_LIBRARY[match]
      : DISEASE_LIBRARY["NO SKIN DISEASE PRESENT"];
  }, [currentCondition, diagnosisDetails, isHistory]);
  // --- MODIFIED LOGIC END ---

  const filteredGlossary = useMemo(() => {
    const techText =
      (details.description || "").toLowerCase() +
      " " +
      (details.title || "").toLowerCase();
    return MASTER_GLOSSARY.filter((item) =>
      techText.includes(item.term.toLowerCase()),
    );
  }, [details]);

  const aiResultsArray = useMemo((): ResultItem[] => {
    try {
      if (!allResults) return [];
      const parsed = JSON.parse(allResults as string);

      // If parsed is array of objects
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === "object"
      ) {
        return parsed
          .map((item: any) => ({
            name: item.label || item.name || "Unknown",
            score: item.percentage || item.score || 0,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
      }
      return [];
    } catch (e) {
      // console.error("Error parsing AI results:", e);
    }
    return [];
  }, [allResults]);

  const detectedSkinLesions = useMemo(() => {
    // If features are passed in details (from CDSS logic), use those
    if (details.features) return details.features;

    if (isHistory === "true" && aiResultsArray.length > 0) {
      return aiResultsArray.map((i) => i.name).join(", ");
    }

    // Fallback parsing
    const lesions: string[] = [];
    try {
      if (!allResults) return "No specific lesions detected.";
      const parsed = JSON.parse(allResults as string);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          const label = (item.label || item.name || "").toLowerCase();
          if (label && label !== "healthy") lesions.push(label);
        });
      }
    } catch (e) {}

    return lesions.length > 0
      ? lesions.join(", ")
      : "No specific lesions detected.";
  }, [allResults, aiResultsArray, isHistory, details.features]);

  const userSymptoms = useMemo((): string[] => {
    try {
      return summary ? JSON.parse(summary) : [];
    } catch (e) {
      return [];
    }
  }, [summary]);

  const formatSymptomToStatement = (symptom: string) => {
    if (QUESTION_TO_STATEMENT_MAP[symptom]) {
      return QUESTION_TO_STATEMENT_MAP[symptom];
    }
    return symptom
      .replace(/\?$/, "")
      .replace(/^Is there /i, "There is ")
      .replace(/^Does the /i, "The ")
      .replace(/^Are there /i, "There are ")
      .replace(/^Are the /i, "The ")
      .replace(/^Is the /i, "The ");
  };

  const triage = useMemo(() => {
    const sev = details.severity || "low";
    if (sev === "high") {
      return {
        label: details.category || "URGENT VETERINARY CARE",
        color: "#D9534F",
        icon: "alert-circle" as const,
      };
    }
    if (sev === "moderate") {
      return {
        label: details.category || "SCHEDULE VETERINARY VISIT",
        color: "#F7924A",
        icon: "calendar" as const,
      };
    }
    return {
      label: details.category || "MONITOR AT HOME",
      color: "#5CB85C",
      icon: "shield-checkmark" as const,
    };
  }, [details]);

  const needsProfessionalHelp =
    details.severity === "moderate" || details.severity === "high";

  useEffect(() => {
    if (details.isContagious) setShowWarning(true);
  }, [details.isContagious]);

  const findNearbyVet = () => {
    const query =
      details.severity === "high"
        ? "Emergency Vet Clinic"
        : "Veterinary Clinic";
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) {
      Linking.openURL(url).catch(() =>
        Alert.alert("Error", "Could not open Maps."),
      );
    }
  };

  const handleReturnHome = async () => {
    if (isHistory === "true") {
      router.navigate("/(tabs)/home");
      return;
    }

    Alert.alert(
      "Exit Report",
      "Do you want to save this report to history before exiting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Don't Save",
          style: "destructive",
          onPress: () => router.navigate("/(tabs)/home"),
        },
        {
          text: "Save & Exit",
          style: "default",
          onPress: async () => {
            try {
              // --- MODIFIED SAVE LOGIC ---
              const newAssessment: Assessment = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                petInfo: {
                  name: petName || "Unknown Pet",
                  age: petAge || "Unknown",
                  breed: petBreed || "Unknown",
                },
                scanImage: imageUri,
                detectedLesions: detectedSkinLesions.split(", "),
                confidence: Number(confidence) || undefined,
                possibleCauses: [details.title || currentCondition],
                symptoms: userSymptoms,
                aiResults: aiResultsArray,
                // Save the full calculated details for history playback
                diagnosisDetails: {
                  severity: details.severity,
                  category: details.category,
                  description: details.description,
                  urgency: details.urgency,
                  features: details.features,
                  disclaimer: details.disclaimer, // Save the disclaimer
                  title: details.title,
                },
              };
              // --- END MODIFIED SAVE LOGIC ---

              await saveAssessmentToHistory(newAssessment);
              router.navigate("/(tabs)/home");
            } catch (error) {
              console.error("Failed to save history", error);
              router.navigate("/(tabs)/home");
            }
          },
        },
      ],
    );
  };

  const exportPDF = async () => {
    if (!imageUri) {
      Alert.alert("Error", "No image available.");
      return;
    }
    setLoading(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(
        imageUri as string,
        { encoding: "base64" },
      );
      const imageSrc = `data:image/jpeg;base64,${base64Image}`;

      const aiResultsHtml = aiResultsArray
        .map(
          (res: ResultItem) => `
          <div style="margin-bottom: 8px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px;">
              <span><b>${res.name}</b></span>
              <span>${res.score}%</span>
            </div>
            <div style="width:100%;background:#eee;height:6px;border-radius:3px;">
              <div style="width:${res.score}%;background:${triage.color};height:100%;border-radius:3px;"></div>
            </div>
          </div>
        `,
        )
        .join("");

      const symptomsHtml =
        userSymptoms.length > 0
          ? userSymptoms
              .map((s: string) => `<li>${formatSymptomToStatement(s)}</li>`)
              .join("")
          : "<li>No manual symptoms reported</li>";

      const html = `
        <html>
          <head><style>body { font-family: Arial; padding: 20px; }</style></head>
          <body>
            <h1 style="color: ${triage.color}; border-bottom: 3px solid ${triage.color};">${triage.label}</h1>
            
            <h2>Pet Information</h2>
            <p><b>Name:</b> ${petName || "N/A"} | <b>Age:</b> ${petAge || "N/A"} | <b>Breed:</b> ${petBreed || "N/A"}</p>
            
            <div style="text-align:center; margin: 20px 0;">
              <img src="${imageSrc}" style="width: 250px; border-radius: 10px;"/>
            </div>

            <h2>AI Analysis</h2>
            <p><b>Detected Lesions:</b> ${detectedSkinLesions}</p>
            <h3>Confidence Breakdown</h3>
            ${aiResultsHtml}

            <h2>Clinical Assessment</h2>
            <p><b>Possible Cause:</b> ${details.title || currentCondition}</p>
            <p><b>Analysis:</b> ${details.description.replace(/\n/g, "<br/>")}</p>

            <h2>User-Reported Symptoms</h2>
            <ul>${symptomsHtml}</ul>

            <h2>Care Instructions</h2>
            <ul>${(details.firstAid || []).map((item: string) => `<li>${item}</li>`).join("")}</ul>

            <h2>Recommendation</h2>
            <p style="background:#f9f9f9;padding:10px;border-left:4px solid ${triage.color};">
              ${details.urgency}
            </p>
            
            ${details.disclaimer ? `<p style="font-size:10px;color:#999;font-style:italic;">${details.disclaimer}</p>` : ""}

            <hr/>
            <p style="font-size:10px;color:#999;">Generated by DermaPaw on ${new Date().toLocaleDateString()}</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert("Error", "Failed to export PDF.");
    } finally {
      setLoading(false);
    }
  };

  const renderDescription = () => {
    // Logic handles CDSS reasoning by simply rendering the full description string
    // which now includes the reasoning.
    const text = details.description || "";
    return (
      <View style={[styles.descCard, styles.technicalCard]}>
        <View style={styles.descHeader}>
          <MaterialCommunityIcons name="microscope" size={16} color="#2C3E50" />
          <Text style={[styles.descLabel, styles.technicalLabel]}>
            ABOUT THIS CONDITION
          </Text>
        </View>
        <Text style={styles.descBody}>{text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.warningOverlay}>
          <View style={styles.warningCard}>
            <View style={styles.warningIconBg}>
              <Ionicons name="warning" size={40} color="#D9534F" />
            </View>
            <Text style={styles.warningTitle}>Safety Alert</Text>
            <Text style={styles.warningDesc}>
              This condition is contagious. Wash hands and isolate{" "}
              {petName || "your pet"}.
            </Text>
            <TouchableOpacity
              style={styles.warningBtn}
              onPress={() => setShowWarning(false)}
            >
              <Text style={styles.warningBtnText}>Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skin Analysis Report</Text>
          <TouchableOpacity
            onPress={exportPDF}
            disabled={loading}
            style={styles.iconBtn}
          >
            <Ionicons
              name={loading ? "sync-outline" : "download-outline"}
              size={24}
              color={triage.color}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri as string }}
              style={styles.petImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.triageBadgeWrapper}>
            <View
              style={[styles.triageBadge, { backgroundColor: triage.color }]}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.triageLabelText}>{triage.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.petProfileCard}>
          <View style={styles.petProfileDetail}>
            <MaterialCommunityIcons name="paw" size={16} color={triage.color} />
            <Text style={styles.petProfileText}>{petName || "Pet Name"}</Text>
          </View>
          <View style={styles.petProfileDivider} />
          <View style={styles.petProfileDetail}>
            <MaterialCommunityIcons name="dog" size={16} color="#666" />
            <Text style={styles.petProfileText}>{petBreed || "Unknown"}</Text>
          </View>
          <View style={styles.petProfileDivider} />
          <View style={styles.petProfileDetail}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.petProfileText}>{petAge || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={20}
              color={triage.color}
            />
            <Text style={styles.sectionTitle}>DETECTED LESIONS</Text>
          </View>

          <View style={styles.resultsContainer}>
            {aiResultsArray.length > 0 ? (
              aiResultsArray.map((res: ResultItem, index: number) => (
                <View key={index} style={styles.resultRow}>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{res.name}</Text>
                    <Text style={styles.resultPercentage}>{res.score}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${res.score}%`,
                          backgroundColor:
                            index === 0 ? triage.color : "#E0E0E0",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            ) : detectedSkinLesions &&
              detectedSkinLesions !== "No specific lesions detected." ? (
              <Text style={styles.lesionText}>{detectedSkinLesions}</Text>
            ) : (
              <Text style={styles.emptyText}>
                No specific lesions detected.
              </Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="stethoscope"
              size={20}
              color={triage.color}
            />
            <Text style={styles.sectionTitle}>POSSIBLE CAUSE</Text>
          </View>
          <Text style={[styles.conditionName, { color: triage.color }]}>
            {details.title || currentCondition}
          </Text>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={20}
              color="#666"
            />
            <Text style={styles.sectionTitle}>USER-REPORTED SYMPTOMS</Text>
          </View>
          <View style={styles.symptomContainer}>
            {userSymptoms.length > 0 ? (
              userSymptoms.map((s: string, i: number) => (
                <View key={i} style={styles.symptomPill}>
                  <Ionicons name="checkmark-circle" size={14} color="#5CB85C" />
                  <Text style={styles.symptomText}>
                    {formatSymptomToStatement(s)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No manual symptoms added.</Text>
            )}
          </View>

          <View style={styles.divider} />
          {renderDescription()}

          {filteredGlossary.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={20}
                  color="#666"
                />
                <Text style={styles.sectionTitle}>GLOSSARY</Text>
              </View>
              <View style={styles.glossaryContainer}>
                {filteredGlossary.map((item, index) => (
                  <View key={index} style={styles.glossaryItem}>
                    <Text style={styles.glossaryTerm}>
                      {item.term}:{" "}
                      <Text style={styles.glossaryDef}>{item.definition}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="heart-flash"
              size={20}
              color="#D9534F"
            />
            <Text style={styles.sectionTitle}>CARE INSTRUCTIONS</Text>
          </View>
          <View style={styles.careCard}>
            {(details.firstAid || []).map((item: string, i: number) => (
              <View key={i} style={styles.careRow}>
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={16}
                  color={triage.color}
                />
                <Text style={styles.careText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Conditional "Watch For" section (Legacy feature kept if data exists) */}
          {details.severity === "low" && details.watchFor && (
            <>
              <View style={styles.divider} />
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.sectionTitle}>WATCH FOR CHANGES</Text>
              </View>
              {(details.watchFor || []).map((item: string, i: number) => (
                <View key={i} style={styles.watchRow}>
                  <Ionicons name="eye-outline" size={16} color="#666" />
                  <Text style={styles.watchText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          <View style={[styles.urgencyBox, { borderColor: triage.color }]}>
            <Text style={[styles.urgencyLabel, { color: triage.color }]}>
              {details.severity === "low"
                ? "WHEN TO ESCALATE"
                : "ACTION REQUIRED"}
            </Text>
            <Text style={styles.urgencyText}>{details.urgency}</Text>
          </View>
        </View>

        {needsProfessionalHelp && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>PROFESSIONAL CARE</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#4285F4" }]}
                onPress={findNearbyVet}
              >
                <Ionicons name="map" size={20} color="white" />
                <Text style={styles.actionBtnText}>Find Clinic</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#34A853" }]}
                onPress={() => Linking.openURL("tel:911")}
              >
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.actionBtnText}>Call Vet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={[styles.mainExportBtn, { backgroundColor: triage.color }]}
            onPress={exportPDF}
            disabled={loading}
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.mainExportBtnText}>
              {loading ? "Generating..." : "Download PDF Report"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={handleReturnHome}>
            <Ionicons name="home-outline" size={20} color="#666" />
            <Text style={styles.homeBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: "#F5F5F5" },
  petProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    width: "85%",
    alignSelf: "center",
  },
  petProfileDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
  petProfileText: { fontSize: 13, color: "#444", fontWeight: "700" },
  petProfileDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#DDD",
    marginHorizontal: 12,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    position: "relative",
  },
  imageContainer: {
    borderWidth: 8,
    borderColor: "#D9534F",
    borderRadius: 40,
    overflow: "visible",
    width: 250,
    height: 250,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  petImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    overflow: "hidden",
  },
  triageBadgeWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    alignItems: "center",
    zIndex: 10,
  },
  triageBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  triageLabelText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  bodyContent: { paddingHorizontal: 25 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#999",
    letterSpacing: 1,
  },
  lesionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 10,
  },
  lesionText: { fontSize: 14, color: "#444", flex: 1, fontStyle: "italic" },
  resultsContainer: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  resultRow: { marginBottom: 12 },
  resultInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  resultName: { fontSize: 13, fontWeight: "600", color: "#444" },
  resultPercentage: { fontSize: 13, fontWeight: "700", color: "#888" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  emptyText: { fontSize: 13, color: "#BBB", fontStyle: "italic" },
  conditionName: { fontSize: 26, fontWeight: "900", marginBottom: 15 },
  symptomContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  symptomPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#DFF0DF",
  },
  symptomText: { fontSize: 12, color: "#2E7D32", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 20 },
  descCard: { padding: 18, borderRadius: 20, marginBottom: 15 },
  descHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  descLabel: { fontSize: 12, fontWeight: "800" },
  technicalCard: { backgroundColor: "#F4F7FA" },
  simpleCard: { backgroundColor: "#FFF9F5" },
  technicalLabel: { color: "#2C3E50" },
  simpleLabel: { color: "#F7924A" },
  descBody: { fontSize: 14, color: "#444", lineHeight: 22 },
  careCard: {
    backgroundColor: "#FEF2F2",
    padding: 15,
    borderRadius: 15,
    gap: 12,
  },
  careRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  careText: { fontSize: 14, color: "#444", flex: 1, lineHeight: 20 },
  watchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  watchText: { fontSize: 14, color: "#444", flex: 1 },
  urgencyBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: "#F9F9F9",
  },
  urgencyLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 4 },
  urgencyText: { fontSize: 14, color: "#333", fontWeight: "600" },
  glossaryContainer: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 15,
  },
  glossaryItem: { marginBottom: 8 },
  glossaryTerm: { fontWeight: "bold", fontSize: 14, color: "#444" },
  glossaryDef: { fontWeight: "normal", color: "#666", lineHeight: 18 },
  actionSection: { marginHorizontal: 25, marginTop: 20 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  actionBtnText: { color: "white", fontWeight: "bold", fontSize: 14 },
  bottomButtonsContainer: { paddingHorizontal: 25, marginTop: 10, gap: 12 },
  mainExportBtn: {
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  mainExportBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  homeBtn: {
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
  },
  homeBtnText: { color: "#666", fontWeight: "bold", fontSize: 16 },
  warningOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  warningCard: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
  },
  warningIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FDEDED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  warningDesc: {
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginBottom: 25,
  },
  warningBtn: {
    backgroundColor: "#D9534F",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  warningBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
