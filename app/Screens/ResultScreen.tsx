import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Import your interface to fix the 'any' warnings
import { Prediction } from "../../types/scan";

export default function ResultsScreen() {
  const { imageUri, predictions, petName, petAge, petBreed } =
    useLocalSearchParams();
  const router = useRouter();

  // 1. Parse results with proper typing
  const results = useMemo<Prediction[]>(() => {
    try {
      const parsed = predictions ? JSON.parse(predictions as string) : [];
      // ← FIXED: Sort by confidence (highest first) but show ALL diseases
      return Array.isArray(parsed)
        ? parsed.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
        : [];
    } catch (e) {
      console.error("Parsing error:", e);
      return [];
    }
  }, [predictions]);

  // 2. Accurate Healthy Check: If the list contains only 'healthy' or is empty
  const isHealthy = useMemo(() => {
    if (results.length === 0) return true;
    return !results.some((p) => p.label.toLowerCase() !== "healthy");
  }, [results]);

  // ← NEW: Get disease count for display
  const diseaseCount = useMemo(() => {
    return results.filter((p) => p.label.toLowerCase() !== "healthy").length;
  }, [results]);

  const handleProceed = () => {
    router.push({
      pathname: "/Screens/TellMeMoreScreen" as any,
      params: {
        imageUri: imageUri,
        aiPrediction:
          !isHealthy && results.length > 0 ? results[0].label : "Healthy",
        petName,
        petAge,
        petBreed,
        allResults: predictions,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={32} color="#F7924A" />
          </TouchableOpacity>
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <View style={[styles.dot, styles.activeDot]}>
                <Text style={styles.dotText}>{step}</Text>
              </View>
              <View style={[styles.line, step < 3 && styles.activeLine]} />
            </React.Fragment>
          ))}
          <View style={styles.dot}>
            <Text style={styles.dotText}>4</Text>
          </View>
        </View>

        {/* Dynamic Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.titleText, !isHealthy && { color: "#E74C3C" }]}>
            {isHealthy ? "Analysis Complete" : "Issues Detected"}
          </Text>
          <Text style={styles.subtitleText}>
            {isHealthy
              ? `We didn't find any visible skin issues for ${petName}.`
              : `Found ${diseaseCount} condition(s) for ${petName}.`}
          </Text>
        </View>

        {/* Image Card */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageUri as string }}
            style={styles.scannedImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.statusBadge,
              isHealthy ? styles.healthyBadge : styles.warningBadge,
            ]}
          >
            <Ionicons
              name={isHealthy ? "checkmark-circle" : "warning"}
              size={20}
              color={isHealthy ? "#27AE60" : "#C0392B"}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isHealthy ? "#27AE60" : "#C0392B" },
              ]}
            >
              {isHealthy
                ? "NO DISEASES FOUND"
                : `${diseaseCount} ISSUE(S) DETECTED`}
            </Text>
          </View>
        </View>

        {/* Results List - NOW SHOWS ALL DISEASES */}
        <View style={styles.resultsWrapper}>
          {!isHealthy && results.length > 0 ? (
            <View>
              <Text style={styles.listHeader}>
                DETECTION DETAILS ({diseaseCount} CONDITION
                {diseaseCount !== 1 ? "S" : ""})
              </Text>
              {results
                .filter((p) => p.label.toLowerCase() !== "healthy")
                .map((p, i) => (
                  <View key={i} style={styles.progressRow}>
                    <View
                      style={[
                        styles.barContainer,
                        { backgroundColor: "#FDF2F2" },
                      ]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${p.percentage}%`,
                            backgroundColor: "#E74C3C",
                          },
                        ]}
                      />
                      <Text
                        style={[styles.conditionLabel, { color: "#922B21" }]}
                      >
                        {p.label.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.percentageText}>{p.percentage}%</Text>
                  </View>
                ))}

              {/* Additional Info */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#F7924A" />
                <Text style={styles.infoText}>
                  Multiple conditions may be present. Consult a veterinary
                  dermatologist for accurate diagnosis.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.healthyInfoBox}>
              <Text style={styles.healthyInfoTitle}>
                Everything looks good!
              </Text>
              <Text style={styles.healthyInfoDesc}>
                The AI analysis did not detect circular bald patches, scaling,
                hairloss, or redness. Continue to monitor {petName} for any
                changes.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !isHealthy && { backgroundColor: "#E74C3C" },
            ]}
            onPress={handleProceed}
          >
            <Text style={styles.continueBtnText}>Proceed to Questionnaire</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanAgainBtn}
            // FIXED: Using 'as any' and ensuring the path matches your router
            onPress={() => router.replace("/Screens/ScanScreen" as any)}
          >
            <Ionicons name="refresh" size={20} color="#F7924A" />
            <Text style={styles.scanAgainText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: { backgroundColor: "#F7924A" },
  dotText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  line: { width: 35, height: 3, backgroundColor: "#E5E5E5" },
  activeLine: { backgroundColor: "#F7924A" },
  titleSection: { paddingHorizontal: 25, marginTop: 10, marginBottom: 20 },
  titleText: { fontSize: 32, fontWeight: "bold", color: "#F7924A" },
  subtitleText: { fontSize: 14, color: "#333", marginTop: 4 },
  imageCard: {
    backgroundColor: "#FFF9F5",
    marginHorizontal: 20,
    borderRadius: 35,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E0D5",
  },
  scannedImage: { width: "100%", height: 240, borderRadius: 30 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 1,
  },
  healthyBadge: { backgroundColor: "#E8F8EF", borderColor: "#2ECC71" },
  warningBadge: { backgroundColor: "#FDEDEC", borderColor: "#E74C3C" },
  badgeText: { fontWeight: "bold", marginLeft: 8, fontSize: 12 },
  healthyInfoBox: {
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  healthyInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  healthyInfoDesc: { fontSize: 14, color: "#666", lineHeight: 20 },
  resultsWrapper: { paddingHorizontal: 25, marginTop: 30 },
  listHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#AAA",
    marginBottom: 15,
    letterSpacing: 1,
  },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  barContainer: {
    height: 48,
    backgroundColor: "#FFF2E9",
    borderRadius: 24,
    flex: 1,
    marginRight: 15,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  barFill: { position: "absolute", left: 0, height: "100%", opacity: 0.3 },
  conditionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8D5932",
    zIndex: 1,
  },
  percentageText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
    width: 60,
    textAlign: "right",
  },
  // ← NEW: Info box for multiple conditions
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFF9F5",
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F0E0D5",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  footer: { paddingHorizontal: 25, marginTop: 30 },
  continueBtn: {
    backgroundColor: "#F7924A",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  continueBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 8,
  },
  scanAgainBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#F7924A",
  },
  scanAgainText: {
    color: "#F7924A",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
