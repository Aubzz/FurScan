import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Constants & Theme ---
const Colors = {
  background: "#F79C4E", // Main Orange
  backgroundLight: "#FFF6EE",
  white: "#FFFFFF",
  textPrimary: "#333333",
  textSecondary: "#666666",
  lightGray: "#F8F9FA",
  accent: "#FFAB91",
  shadowColor: "#000000",
  tupRed: "#C62828", // Subtle nod to TUP colors if needed
};

// --- Background Component ---
const BackgroundStickers = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <MaterialCommunityIcons
      name="paw"
      size={40}
      color="rgba(255,255,255,0.15)"
      style={{
        position: "absolute",
        top: 50,
        right: 20,
        transform: [{ rotate: "15deg" }],
      }}
    />
    <MaterialCommunityIcons
      name="information-outline"
      size={80}
      color="rgba(255,255,255,0.08)"
      style={{
        position: "absolute",
        top: 20,
        left: -20,
        transform: [{ rotate: "-15deg" }],
      }}
    />
    <MaterialCommunityIcons
      name="dog"
      size={35}
      color="rgba(255,255,255,0.15)"
      style={{
        position: "absolute",
        bottom: 40,
        right: 80,
        transform: [{ rotate: "-10deg" }],
      }}
    />
  </View>
);

const AboutUsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header Section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <BackgroundStickers />
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroContent}>
          <MaterialCommunityIcons
            name="paw"
            size={40}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={styles.appName}>FurScan</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. System Overview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="monitor" size={20} color={Colors.background} />
            </View>
            <Text style={styles.cardTitle}>System Overview</Text>
          </View>
          <Text style={styles.bodyText}>
            <Text style={{ fontWeight: "bold" }}>FurScan: </Text>
            An AI-Based Image Analysis System for Differential Identification of
            Common Skin Diseases in Dogs.
          </Text>
          <View style={styles.separator} />
          <Text style={styles.bodyText}>
            This is an academic project developed as part of the thesis
            requirements of fourth-year Computer Science students from the{" "}
            <Text style={{ fontWeight: "bold", color: "#C62828" }}>
              Technological University of the Philippines – Manila
            </Text>
            .
          </Text>
          <Text style={[styles.bodyText, { marginTop: 10 }]}>
            The system utilizes image-based scanning and an assistive chatbot to
            help identify possible skin diseases in dogs and provide
            informational guidance to pet owners.
          </Text>
        </View>

        {/* 2. Purpose of the System */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="target" size={20} color={Colors.background} />
            </View>
            <Text style={styles.cardTitle}>Purpose of the System</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Feather
              name="check-circle"
              size={16}
              color={Colors.background}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.bulletText}>
              To support early awareness of common dog skin conditions
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Feather
              name="check-circle"
              size={16}
              color={Colors.background}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.bulletText}>
              To demonstrate the application of computer vision and AI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Feather
              name="check-circle"
              size={16}
              color={Colors.background}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.bulletText}>
              To provide an assistive and educational tool for pet owners
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              This project is intended for academic and research purposes.
            </Text>
          </View>
        </View>

        {/* 3. Development Team */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="users" size={20} color={Colors.background} />
            </View>
            <Text style={styles.cardTitle}>Development Team</Text>
          </View>
          <Text style={styles.bodyText}>
            This system was developed by a group of{" "}
            <Text style={{ fontWeight: "bold" }}>
              Bachelor of Science in Computer Science
            </Text>{" "}
            students as part of their undergraduate thesis at TUP – Manila.
          </Text>
        </View>

        {/* 4. Technologies Used */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="cpu" size={20} color={Colors.background} />
            </View>
            <Text style={styles.cardTitle}>Technologies Used</Text>
          </View>
          <View style={styles.techContainer}>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>Image Processing</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>Machine Learning</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>AI Detection</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>Chatbot</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>Mobile App</Text>
            </View>
          </View>
        </View>

        {/* 5. Disclaimer */}
        <View style={[styles.card, styles.specialCard]}>
          <View style={styles.cardHeader}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FFCCBC" }]}
            >
              <Feather name="alert-triangle" size={20} color="#D84315" />
            </View>
            <Text style={[styles.cardTitle, { color: "#D84315" }]}>
              Disclaimer
            </Text>
          </View>
          <Text style={styles.bodyText}>
            This system is designed for educational and assistive purposes only
            and is not a substitute for professional veterinary diagnosis or
            treatment. Users are encouraged to consult a licensed veterinarian
            for accurate medical advice.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 FurScan. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.lightGray },

  // Header
  headerContainer: {
    backgroundColor: Colors.background,
    paddingBottom: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  heroContent: {
    alignItems: "center",
    marginTop: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 5,
  },
  appVersion: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 0,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  specialCard: {
    backgroundColor: "#FFFBEA",
    borderColor: "#FFCCBC",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "justify",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 10,
  },

  // Bullets
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: Colors.backgroundLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  infoBoxText: {
    fontSize: 13,
    color: Colors.background,
    fontWeight: "600",
    textAlign: "center",
  },

  // Tech Badges
  techContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  techBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  techText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "500",
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    color: "#999",
    fontSize: 12,
  },
});

export default AboutUsScreen;
