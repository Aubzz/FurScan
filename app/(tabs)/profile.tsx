import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// Updated import to use the recommended library
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getToken, removeToken } from '../../utils/tokenStorage';

const API_URL = Platform.select({
  web: 'http://localhost:8080',
  default: 'http://10.151.237.144:8080', // Replace with your IP
});

const Colors = {
  background: '#F79C4E',
  white: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#888888',
  lightOrange: '#FFF6EE',
  separator: '#EFEFEF',
  lightGray: '#F5F5F5',
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
  const [error, setError] = useState<string | null>(null);
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
  const [aboutMeInput, setAboutMeInput] = useState('');

  useEffect(() => {
    if (profile) {
      setAboutMeInput(profile.about_me || '');
    }
  }, [profile]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/Screens/Login');
        return;
      }
      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { await removeToken(); router.replace('/Screens/Login'); }
        throw new Error('Failed to fetch profile data.');
      }
      const data: UserProfile = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const handleEditToggle = () => {
    setIsEditingAboutMe(!isEditingAboutMe);
    if (isEditingAboutMe && profile) {
      setAboutMeInput(profile.about_me || '');
    }
  };

  const handleSaveAboutMe = async () => {
    console.log("Saving 'About Me':", aboutMeInput);
    if (profile) {
      setProfile({ ...profile, about_me: aboutMeInput });
    }
    setIsEditingAboutMe(false);
  };

  const getProfileImageUrl = () => {
    if (!profile?.profile_image_path) return null;
    const path = profile.profile_image_path;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.background} /></View>;
  if (error) return <View style={styles.centered}><Text>Error: {error}</Text><TouchableOpacity onPress={fetchProfile}><Text style={{ color: Colors.background }}>Try Again</Text></TouchableOpacity></View>;
  if (!profile) return <View style={styles.centered}><Text>No profile data found.</Text></View>;
  
  const profileImageUrl = getProfileImageUrl();

  return (
    // The paddingTop from insets is now applied to the container, not the header
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
           <TouchableOpacity onPress={() => router.push('/Screens/Settings')}><Feather name="settings" size={24} color={Colors.white} /></TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.profileImageContainer}>{profileImageUrl ? <Image source={{ uri: profileImageUrl }} style={styles.profileImage} /> : <View style={[styles.profileImage, styles.profileImagePlaceholder]}><Feather name="user" size={60} color={Colors.textSecondary} /></View>}<View style={styles.cameraIconContainer}><Ionicons name="camera-outline" size={16} color={Colors.textSecondary} /></View></View>
          <View style={styles.profileInfo}><View style={styles.nameContainer}><Text style={styles.profileName}>{`${profile.first_name} ${profile.last_name}`}</Text><TouchableOpacity><Feather name="edit-2" size={16} color={Colors.textSecondary} style={{ marginLeft: 8 }} /></TouchableOpacity></View><Text style={styles.profileHandle}>@{profile.email.split('@')[0]}</Text></View>
          <View style={styles.detailsSection}><Text style={styles.sectionTitle}>Owner Information</Text><View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{`${profile.first_name} ${profile.last_name}`}</Text></View><View style={styles.separator} /><View style={styles.infoRow}><Text style={styles.infoLabel}>Email Address</Text><Text style={styles.infoValue}>{profile.email}</Text></View><View style={styles.separator} /><View style={styles.infoRow}><Text style={styles.infoLabel}>Mobile Number</Text><Text style={styles.infoValue}>{profile.mobile_number || 'Not provided'}</Text></View></View>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About me</Text>
            <View style={styles.corgiContainer}><Image source={require('../../assets/images/corgis.png')} style={styles.corgiImage} /></View>
            <View style={styles.aboutBox}>
              {isEditingAboutMe ? (
                <>
                  <TextInput
                    style={styles.aboutTextInput}
                    value={aboutMeInput}
                    onChangeText={setAboutMeInput}
                    placeholder="Tell us a little about yourself..."
                    multiline
                    autoFocus
                  />
                  <View style={styles.editActionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleEditToggle}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSaveAboutMe}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.aboutText}>
                    {profile.about_me || 'No information provided.'}
                  </Text>
                  <TouchableOpacity style={styles.editIcon} onPress={handleEditToggle}>
                    <Feather name={profile.about_me ? "edit-2" : "plus-circle"} size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  scrollViewContent: { flexGrow: 1 },
  // --- MODIFICATION START ---
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: Colors.background,
    // Add this line to create space above the header content
    paddingTop: 25, 
  },
  // --- MODIFICATION END ---
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.white },
  contentContainer: { flex: 1, paddingBottom: 30, backgroundColor: Colors.white, borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: 60, paddingTop: 80, paddingHorizontal: 20, alignItems: 'center' },
  profileImageContainer: { position: 'absolute', top: -60, alignSelf: 'center' },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: Colors.white },
  profileImagePlaceholder: { backgroundColor: Colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  cameraIconContainer: { position: 'absolute', bottom: 5, right: 5, backgroundColor: Colors.lightGray, borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
  profileInfo: { alignItems: 'center', marginBottom: 25 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  profileHandle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  detailsSection: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  infoRow: { paddingVertical: 12 },
  infoLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 4 },
  infoValue: { color: Colors.textPrimary, fontSize: 16 },
  separator: { height: 1, backgroundColor: Colors.separator },
  aboutSection: { width: '100%' },
  aboutTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10, width: '100%' },
  corgiContainer: { alignSelf: 'flex-end', zIndex: 1 },
  corgiImage: { width: 173, height: 50, resizeMode: 'contain' },
  aboutBox: {
    backgroundColor: Colors.lightOrange,
    borderRadius: 15,
    padding: 20,
    paddingTop: 30,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  aboutText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  editIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  aboutTextInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    textAlignVertical: 'top',
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: Colors.background,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  }
});

export default ProfileScreen;