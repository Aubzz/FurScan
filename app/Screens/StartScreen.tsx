import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
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
import { useAuth } from "../../contexts/AuthContext";

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

const JS_BACKEND_URL = "http://192.168.100.4:8080";

const StartScreen = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const swipeableRefs = useRef(new Map<string, Swipeable>());

  const fetchHistory = useCallback(
    async (isRefreshing = false) => {
      if (!user) return;
      if (!isRefreshing) setIsLoading(true);

      try {
        const fullName = `${user.firstName || user.first_name} ${user.lastName || user.last_name}`;
        const response = await fetch(
          `${JS_BACKEND_URL}/api/get-history/${encodeURIComponent(fullName)}`,
        );
        const data = await response.json();

        if (data.success) {
          setScans(data.history);
        }
      } catch (error) {
        console.error("Fetch history error:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

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
      const response = await fetch(
        `${JS_BACKEND_URL}/api/delete-scan/${scanId}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      if (data.success) {
        setScans((prev) => prev.filter((s) => s.id !== scanId));
        swipeableRefs.current.delete(scanId);
      }
    } catch {
      Alert.alert("Error", "Could not delete scan.");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true);
  }, [fetchHistory]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const getProfileImageUrl = () => {
    const path = user?.profileImagePath || user?.profile_image_path;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${JS_BACKEND_URL}/${path.replace(/\\/g, "/")}`;
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
                onPress={() => router.push("./profile")}
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

        <View style={[styles.navBar, { paddingBottom: insets.bottom + 0 }]}>
          {/* LEFT SIDE: Home & Chatbot */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("#" as any)}
          >
            {/* UPDATED: Changed icon to solid 'home' and colored it primaryOrange */}
            <Ionicons name="home" size={30} color={Colors.primaryOrange} />
            <Text style={[styles.navText, { color: Colors.primaryOrange }]}>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/chatbot")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={30}
              color={Colors.textSecondary}
            />
            <Text style={styles.navText}>Chatbot</Text>
          </TouchableOpacity>

          <View style={styles.navSpacer} />

          {/* RIGHT SIDE: Insights & Profile */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("#" as any)}
          >
            <Ionicons
              name="stats-chart-outline"
              size={30}
              color={Colors.textSecondary}
            />
            <Text style={styles.navText}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push("/profile")}
          >
            <Feather name="user" size={30} color={Colors.textSecondary} />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          {/* CENTER: Scan Button */}
          <TouchableOpacity
            style={[
              styles.scanButton,
              { bottom: Platform.OS === "ios" ? insets.bottom + 20 : 40 },
            ]}
            onPress={() => router.push("/Screens/PetInfoScreen")}
          >
            <View style={styles.scanInner}>
              <Ionicons name="scan-outline" size={32} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>
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
  navBar: {
    flexDirection: "row",
    height: 85,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    paddingHorizontal: 10,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  navSpacer: { width: 80 },
  navText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },
  scanButton: {
    position: "absolute",
    left: "50%",
    marginLeft: -25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    padding: 5,
    elevation: 10,
    shadowColor: Colors.primaryOrange,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  scanInner: {
    flex: 1,
    backgroundColor: Colors.primaryOrange,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StartScreen;
