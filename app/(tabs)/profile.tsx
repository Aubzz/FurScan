import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView, // Import this
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";
import { getToken, removeToken } from "../../utils/tokenStorage";

// --- Theme Constants ---
const Colors = {
  primary: "#F79C4E",
  primaryDark: "#E88631",
  primaryLight: "#FFF6EE",
  background: "#F8F9FA",
  card: "#FFFFFF",
  textDark: "#2D3436",
  textGrey: "#636E72",
  shadow: "#000000",
  white: "#FFFFFF",
  border: "#F0F0F0",
};

type UserProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  profile_image_path: string | null;
  about_me: string | null;
};

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
  const [aboutMeInput, setAboutMeInput] = useState("");

  useEffect(() => {
    if (profile) {
      setAboutMeInput(profile.about_me || "");
    }
  }, [profile]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/Screens/Login");
        return;
      }
      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await removeToken();
          router.replace("/Screens/Login");
        }
        throw new Error("Failed to fetch profile data.");
      }

      const data: UserProfile = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const handleSaveAboutMe = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ about_me: aboutMeInput }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData);
        setIsEditingAboutMe(false);
        if (Platform.OS !== "web") Alert.alert("Success", "Profile updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pickAndUploadImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need access to your photos.");
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && profile) {
      const selectedImage = result.assets[0];
      setIsUploading(true);

      const formData = new FormData();
      const fileToUpload = {
        uri: selectedImage.uri,
        type: "image/jpeg",
        name: `profile_${profile.id}.jpg`,
      } as any;

      formData.append("profileImage", fileToUpload);

      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/api/profile/upload-image`, {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        if (
          response.ok &&
          contentType &&
          contentType.includes("application/json")
        ) {
          const data = await response.json();
          setProfile({
            ...profile,
            profile_image_path: data.profile_image_path,
          });
          if (Platform.OS !== "web") Alert.alert("Success", "Picture updated!");
        }
      } catch (error) {
        console.error("Network upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getProfileImageUrl = () => {
    if (!profile?.profile_image_path) return null;
    const path = profile.profile_image_path;
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  if (error)
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
        <TouchableOpacity onPress={fetchProfile}>
          <Text style={{ color: Colors.primary }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  if (!profile)
    return (
      <View style={styles.centered}>
        <Text>No profile data found.</Text>
      </View>
    );

  const profileImageUrl = getProfileImageUrl();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset helps handle strict nav bar heights or status bars
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.mainContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primaryDark}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled" // Important for ensuring taps work when keyboard is up
        >
          {/* --- 1. Orange Gradient Header (Straight Rectangle) --- */}
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.headerContainer, { paddingTop: insets.top + 5 }]}
          >
            {/* Background Stickers */}
            <View style={styles.stickerContainer}>
              <MaterialCommunityIcons
                name="paw"
                size={140}
                color="rgba(255,255,255,0.15)"
                style={[
                  styles.sticker,
                  { top: -40, left: -20, transform: [{ rotate: "-20deg" }] },
                ]}
              />
              <MaterialCommunityIcons
                name="bone"
                size={80}
                color="rgba(255,255,255,0.15)"
                style={[
                  styles.sticker,
                  { bottom: 20, right: 10, transform: [{ rotate: "45deg" }] },
                ]}
              />
            </View>

            {/* Header Content */}
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <TouchableOpacity
                onPress={() => router.push("/Screens/Settings")}
                style={styles.settingsButton}
              >
                <Feather name="settings" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* --- 2. Rounded Body Section --- */}
          <View style={styles.contentBody}>
            {/* Floating Profile Image Card */}
            <View style={styles.profileHeaderCard}>
              <View style={styles.imageWrapper}>
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
                    <Feather name="user" size={60} color={Colors.textGrey} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={pickAndUploadImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Ionicons name="camera" size={20} color={Colors.white} />
                  )}
                </TouchableOpacity>
              </View>

              <Text
                style={styles.nameText}
              >{`${profile.first_name} ${profile.last_name}`}</Text>
              <Text style={styles.handleText}>
                @{profile.email.split("@")[0]}
              </Text>
            </View>

            {/* Owner Information Card */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>OWNER DETAILS</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <Feather name="user" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Full Name</Text>
                    <Text
                      style={styles.infoValue}
                    >{`${profile.first_name} ${profile.last_name}`}</Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <Feather name="mail" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <Feather
                      name="smartphone"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Mobile</Text>
                    <Text style={styles.infoValue}>
                      {profile.mobile_number || "Not set"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* About Me Section (With Corgi) */}
            <View style={styles.aboutSection}>
              <View style={styles.corgiWrapper}>
                <Image
                  source={require("../../assets/images/corgis.png")}
                  style={styles.corgiImage}
                />
              </View>

              <View style={styles.aboutCard}>
                <View style={styles.aboutHeader}>
                  <Text style={styles.aboutTitle}>About Me</Text>
                  {!isEditingAboutMe && (
                    <TouchableOpacity onPress={() => setIsEditingAboutMe(true)}>
                      <Feather
                        name="edit-2"
                        size={18}
                        color={Colors.textGrey}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {isEditingAboutMe ? (
                  <View>
                    <TextInput
                      style={styles.textInput}
                      value={aboutMeInput}
                      onChangeText={setAboutMeInput}
                      placeholder="Write something..."
                      multiline
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        onPress={() => setIsEditingAboutMe(false)}
                        style={styles.cancelBtn}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSaveAboutMe}
                        style={styles.saveBtn}
                      >
                        <Text style={styles.saveText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.aboutBody}>
                    {profile.about_me ||
                      "Tell us a bit about yourself and your furry friends!"}
                  </Text>
                )}
              </View>
            </View>

            {/* Bottom Spacer */}
            <View style={{ height: 250 }} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.primaryDark },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  headerContainer: {
    paddingBottom: 80,
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
  },
  stickerContainer: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  sticker: { position: "absolute" },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 0,
    paddingBottom: 35, // Balanced spacing
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  settingsButton: {
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  scrollContent: {
    flexGrow: 1,
  },

  contentBody: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -40,
    zIndex: 2,
  },

  profileHeaderCard: {
    marginTop: -70,
    alignItems: "center",
    marginBottom: 25,
    marginHorizontal: 20,
    zIndex: 10,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 70,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: Colors.white,
    backgroundColor: Colors.primaryLight,
  },
  profileImagePlaceholder: { justifyContent: "center", alignItems: "center" },
  cameraBtn: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    elevation: 5,
  },
  nameText: { fontSize: 26, fontWeight: "bold", color: Colors.textDark },
  handleText: {
    fontSize: 16,
    color: Colors.textGrey,
    marginTop: 4,
    fontWeight: "500",
  },

  sectionContainer: { marginBottom: 25, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B0B0B0",
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textGrey, marginBottom: 3 },
  infoValue: { fontSize: 16, fontWeight: "700", color: Colors.textDark },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
    marginLeft: 60,
  },

  aboutSection: { marginTop: 10, paddingHorizontal: 20 },
  corgiWrapper: {
    position: "absolute",
    top: -50,
    right: 60,
    zIndex: 20,
    elevation: 20,
  },
  corgiImage: {
    width: 110,
    height: 70,
    resizeMode: "contain",
  },
  aboutCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 24,
    padding: 20,
    paddingTop: 30,
    borderWidth: 1,
    borderColor: "rgba(247, 156, 78, 0.1)",
  },
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aboutTitle: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  aboutBody: {
    fontSize: 15,
    color: Colors.textDark,
    lineHeight: 24,
    fontStyle: "italic",
  },

  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    color: Colors.textDark,
    minHeight: 100,
    textAlignVertical: "top",
    elevation: 1,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 15, marginRight: 10 },
  cancelText: { color: Colors.textGrey, fontWeight: "600" },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    elevation: 2,
  },
  saveText: { color: Colors.white, fontWeight: "bold" },
});

export default ProfileScreen;