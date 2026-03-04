import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  lightOrange: '#FDEFE5',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
};

const API_URL = Platform.select({
  web: 'http://localhost:8080',
  default: 'http://10.151.237.144:8080', // IMPORTANT: Replace with your computer's IP
});

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getProfileImageUrl = () => {
    if (!user) {
      return null;
    }
    const path = user.profile_image_path || user.profileImagePath;
    if (!path) {
      return null;
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  const profileImageUrl = getProfileImageUrl();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Furemedy</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Feather name="user" size={24} color={Colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            placeholder="Search here"
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        {/* My Pets Header Section */}
        <View style={styles.myPetsHeader}>
          <Text style={styles.myPetsTitle}>My Pets</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => console.log('Add Pet Tapped')}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Empty State - No Pets Found */}
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="paw" size={80} color={Colors.primaryOrange} />
          <Text style={styles.emptyStateText}>
            No pets found. Tap + to add one now.
          </Text>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="paw" size={26} color={Colors.primaryOrange} />
          <Text style={[styles.navText, styles.navTextActive]}>My Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Chatbot</Text>
        </TouchableOpacity>
        
        <View style={styles.navButton} />

        <TouchableOpacity style={styles.navButton}>
          <Feather name="search" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/profile')}>
          <Feather name="user" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.scanButton, { bottom: 25 + insets.bottom }]}>
          <Ionicons name="scan-outline" size={30} color={Colors.primaryOrange} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // --- THIS IS THE MODIFICATION ---
        paddingTop: 10, // Add this line to create space above the header
        paddingBottom: 20,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primaryOrange,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightOrange,
    },
    profileImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    myPetsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    addButton: {
        backgroundColor: Colors.primaryOrange,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyStateText: {
        marginTop: 15,
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    navBar: {
        flexDirection: 'row',
        height: 70,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: Colors.white,
    },
    navButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    navTextActive: {
        color: Colors.primaryOrange,
        fontWeight: 'bold',
    },
    scanButton: {
        position: 'absolute',
        left: '50%',
        marginLeft: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        borderColor: Colors.lightOrange,
        borderWidth: 6,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;