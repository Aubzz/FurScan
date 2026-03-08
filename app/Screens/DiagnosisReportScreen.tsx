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

// Import your Auth Context hook
import { useAuth } from "../../contexts/AuthContext";

const DISEASE_LIBRARY: Record<string, any> = {
  "NO SKIN DISEASE PRESENT": {
    category: "HEALTHY",
    features: "Clear skin, no redness, fur loss, or scaling.",
    description:
      "TECHNICAL: No dermatological conditions detected.\n\nSIMPLE: Your pet's skin appears healthy with no visible issues.",
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
  RINGWORM: {
    category: "SCHEDULE VISIT",
    features: "Circular bald patches, scaling, hair loss.",
    description:
      "TECHNICAL: Dermatophytosis. A contagious fungal infection affecting hair shafts.\n\nSIMPLE: Fungal infection creating circular bald patches and hair loss.",
    firstAid: [
      "Limit contact with other pets",
      "Wash hands thoroughly",
      "Keep area clean and dry",
    ],
    urgency: "Laboratory confirmation and antifungal medication required.",
    watchFor: ["Lesions spreading", "New patches appearing"],
    isContagious: true,
    severity: "moderate",
  },
  "FUNGAL INFECTION": {
    category: "SCHEDULE VISIT",
    features: "Scaling, hair loss, redness.",
    description:
      "TECHNICAL: Fungal overgrowth on skin causing inflammation.\n\nSIMPLE: Fungal overgrowth causing scaling, hair loss, and redness.",
    firstAid: [
      "Keep area dry",
      "Avoid excessive bathing",
      "Wash and dry bedding regularly",
    ],
    urgency: "Professional diagnosis and medication required.",
    watchFor: ["Increased redness", "Oozing skin", "Odor"],
    isContagious: false,
    severity: "moderate",
  },
  "DEMODECTIC MANGE": {
    category: "SCHEDULE VISIT",
    features: "Hair loss, redness, mild scaling.",
    description:
      "TECHNICAL: Demodicosis. Overgrowth of mites naturally present in skin causing Alopecia.\n\nSIMPLE: Natural mites overpopulating, causing hair loss and redness.",
    firstAid: [
      "Prevent scratching",
      "Maintain good nutrition",
      "Avoid home insecticides",
    ],
    urgency: "Requires skin scraping and professional mite count.",
    watchFor: ["Widespread hair loss", "Secondary skin infections"],
    isContagious: false,
    severity: "moderate",
  },
  HYPERSENSITIVITY: {
    category: "MONITOR",
    features: "Redness, mild scaling.",
    description:
      "TECHNICAL: Allergic reaction to food, shampoo, dust, or pollen causing Erythema.\n\nSIMPLE: Allergic reaction causing mild inflammation and redness.",
    firstAid: [
      "Gently clean with lukewarm water",
      "Keep skin dry",
      "Identify and remove allergen",
    ],
    urgency: "If not improved after 3-5 days → Schedule veterinary visit.",
    watchFor: ["Hair loss develops", "Scaling increases", "Redness spreads"],
    isContagious: false,
    severity: "low",
  },
  DERMATITIS: {
    category: "SCHEDULE VISIT",
    features: "Redness, scaling, hair loss.",
    description:
      "TECHNICAL: Skin inflammation related to allergy or infection. Often presents as Erythema.\n\nSIMPLE: General skin irritation causing redness, scaling, and hair loss.",
    firstAid: ["Keep area clean", "Prevent licking", "Use gentle shampoos"],
    urgency: "Professional assessment needed to find underlying cause.",
    watchFor: ["Moist skin folds", "Intense itching", "Odor"],
    isContagious: false,
    severity: "moderate",
  },
  "SARCOPTIC MANGE": {
    category: "URGENT",
    features: "Hair loss, redness, intense itching.",
    description:
      "TECHNICAL: Highly contagious mite infestation causing severe irritation. This is Zoonotic.\n\nSIMPLE: Contagious mites causing intense itching and painful skin.",
    firstAid: [
      "Isolate pet immediately",
      "Minimize handling",
      "Seek emergency care",
    ],
    urgency: "Immediate clinical intervention required.",
    watchFor: ["Severe scratching", "Self-mutilation", "Rapid spread"],
    isContagious: true,
    severity: "high",
  },
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
];

interface ResultItem {
  name: string;
  score: number;
}

export default function DiagnosisReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const { user } = useAuth();

  const params = useLocalSearchParams<{
    condition: string;
    imageUri: string;
    summary: string;
    petName: string;
    petAge: string;
    petBreed: string;
    allResults: string;
    combinedResults: string;
    isReadOnly: string;
  }>();

  const {
    condition,
    imageUri,
    summary,
    petName,
    petAge,
    petBreed,
    allResults,
    isReadOnly,
  } = params;

  const currentCondition =
    (condition as string)?.toUpperCase() || "NO SKIN DISEASE PRESENT";

  const details = useMemo(() => {
    if (DISEASE_LIBRARY[currentCondition])
      return DISEASE_LIBRARY[currentCondition];
    const match = Object.keys(DISEASE_LIBRARY).find(
      (key) => key.includes(currentCondition) || currentCondition.includes(key),
    );
    return match
      ? DISEASE_LIBRARY[match]
      : DISEASE_LIBRARY["NO SKIN DISEASE PRESENT"];
  }, [currentCondition]);

  const filteredGlossary = useMemo(() => {
    const techText = (details.description || "").toLowerCase();
    return MASTER_GLOSSARY.filter((item) =>
      techText.includes(item.term.toLowerCase()),
    );
  }, [details]);

  const aiResultsArray = useMemo((): ResultItem[] => {
    try {
      if (!allResults) return [];
      const parsed = JSON.parse(allResults as string);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => {
            const rawScore =
              item.percentage ?? item.score ?? item.probability ?? 0;
            const score =
              rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);
            return {
              name: item.label || item.name || "Unknown",
              score: score > 100 ? 100 : Math.max(score, 0),
            };
          })
          .sort((a: ResultItem, b: ResultItem) => b.score - a.score)
          .slice(0, 5);
      }
    } catch (e) {
      console.error("Error parsing AI results:", e);
    }
    return [];
  }, [allResults]);

  const detectedSkinLesions = useMemo(() => {
    const lesions: string[] = [];
    try {
      if (!allResults) return "No specific lesions detected by AI.";
      const parsed = JSON.parse(allResults as string);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          const label = (item.label || item.name || "").toLowerCase();
          if (label && label !== "healthy") {
            lesions.push(label);
          }
        });
      }
    } catch (e) {
      console.error("Error parsing lesions:", e);
    }
    return lesions.length > 0
      ? lesions.join(", ")
      : "No specific lesions detected by AI.";
  }, [allResults]);

  const userSymptoms = useMemo((): string[] => {
    try {
      return summary ? JSON.parse(summary) : [];
    } catch (e) {
      console.error("Error parsing symptoms:", e);
      return [];
    }
  }, [summary]);

  const triage = useMemo(() => {
    if (details.severity === "low") {
      return {
        label: details.category,
        color: "#5CB85C",
        icon: "shield-checkmark" as const,
      };
    }
    if (details.severity === "high") {
      return {
        label: details.category,
        color: "#D9534F",
        icon: "alert-circle" as const,
      };
    }
    return {
      label: details.category,
      color: "#F7924A",
      icon: "calendar" as const,
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

  useEffect(() => {
    const saveToHistory = async () => {
      if (!user || isReadOnly === "true") return;

      try {
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: `scan_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);

        const uploadResponse = await fetch(
          "http://192.168.100.4:8080/api/upload-scan",
          {
            method: "POST",
            body: formData,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) throw new Error("Image upload failed");

        const permanentImageUrl = uploadData.imageUrl;
        const fullName =
          `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim();

        const payload = {
          userName: fullName || "Unknown User",
          petName: petName || "Unknown",
          petBreed: petBreed || "Unknown",
          petAge: petAge || "Unknown",
          diagnosis: currentCondition,
          severity: details.severity,
          aiResults: aiResultsArray,
          userSymptoms: userSymptoms,
          imageUri: permanentImageUrl,
        };

        const saveResponse = await fetch(
          "http://192.168.100.4:8080/api/save-diagnosis",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const saveData = await saveResponse.json();
        if (saveData.success) {
          console.log(`✅ Permanent record saved for ${fullName}!`);
        }
      } catch (error) {
        console.error("❌ Error in permanent save process:", error);
      }
    };

    if (currentCondition && imageUri) {
      saveToHistory();
    }
  }, [user, currentCondition, isReadOnly, imageUri]);

  const handleReturnHome = () => {
    Alert.alert(
      "Exit Report",
      "Are you sure you want to return to the start screen?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Exit",
          style: "destructive",
          onPress: () => router.replace("/(tabs)/home"),
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
          ? userSymptoms.map((s: string) => `<li>${s}</li>`).join("")
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

            <h2>Diagnosis</h2>
            <p><b>Preliminary Diagnosis:</b> ${currentCondition}</p>
            <p><b>Assessment:</b> ${details.features}</p>

            <h2>User-Reported Symptoms</h2>
            <ul>${symptomsHtml}</ul>

            <h2>Care Instructions</h2>
            <ul>${(details.firstAid || []).map((item: string) => `<li>${item}</li>`).join("")}</ul>

            <h2>Recommendation</h2>
            <p style="background:#f9f9f9;padding:10px;border-left:4px solid ${triage.color};">
              ${details.urgency}
            </p>

            <hr/>
            <p style="font-size:10px;color:#999;">Generated by FurScan on ${new Date().toLocaleDateString()}</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.error("PDF error:", e);
      Alert.alert("Error", "Failed to export PDF.");
    } finally {
      setLoading(false);
    }
  };

  const renderDescription = () => {
    const parts = details.description.split("\n\n");
    return parts.map((part: string, index: number) => {
      const isTechnical = part.startsWith("TECHNICAL:");
      const cleanText = part.replace("TECHNICAL: ", "").replace("SIMPLE: ", "");
      return (
        <View
          key={index}
          style={[
            styles.descCard,
            isTechnical ? styles.technicalCard : styles.simpleCard,
          ]}
        >
          <View style={styles.descHeader}>
            <MaterialCommunityIcons
              name={isTechnical ? "microscope" : "book-open-variant"}
              size={16}
              color={isTechnical ? "#2C3E50" : "#F7924A"}
            />
            <Text
              style={[
                styles.descLabel,
                isTechnical ? styles.technicalLabel : styles.simpleLabel,
              ]}
            >
              {isTechnical ? "CLINICAL EVALUATION" : "SIMPLE EXPLANATION"}
            </Text>
          </View>
          <Text style={styles.descBody}>{cleanText}</Text>
        </View>
      );
    });
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
              style={[styles.petImage, { borderColor: triage.color }]}
            />
            <View
              style={[styles.triageBadge, { backgroundColor: triage.color }]}
            >
              <Ionicons name={triage.icon} size={14} color="white" />
              <Text style={styles.triageLabelText}>{triage.label}</Text>
            </View>
          </View>

          <View style={styles.patientInfoContainer}>
            <Text style={styles.patientInfoLabel}>PATIENT INFORMATION</Text>
            <Text style={styles.patientName}>{petName || "Pet Name"}</Text>

            <View style={styles.patientDetailsRow}>
              <View style={styles.patientDetailColumn}>
                <Text style={styles.patientDetailLabel}>BREED</Text>
                <Text style={styles.patientDetailValue}>
                  {petBreed || "Unknown"}
                </Text>
              </View>

              <View style={styles.patientDetailColumn}>
                <Text style={styles.patientDetailLabel}>AGE</Text>
                <Text style={styles.patientDetailValue}>{petAge || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.patientInfoBottomDivider} />
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
          <View style={styles.lesionBox}>
            <Ionicons name="search" size={18} color="#666" />
            <Text style={styles.lesionText}>{detectedSkinLesions}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-pie" size={20} color="#666" />
            <Text style={styles.sectionTitle}>CONFIDENCE BREAKDOWN</Text>
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
                            index === 0 ? triage.color : "#efb36d",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No AI predictions available</Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="stethoscope"
              size={20}
              color={triage.color}
            />
            <Text style={styles.sectionTitle}>POSSIBLE CAUSES</Text>
          </View>
          <Text style={[styles.conditionName, { color: triage.color }]}>
            {currentCondition}
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
                  <Text style={styles.symptomText}>{s}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No manual symptoms added.</Text>
            )}
          </View>

          {renderDescription()}

          {filteredGlossary.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={20}
                  color="#666"
                />
                <Text style={styles.sectionTitle}>GLOSSARY</Text>
              </View>
              <View style={styles.glossaryContainer}>
                {filteredGlossary.map((item: GlossaryItem, index: number) => (
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

          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="eye-outline" size={20} color="#666" />
            <Text style={styles.sectionTitle}>WATCH FOR CHANGES</Text>
          </View>
          {(details.watchFor || []).map((item: string, i: number) => (
            <View key={i} style={styles.watchRow}>
              <Ionicons name="eye-outline" size={16} color="#666" />
              <Text style={styles.watchText}>{item}</Text>
            </View>
          ))}

          <View style={[styles.urgencyBox, { borderColor: triage.color }]}>
            <Text style={[styles.urgencyLabel, { color: triage.color }]}>
              RECOMMENDATION
            </Text>
            <Text style={styles.urgencyText}>{details.urgency}</Text>
          </View>

          {needsProfessionalHelp && (
            <View style={styles.actionSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="hospital-building"
                  size={20}
                  color="#F7924A"
                />
                <Text style={styles.sectionTitle}>PROFESSIONAL CARE</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#F7924A" }]}
                  onPress={findNearbyVet}
                >
                  <Ionicons name="map" size={20} color="white" />
                  <Text style={styles.actionBtnText}>Find Clinic</Text>
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

  // --- NEW PATIENT INFO STYLES ---
  patientInfoContainer: {
    width: "85%",
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 5,
  },
  patientInfoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#999",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#333",
    marginBottom: 16,
  },
  patientDetailsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  patientDetailColumn: {
    flex: 1,
  },
  patientDetailLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#999",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  patientDetailValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
  },
  patientInfoBottomDivider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginTop: 18,
  },
  // -------------------------------

  heroSection: { alignItems: "center", marginVertical: 15 },
  imageContainer: { position: "relative" },
  petImage: { width: 240, height: 240, borderRadius: 30, borderWidth: 6 },
  triageBadge: {
    position: "absolute",
    bottom: 5,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  triageLabelText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bodyContent: { paddingHorizontal: 25 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
    marginBottom: 8,
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
    marginBottom: 5,
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
  descCard: { padding: 18, borderRadius: 20, marginBottom: 10 },
  descHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  descLabel: { fontSize: 12, fontWeight: "800" },
  technicalCard: {
    backgroundColor: "#F4F7FA",
    borderRadius: 10,
    marginTop: 10,
  },
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
  actionSection: { marginTop: 5 },
  actionRow: { flexDirection: "row", marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  actionBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  bottomButtonsContainer: { marginTop: 30, gap: 12 },
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
  glossaryContainer: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 15,
  },
  glossaryItem: { marginBottom: 8 },
  glossaryTerm: { fontWeight: "bold", fontSize: 14, color: "#444" },
  glossaryDef: { fontWeight: "normal", color: "#666", lineHeight: 18 },
});
