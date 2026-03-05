import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // Added useLocalSearchParams
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TIP_ITEMS = [
  {
    icon: "bulb-outline",
    text: "Make sure the area is well lit using natural light if possible.",
    type: "ionicons",
  },
  {
    icon: "focus-field",
    text: "Keep the camera steady and in focus.",
    type: "material",
  },
  {
    icon: "magnify",
    text: "Make sure the entire skin problem is visible, including some surrounding skin.",
    type: "material",
  },
  {
    icon: "hand-holding-heart",
    text: "Gently part the fur if needed to clearly see the skin.",
    type: "fontawesome",
  },
  {
    icon: "image-filter-black-white",
    text: "Avoid shadows, flash glare, or blurry images.",
    type: "material",
  },
];

export default function PhotoTipsScreen() {
  const router = useRouter();

  // 1. CATCH the baton from PetInfoScreen
  const { petName, petAge, petBreed } = useLocalSearchParams();

  const handleContinue = () => {
    // 2. PASS the baton to ScanScreen
    router.push({
      pathname: "/Screens/ScanScreen",
      params: {
        petName,
        petAge,
        petBreed,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={28} color="#E89152" />
          </TouchableOpacity>

          <View style={styles.stepper}>
            <View style={[styles.dot, styles.activeDot]}>
              <Text style={styles.dotText}>1</Text>
            </View>
            <View style={[styles.line, styles.activeLine]} />
            <View style={[styles.dot, styles.activeDot]}>
              <Text style={styles.dotText}>2</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.dot}>
              <Text style={styles.dotText}>3</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.dot}>
              <Text style={styles.dotText}>4</Text>
            </View>
          </View>

          <Text style={styles.title}>Scan Pet Skin</Text>
          <Text style={styles.subtitle}>
            Please take a clear photo of your pet&apos;s skin problem. The image
            will be analyzed to identify visible skin features as part of the
            assessment process.
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#E89152" />
            <Text style={styles.infoText}>Tips for taking a photo.</Text>
          </View>

          {/* Tips List */}
          {TIP_ITEMS.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.iconContainer}>
                {tip.type === "ionicons" && (
                  <Ionicons name={tip.icon as any} size={24} color="#555" />
                )}
                {tip.type === "material" && (
                  <MaterialCommunityIcons
                    name={tip.icon as any}
                    size={24}
                    color="#555"
                  />
                )}
                {tip.type === "fontawesome" && (
                  <FontAwesome5 name={tip.icon as any} size={20} color="#555" />
                )}
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue} // Changed to use the new function
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  backBtn: { marginTop: 10 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: { backgroundColor: "#E89152" },
  dotText: { color: "#FFF", fontWeight: "bold" },
  line: { width: 40, height: 3, backgroundColor: "#E5E5E5" },
  activeLine: { backgroundColor: "#E89152" },
  title: { fontSize: 32, fontWeight: "bold", color: "#E89152" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 10, lineHeight: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 15 },
  infoText: { marginLeft: 8, fontWeight: "bold", color: "#333" },
  tipCard: {
    backgroundColor: "#FFF5EE",
    flexDirection: "row",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: { width: 40, alignItems: "center" },
  tipText: { flex: 1, fontSize: 13, color: "#444", marginLeft: 10 },
  continueBtn: {
    backgroundColor: "#E89152",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  continueText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
