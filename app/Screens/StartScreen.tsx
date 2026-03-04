import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // Added useRouter
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const Colors = {
  background: "#FFFFFF",
  primaryOrange: "#F7924A",
  lightOrange: "#FDEFE5",
  textPrimary: "#333333",
  textSecondary: "#888888",
  white: "#FFFFFF",
  borderColor: "#E0E0E0",
};

const HomeScreen = () => {
  const user = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter(); // Initialize the router

  const getProfileImageUrl = () => {
    const path = user.profileImagePath as string;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Furemedy</Text>
          <TouchableOpacity onPress={() => console.log("Profile Tapped")}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[styles.profileImage, styles.profileImagePlaceholder]}
              >
                <Feather name="user" size={24} color={Colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            placeholder="Search here"
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.myPetsHeader}>
          <Text style={styles.myPetsTitle}>My Pets</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="paw"
            size={80}
            color={Colors.primaryOrange}
          />
          <Text style={styles.emptyStateText}>
            No pets found. Tap + to add one now.
          </Text>
        </View>
      </View>

      {/* Navigation Bar */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons
            name="paw"
            size={26}
            color={Colors.primaryOrange}
          />
          <Text style={[styles.navText, styles.navTextActive]}>My Pets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={26}
            color={Colors.textSecondary}
          />
          <Text style={styles.navText}>Chatbot</Text>
        </TouchableOpacity>

        {/* Spacer for Floating Button */}
        <View style={styles.navButton} />

        <TouchableOpacity style={styles.navButton}>
          <Feather name="search" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Feather name="user" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        {/* FIXED: The scan button now navigates to the ScanScreen */}
        <TouchableOpacity
          style={[styles.scanButton, { bottom: 25 + insets.bottom }]}
          onPress={() => router.push("/Screens/PetInfoScreen" as any)}
        >
          <Ionicons
            name="scan-outline"
            size={30}
            color={Colors.primaryOrange}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... (Styles remain the same as your provided code)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  logoText: { fontSize: 32, fontWeight: "bold", color: Colors.primaryOrange },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightOrange,
  },
  profileImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightOrange,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  myPetsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  myPetsTitle: { fontSize: 22, fontWeight: "bold", color: Colors.textPrimary },
  addButton: {
    backgroundColor: Colors.primaryOrange,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  navBar: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: Colors.white,
  },
  navButton: { flex: 1, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  navTextActive: { color: Colors.primaryOrange, fontWeight: "bold" },
  scanButton: {
    position: "absolute",
    left: "50%",
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: Colors.lightOrange,
    borderWidth: 6,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
