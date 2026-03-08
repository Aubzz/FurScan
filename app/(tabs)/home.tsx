import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";
import { getToken } from "../../utils/tokenStorage";

interface Scan {
  id: string;
  pet_name: string;
  pet_breed: string;
  pet_age: string;
  diagnosis_name: string;
  severity_level: string;
  ai_results: any;
  user_symptoms: any;
  image_uri: string;
  created_at: string;
}

const Colors = {
  background: "#FBFBFB",
  primaryOrange: "#F7924A",
  lightOrange: "#FDEFE5",
  textPrimary: "#1A1A1A",
  textSecondary: "#757575",
  white: "#FFFFFF",
  borderColor: "#FADCC8",
  shadow: "#000",
};

const StartScreen = () => {
  const { user, token: authToken } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasLoadedHistoryOnce, setHasLoadedHistoryOnce] = useState(false);
  const [latestProfileImagePath, setLatestProfileImagePath] = useState<
    string | null
  >(null);

  const swipeableRefs = useRef(new Map<string, Swipeable>());

  const fetchHistory = async (
    isRefreshing = false,
    showInitialLoader = false,
  ) => {
    if (!user) return;
    if (showInitialLoader) setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const firstName = user.firstName || user.first_name || "";
      const lastName = user.lastName || user.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const historyKey = fullName || user.email;

      if (!historyKey) {
        setScans([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/get-history/${encodeURIComponent(historyKey)}`,
        { signal: controller.signal },
      );

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `History fetch failed (${response.status}): ${errorBody.slice(0, 120)}`,
        );
      }

      if (!contentType.includes("application/json")) {
        const unexpectedBody = await response.text();
        throw new Error(
          `Expected JSON but received ${contentType || "unknown content-type"}: ${unexpectedBody.slice(0, 120)}`,
        );
      }

      const data = await response.json();

      if (data.success) {
        setScans(Array.isArray(data.history) ? data.history : []);
      } else {
        setScans([]);
      }
    } catch (error) {
      const isAbortError =
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.toLowerCase().includes("aborted"));

      if (!isAbortError) {
        console.error("Fetch history error:", error);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setRefreshing(false);
      setHasLoadedHistoryOnce(true);
    }
  };

  const fetchLatestProfileImagePath = useCallback(async () => {
    try {
      const token = authToken ?? (await getToken());
      if (!token) return;

      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return;

      const profile = await response.json();
      setLatestProfileImagePath(profile.profile_image_path || null);
    } catch (error) {
      console.error("Fetch profile image path error:", error);
    }
  }, [authToken]);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) =>
      scan.pet_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, scans]);

  const confirmDelete = (scanId: string, petName: string) => {
    Alert.alert(
      "Delete Scan",
      `Are you sure you want to remove ${petName}'s scan?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            const row = swipeableRefs.current.get(scanId);
            if (row) {
              row.close();
            }
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteScan(scanId),
        },
      ],
    );
  };

  const deleteScan = async (scanId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/delete-scan/${scanId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Delete endpoint returned non-JSON response");
      }

      const data = await response.json();
      if (data.success) {
        setScans((prev) => prev.filter((s) => s.id !== scanId));
        swipeableRefs.current.delete(scanId);
      }
    } catch (error) {
      Alert.alert("Error", "Could not delete scan.");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true, false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory(false, !hasLoadedHistoryOnce);
      fetchLatestProfileImagePath();
    }, [user, hasLoadedHistoryOnce, fetchLatestProfileImagePath]),
  );

  const getProfileImageUrl = () => {
    const path =
      latestProfileImagePath ||
      user?.profileImagePath ||
      user?.profile_image_path;
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_URL}/${normalizedPath}`;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primaryOrange}
            />
          }
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.logoText}>FurScan</Text>
              <Text style={styles.subHeaderText}>
                Welcome, {user?.firstName || user?.first_name || "Explorer"}!
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(tabs)/profile")}
              >
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.profileImage,
                      styles.profileImagePlaceholder,
                    ]}
                  >
                    <Feather
                      name="user"
                      size={20}
                      color={Colors.primaryOrange}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search by pet name..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Scans</Text>
          </View>

          <View style={styles.historyContainer}>
            {isLoading ? (
              <ActivityIndicator
                color={Colors.primaryOrange}
                size="large"
                style={{ marginTop: 40 }}
              />
            ) : filteredScans.length > 0 ? (
              filteredScans.map((scan) => (
                <Swipeable
                  key={scan.id}
                  ref={(ref) => {
                    if (ref) {
                      swipeableRefs.current.set(scan.id, ref);
                    }
                  }}
                  containerStyle={styles.swipeableContainer}
                  renderRightActions={() => (
                    <TouchableOpacity
                      style={styles.deleteSwipeButton}
                      onPress={() => confirmDelete(scan.id, scan.pet_name)}
                    >
                      <Feather name="trash-2" size={24} color={Colors.white} />
                      <Text style={styles.deleteSwipeText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                >
                  <TouchableOpacity
                    style={styles.historyListItem}
                    onPress={() =>
                      router.push({
                        pathname: "/Screens/DiagnosisReportScreen",
                        params: {
                          condition: scan.diagnosis_name,
                          petName: scan.pet_name,
                          petBreed: scan.pet_breed,
                          petAge: scan.pet_age,
                          imageUri: scan.image_uri,
                          allResults: JSON.stringify(scan.ai_results),
                          summary: JSON.stringify(scan.user_symptoms),
                          isReadOnly: "true",
                        },
                      })
                    }
                  >
                    <View style={styles.historyListItemLeft}>
                      <View style={styles.historyIconWrapper}>
                        {scan.image_uri ? (
                          <Image
                            source={{ uri: scan.image_uri }}
                            style={styles.historyScanImage}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="paw"
                            size={24}
                            color={Colors.primaryOrange}
                          />
                        )}
                      </View>
                      <View>
                        <Text style={styles.scanPetName}>{scan.pet_name}</Text>
                        <Text style={styles.scanDate}>
                          {new Date(scan.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyListItemRight}>
                      <Text
                        style={[
                          styles.scanSeverity,
                          {
                            color:
                              scan.severity_level === "high"
                                ? "#D9534F"
                                : Colors.primaryOrange,
                          },
                        ]}
                      >
                        {scan.diagnosis_name}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.primaryOrange}
                      />
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              ))
            ) : (
              <View style={styles.emptyStateWrapper}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name={searchQuery ? "magnify-close" : "paw-off"}
                    size={70}
                    color={Colors.primaryOrange}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? "No results found" : "No current scans found"}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? `We couldn't find any scans for "${searchQuery}".`
                    : "Your pet's health journey starts with a single scan. Swipe down to refresh!"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primaryOrange,
    letterSpacing: -0.5,
  },
  subHeaderText: { fontSize: 14, color: Colors.textSecondary, marginTop: -2 },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.lightOrange,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileImagePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightOrange,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  historyTitle: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary },
  historyContainer: { flex: 1 },

  swipeableContainer: {
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: "#FF3B30",
  },
  deleteSwipeButton: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  deleteSwipeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  historyListItem: {
    backgroundColor: "#FFF9F5",
    padding: 12,
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FADCC8",
    elevation: 3,
    shadowColor: Colors.primaryOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyListItemLeft: { flexDirection: "row", alignItems: "center" },
  historyIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FADCC8",
  },
  historyScanImage: { width: "100%", height: "100%" },
  scanPetName: { fontSize: 16, fontWeight: "700", color: "#4A2C15" },
  scanDate: { fontSize: 12, color: "#A07E66", marginTop: 2 },
  historyListItemRight: { flexDirection: "row", alignItems: "center" },
  scanSeverity: { fontSize: 12, fontWeight: "bold", marginRight: 8 },

  emptyStateWrapper: {
    alignItems: "center",
    marginTop: 130,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightOrange,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default StartScreen;
