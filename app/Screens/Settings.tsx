import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Added Import
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';

// --- Constants ---
const Colors = {
  primary: '#F79C4E',       // DermaPaw Orange
  primaryDark: '#E88631',   // Deeper Orange for gradient
  primaryLight: '#FFF0E0',  // Light Orange for Icon Backgrounds
  background: '#F8F9FA',    // Very light grey/white for the whole screen
  card: '#FFFFFF',          // White for cards
  textDark: '#2D3436',      // Strong dark text
  textGrey: '#636E72',      // Muted text
  danger: '#FF6B6B',        // Red for logout
  shadow: '#000000',
  border: '#F0F0F0',
};



// --- TYPE DEFINITIONS (THIS IS THE FIX) ---

// 1. Define the shape of a single item in our settings list
type SettingsItem = {
  subtitle: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap; 
};

type SettingsSectionProps = {
  sectionTitle: string;
  items: SettingsItem[];
};

// --- Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeaderTitle}>{title}</Text>
);

const SettingsItemRow = ({ item, isLast }: { item: SettingsItem; isLast: boolean }) => (
  <TouchableOpacity 
    style={[styles.row, isLast && styles.rowLast]} 
    onPress={item.onPress}
    activeOpacity={0.7}
  >
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{item.subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color={Colors.textGrey} />
  </TouchableOpacity>
);

const SettingsCard: React.FC<SettingsSectionProps> = ({ sectionTitle, items }) => (
  <View style={styles.sectionWrapper}>
    <SectionHeader title={sectionTitle} />
    <View style={styles.card}>
      {items.map((item, index) => (
        <SettingsItemRow 
          key={index} 
          item={item} 
          isLast={index === items.length - 1} 
        />
      ))}
    </View>
  </View>
);

// --- Main Screen ---
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

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* 1. Gradient Header (Straight Rectangle) */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.headerContainer, { paddingTop: insets.top + 5 }]}
        >
          {/* Decorative Stickers */}
          <View style={styles.stickerContainer}>
            <MaterialCommunityIcons name="paw" size={120} color="rgba(255,255,255,0.15)" style={[styles.sticker, { top: -20, right: -30, transform: [{ rotate: '25deg' }] }]} />
            <MaterialCommunityIcons name="bone" size={80} color="rgba(255,255,255,0.15)" style={[styles.sticker, { bottom: 10, left: 10, transform: [{ rotate: '-45deg' }] }]} />
          </View>

          {/* Header Content - Moved UP */}
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 40 }} /> 
          </View>
        </LinearGradient>

        {/* 2. Rounded Body Section */}
        <View style={styles.contentBody}>
          
          {/* 3. Floating Profile Card (Slides up over gradient) */}
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarContainer}>
                {profileImageUrl ? (
                  <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Feather name="user" size={32} color={Colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.profileTexts}>
                <Text style={styles.profileName}>
                  {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user ? user.email : 'Sign in to sync data'}
                </Text>
                <TouchableOpacity style={styles.editProfileButton} onPress={() => router.back()}>
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 4. Settings Sections */}
          <View style={{ paddingHorizontal: 20 }}>

            <SettingsCard
              sectionTitle="PRIVACY & DATA"
              items={[
                { subtitle: 'Privacy Policy', onPress: () => router.push('/Screens/settings/PrivacyPolicy' as any) },
              ]}
            />

            <SettingsCard
              sectionTitle="SUPPORT"
              items={[
                { subtitle: 'About', onPress: () => router.push('/Screens/settings/AboutUs' as any) },
                { subtitle: 'FAQ & Help', onPress: () => router.push('/Screens/settings/FAQ' as any) },
              ]}
            />

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Feather name="log-out" size={20} color={Colors.danger} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>App Version 1.0.2</Text>
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </View>
      </ScrollView>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background, // Background matches gradient start for overscroll
  },
  headerContainer: {
    paddingBottom: 70, // Height to allow contentBody overlap
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  stickerContainer: {
    ...StyleSheet.absoluteFillObject, 
    zIndex: 0, 
  },
  sticker: {
    position: 'absolute',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 30, // Space below text inside the orange
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // New Content Body Container
  contentBody: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -40, // Overlap effect
    zIndex: 2,
    minHeight: 600, 
  },
  
  // Profile Card Styles (Adjusted for overlap)
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    marginTop: -30, // Pull it even higher into the orange
    marginBottom: 25,
    marginHorizontal: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textGrey,
    marginBottom: 8,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  editProfileText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Settings Section Styles
  sectionWrapper: {
    marginBottom: 25,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B0B0B0',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '500',
  },
  
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#CCC',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default SettingsScreen;