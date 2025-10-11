import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

// --- Constants ---
const Colors = {
  background: '#FFFFFF',
  headerBackground: '#F79C4E',
  textPrimary: '#000000',
  textSecondary: '#6c757d',
  white: '#FFFFFF',
  separator: '#EFEFEF',
  arrow: '#adb5bd',
};

const API_URL = Platform.select({
  web: 'http://localhost:8080',
  default: 'http://10.151.237.144:8080', // Replace with your IP
});

// --- TYPE DEFINITIONS (THIS IS THE FIX) ---

// 1. Define the shape of a single item in our settings list
type SettingsItem = {
  subtitle: string;
  onPress: () => void; // A function that takes no arguments and returns nothing
};

// 2. Define the shape of the props for the SettingsSection component
type SettingsSectionProps = {
  // Use `keyof typeof Feather.glyphMap` for perfect icon name autocompletion and safety
  iconName: keyof typeof Feather.glyphMap; 
  sectionTitle: string;
  items: SettingsItem[]; // An array of the SettingsItem type we defined above
};

// --- Reusable Section Component ---
// 3. Apply the types to the component's props
const SettingsSection: React.FC<SettingsSectionProps> = ({ iconName, sectionTitle, items }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Feather name={iconName} size={22} color={Colors.textPrimary} />
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
    </View>
    {/* TypeScript now knows that `item` is of type `SettingsItem` and `index` is a number */}
    {items.map((item, index) => (
      <TouchableOpacity key={index} style={styles.row} onPress={item.onPress}>
        <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
        <Feather name="chevron-right" size={22} color={Colors.arrow} />
      </TouchableOpacity>
    ))}
  </View>
);

// --- Main Screen Component (No changes needed here) ---
const SettingsScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const getProfileImageUrl = () => {
    if (!user) return null;
    const path = user.profile_image_path || user.profileImagePath;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  const profileImageUrl = getProfileImageUrl();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="chevron-left" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Feather name="user" size={40} color={Colors.textSecondary} />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
                <Ionicons name="camera-outline" size={16} color={Colors.textSecondary} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileNameContainer}>
              <Text style={styles.profileName}>{user ? `${user.first_name} ${user.last_name}` : 'Guest User'}</Text>
              <TouchableOpacity>
                <Feather name="edit-2" size={16} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileEmail}>{user ? user.email : 'No email available'}</Text>
          </View>
        </View>

        <View style={styles.settingsList}>
          <SettingsSection
            iconName="bell"
            sectionTitle="Notification"
            items={[
              { subtitle: 'Enable/Disable Reminders', onPress: () => {} },
              { subtitle: 'Pet Health Tips', onPress: () => {} },
            ]}
          />
          <View style={styles.separator} />

          <SettingsSection
            iconName="maximize"
            sectionTitle="Detection History"
            items={[
              { subtitle: 'View Past Scans', onPress: () => {} },
              { subtitle: 'Export Image', onPress: () => {} },
            ]}
          />
          <View style={styles.separator} />
          
          <SettingsSection
            iconName="lock"
            sectionTitle="Privacy"
            items={[
              { subtitle: 'Clear History', onPress: () => {} },
              { subtitle: 'Manage Data', onPress: () => {} },
            ]}
          />
          <View style={styles.separator} />

          <SettingsSection
            iconName="headphones"
            sectionTitle="About & Support"
            items={[
              { subtitle: 'About Us', onPress: () => {} },
              { subtitle: 'FAQ & Help Center', onPress: () => {} },
            ]}
          />
          <View style={styles.separator} />

          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Feather name="log-out" size={22} color={Colors.headerBackground} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles (No changes needed here) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.headerBackground, paddingHorizontal: 10, paddingBottom: 15, },
  headerButton: { width: 40, alignItems: 'center', },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: 'bold', },
  scrollContent: { paddingBottom: 30, },
  profileSection: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: Colors.white, },
  profileImageContainer: { marginRight: 15, },
  profileImage: { width: 70, height: 70, borderRadius: 35, },
  profileImagePlaceholder: { backgroundColor: Colors.separator, justifyContent: 'center', alignItems: 'center', },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#e9ecef', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white, },
  profileInfo: { flex: 1, },
  profileNameContainer: { flexDirection: 'row', alignItems: 'center', },
  profileName: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, },
  profileEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, },
  settingsList: { marginTop: 10, },
  sectionContainer: { backgroundColor: Colors.white, paddingHorizontal: 20, paddingTop: 15, },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginLeft: 10, },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 32, paddingVertical: 15, },
  rowSubtitle: { flex: 1, fontSize: 14, color: Colors.textSecondary, },
  separator: { height: 10, backgroundColor: '#f8f9fa', },
  logoutRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 15, marginTop: 10, },
  logoutText: { fontSize: 16, color: Colors.headerBackground, fontWeight: 'bold', marginLeft: 10, },
});

export default SettingsScreen;