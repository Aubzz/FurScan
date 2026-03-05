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
  textSecondary: "#666666", // Slightly darker for better reading
  lightGray: "#F8F9FA",
  shadowColor: "#000000",
  accent: "#FFAB91", // Light reddish orange for disclaimer
};

// --- DATA STRUCTURE ---
// We organize the long text into an array of objects for cleaner rendering
const POLICY_SECTIONS = [
  {
    id: 1,
    title: "Introduction",
    icon: "info",
    content:
      "This Privacy Policy explains how the system collects, uses, stores, and protects user and pet-related information. The system is designed to ensure transparency, data security, and responsible handling of information.",
  },
  {
    id: 2,
    title: "Information We Collect",
    icon: "database",
    content: null, // Complex content handled in render
    subSections: [
      {
        subtitle: "User Information",
        details:
          "• Full Name\n• Email Address\n• Mobile Number\n\nUsed for identification, communication, and reports.",
      },
      {
        subtitle: "Pet & Scan Data",
        details:
          "• Images of the dog’s skin\n• Disease detection results\n• Date and time of scans",
      },
      {
        subtitle: "Chatbot Interaction",
        details:
          "• User questions\n• System-generated responses\n\nUsed to assist users and improve guidance.",
      },
    ],
  },
  {
    id: 3,
    title: "Purpose of Data Collection",
    icon: "target",
    content:
      "The collected data is used for:\n\n• Detecting possible skin diseases in dogs\n• Displaying detection results and scan history\n• Providing assistance through the chatbot\n• Improving system accuracy and usability",
  },
  {
    id: 4,
    title: "Image & Scan Data Handling",
    icon: "image",
    content:
      "• Skin images are used only for disease detection.\n• Images are stored locally or securely within the system.\n• Images are not shared with third parties.\n• Users may delete scan images and detection history at any time.",
  },
  {
    id: 5,
    title: "Chatbot Data Usage",
    icon: "message-square",
    content:
      "• Chatbot conversations are not used for diagnosis.\n• No personal data is shared through chatbot interactions.\n• Chatbot responses are informational and assistive only.",
  },
  {
    id: 6,
    title: "Data Sharing & Disclosure",
    icon: "share-2",
    content:
      "• The system does not sell, trade, or share user data with third parties.\n• Data is used strictly for academic, research, and system functionality purposes.\n• Anonymous data may be used for system improvement only with user consent.",
  },
  {
    id: 7,
    title: "Data Security",
    icon: "shield",
    content:
      "We apply reasonable security measures including:\n\n• Restricted system access\n• Secure storage of collected information\n• Controlled permissions for camera and storage access",
  },
  {
    id: 8,
    title: "User Rights",
    icon: "user-check",
    content:
      "Users have the right to:\n\n• View their stored information\n• Edit profile details\n• Delete detection history and images\n• Request removal of all stored data",
  },
  {
    id: 9,
    title: "Disclaimer",
    icon: "alert-triangle",
    special: true, // Special styling for disclaimer
    content:
      "This system is intended for educational and assistive purposes only and is not a substitute for professional veterinary diagnosis or treatment. Users are encouraged to consult a licensed veterinarian for medical concerns.",
  },
  {
    id: 10,
    title: "Changes to Policy",
    icon: "refresh-cw",
    content:
      "This Privacy Policy may be updated to improve clarity or reflect system enhancements. Any changes will be made available within the system.",
  },
  {
    id: 11,
    title: "Contact Information",
    icon: "mail",
    content:
      "For questions or concerns regarding this Privacy Policy, users may contact the system support team through the provided support channels.",
  },
];

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
      name="file-document-outline"
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

const PrivacyPolicyScreen = () => {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.subtitleContainer}></View>
      </View>

      {/* Content Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {POLICY_SECTIONS.map((section) => (
          <View
            key={section.id}
            style={[
              styles.card,
              section.special && styles.specialCard, // Apply special style if disclaimer
            ]}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  section.special && { backgroundColor: "#FFCCBC" },
                ]}
              >
                <Feather
                  name={section.icon as any}
                  size={20}
                  color={section.special ? "#D84315" : Colors.background}
                />
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  section.special && { color: "#D84315" },
                ]}
              >
                {section.id}. {section.title}
              </Text>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              {section.content ? (
                <Text style={styles.bodyText}>{section.content}</Text>
              ) : (
                // Handle nested subsections (Section 2)
                <View>
                  {section.subSections?.map((sub, index) => (
                    <View key={index} style={styles.subSection}>
                      <Text style={styles.subTitle}>{sub.subtitle}</Text>
                      <Text style={styles.bodyText}>{sub.details}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>End of Privacy Policy</Text>
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
    paddingBottom: 30,
    // Straight edges as requested for previous screens
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
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.white,
  },
  subtitleContainer: {
    paddingHorizontal: 25,
    marginTop: 5,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
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
    // Shadow
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  specialCard: {
    backgroundColor: "#FFFBEA", // Very light orange/yellow tint
    borderColor: "#FFCCBC",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    flex: 1,
  },
  cardBody: {
    paddingLeft: 42, // Indent content to align with title text, not icon
  },
  bodyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Subsections (for Section 2)
  subSection: {
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
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
    fontStyle: "italic",
  },
});

export default PrivacyPolicyScreen;
