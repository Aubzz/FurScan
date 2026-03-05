import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";
import { Assessment } from "../../types/Assessment";

import {
  deleteAssessmentFromHistory,
  getHistoryFromStorage,
} from "../../utils/historyStorage";

const Colors = {
  background: "#F8F9FA",
  primaryOrange: "#F79C4E",
  darkOrange: "#E86F2C",
  lightOrange: "#FFF3E8",
  cardBg: "#FFFFFF",
  textPrimary: "#2D3436",
  textSecondary: "#888888",
  white: "#FFFFFF",
  borderColor: "#E0E0E0",
  shadow: "#000000",
  success: "#27AE60",
  danger: "#C0392B",
};

const HomeScreen = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Pet Parent");
  const [history, setHistory] = useState<Assessment[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfile = async () => {
        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/api/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok && isActive) {
            const data = await response.json();
            if (data.first_name) setUserName(data.first_name);

            const path =
              data.profile_image ||
              data.profileImagePath ||
              data.profile_image_path;

            if (path) {
              if (path.startsWith("http")) {
                setDisplayImage(path);
              } else {
                const cleanPath = path.startsWith("/")
                  ? path.substring(1)
                  : path;
                setDisplayImage(
                  `${API_URL}/${cleanPath.replace(/\\/g, "/")}?t=${Date.now()}`,
                );
              }
            }
          }
        } catch (error) {
          console.log("Error fetching profile:", error);
        }
      };

      const loadHistory = async () => {
        try {
          const stored = await getHistoryFromStorage();
          if (isActive) {
            const sorted = stored.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            setHistory(sorted.slice(0, 5));
          }
        } catch (error) {
          console.log("Error loading history:", error);
        }
      };

      fetchProfile();
      loadHistory();

      return () => {
        isActive = false;
      };
    }, [token]),
  );

  const getContextImage = () => {
    if (displayImage) return displayImage;
    if (!user) return null;
    const userData = user as any;
    if (userData.first_name && userName === "Pet Parent")
      setUserName(userData.first_name);
    const path =
      userData.profile_image ||
      userData.profileImagePath ||
      userData.profile_image_path;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${API_URL}/${cleanPath.replace(/\\/g, "/")}`;
  };

  const profileImageUrl = getContextImage();

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning,";
    if (hours < 18) return "Good Afternoon,";
    return "Good Evening,";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleHistoryItemPress = (item: Assessment) => {
    const isHealthy =
      !item.possibleCauses ||
      item.possibleCauses.length === 0 ||
      item.possibleCauses.includes("Healthy") ||
      item.possibleCauses[0] === "Inconclusive / Healthy Appearance";

    const condition = isHealthy
      ? "Inconclusive / Healthy Appearance"
      : item.possibleCauses?.[0] || "Issue Detected";

    const imageUri = (item as any).scanImage || "";
    // Handle legacy symptoms struct vs new string string[]
    const symptomsData =
      (item as any).symptoms || (item as any).userSymptoms || [];

    router.push({
      pathname: "/Screens/DiagnosisReportScreen" as any,
      params: {
        condition,
        confidence: item.confidence?.toString() ?? "N/A", // History doesn't reliably store this per session
        summary: JSON.stringify(symptomsData),
        imageUri: imageUri,
        petName: item.petInfo.name,
        petAge: String(item.petInfo.age),
        petBreed: item.petInfo.breed,
        allResults: JSON.stringify(
          item.aiResults || item.detectedLesions || [],
        ),
        isHistory: "true",
        // NEW: Pass the saved diagnosis details so the history screen rebuilds exactly
        diagnosisDetails: item.diagnosisDetails
          ? JSON.stringify(item.diagnosisDetails)
          : undefined,
      },
    });
  };

  const renderActionCard = () => {
    return (
      <View style={styles.actionCardContainer}>
        <LinearGradient
          colors={[Colors.white, Colors.lightOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionCard}
        >
          <MaterialCommunityIcons
            name="paw"
            size={180}
            color="rgba(247, 146, 74, 0.08)"
            style={styles.bgIcon}
          />

          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="camera-plus-outline"
              size={40}
              color={Colors.primaryOrange}
            />
          </View>

          <Text style={styles.actionTitle}>Check Your Pet&apos;s Skin</Text>
          <Text style={styles.actionSubtitle}>
            Take a photo of the affected area to get an instant AI analysis and
            care tips.
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/Screens/PetInfoScreen")}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>START NEW SCAN</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const handleDeleteHistoryItem = async (id: string) => {
    Alert.alert("Delete Scan", "Are you sure you want to delete this scan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteAssessmentFromHistory(id);
          if (success) {
            const stored = await getHistoryFromStorage();
            const sorted = stored.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            setHistory(sorted.slice(0, 5));
          } else {
            Alert.alert("Error", "Could not delete history item.");
          }
        },
      },
    ]);
  };

  const renderHistoryItem = (item: Assessment, index: number) => {
    const isHealthy =
      !item.possibleCauses ||
      item.possibleCauses.length === 0 ||
      item.possibleCauses.includes("Healthy") ||
      item.possibleCauses[0] === "Inconclusive / Healthy Appearance";

    const conditionTitle = isHealthy
      ? "Healthy"
      : item.possibleCauses?.[0] || "Issue Detected";

    return (
      <Animated.View
        key={item.id || index}
        style={[
          styles.historyCardWrapper,
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            marginBottom: 18,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.historyCardMain}
          onPress={() => handleHistoryItemPress(item)}
          activeOpacity={0.8}
        >
          {/* Scan preview image */}
          {item.scanImage ? (
            <Image
              source={{ uri: item.scanImage }}
              style={styles.historyThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.historyThumbnailPlaceholder}>
              <MaterialCommunityIcons
                name="image-off-outline"
                size={28}
                color="#ccc"
              />
            </View>
          )}
          <View style={styles.historyIconContainer}>
            <MaterialCommunityIcons
              name={isHealthy ? "check-circle-outline" : "alert-circle-outline"}
              size={24}
              color={isHealthy ? Colors.success : Colors.danger}
            />
          </View>
          <View style={styles.historyContent}>
            <Text style={styles.historyPetName}>{item.petInfo.name}</Text>
            <Text
              style={[
                styles.historyCondition,
                { color: isHealthy ? Colors.success : Colors.danger },
              ]}
              numberOfLines={1}
            >
              {conditionTitle}
            </Text>
            <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.verticalDivider} />
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteHistoryItem(item.id)}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkOrange} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.darkOrange, Colors.primaryOrange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientHeader, { paddingTop: insets.top + 10 }]}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userNameText}>{userName} 👋</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                activeOpacity={0.8}
                style={styles.profileContainer}
              >
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.profileImage}
                    onError={(e) =>
                      console.log("Image Load Error:", e.nativeEvent.error)
                    }
                  />
                ) : (
                  <View
                    style={[styles.profileImage, styles.profilePlaceholder]}
                  >
                    <Feather
                      name="user"
                      size={20}
                      color={Colors.primaryOrange}
                    />
                  </View>
                )}
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.contentBody}>
          {/* Only show Quick Actions title and card if there is NO recent scan */}
          {history.length === 0 && (
            <>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              {renderActionCard()}
              <View style={styles.noHistoryMsgBox}>
                <MaterialCommunityIcons
                  name="history"
                  size={32}
                  color={Colors.primaryOrange}
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.noHistoryText}>
                  No recent scans yet. Start your first scan!
                </Text>
              </View>
            </>
          )}

          {history.length > 0 && (
            <View style={{ marginTop: 25 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Scans</Text>
              </View>
              {history.map(renderHistoryItem)}
            </View>
          )}

          <View style={styles.tipCard}>
            <View style={styles.tipTextObj}>
              <Text style={styles.tipTitle}>Did you know?</Text>
              <Text style={styles.tipBody}>
                Regular brushing helps remove dirt and spreads natural oils on
                your pet&apos;s coat.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={40}
              color={Colors.primaryOrange}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  userNameText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
  },
  profileContainer: {
    position: "relative",
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  profilePlaceholder: {
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF5252",
    borderWidth: 2,
    borderColor: Colors.darkOrange,
  },
  searchWrapper: {
    marginTop: -28,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    height: "100%",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderColor,
    marginHorizontal: 10,
  },
  contentBody: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionCardContainer: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  actionCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  bgIcon: {
    position: "absolute",
    right: -40,
    bottom: -40,
    transform: [{ rotate: "-15deg" }],
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.lightOrange,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(247, 146, 74, 0.2)",
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  startButton: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
    marginRight: 8,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  tipTextObj: {
    flex: 1,
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primaryOrange,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  tipBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  historyCardWrapper: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: "hidden",
    height: 80,
    alignItems: "center",
  },
  historyCardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    height: "100%",
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
    justifyContent: "center",
  },
  historyPetName: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  historyCondition: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  historyThumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  noHistoryMsgBox: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
    padding: 16,
    backgroundColor: "#FFF8F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE0C2",
  },
  noHistoryText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  verticalDivider: {
    width: 1,
    height: "60%",
    backgroundColor: Colors.borderColor,
  },
  deleteAction: {
    width: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
});

export default HomeScreen;
