// In: components/CustomTabBar.tsx

import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// --- MODIFICATION 1: Import the necessary type ---
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Colors = {
  primaryOrange: '#F7924A',
  lightOrange: '#FDEFE5',
  textSecondary: '#888888',
  white: '#FFFFFF',
};
export function CustomTabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index].name;

  // Add this block to hide the bar on the chatbot screen
  if (activeRouteName === 'chatbot') {
    return null;
  }

  return (
    <View style={[styles.navBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.navBar}>
        {/* --- MODIFICATION 3: We now check activeRouteName for styling --- */}
        <Link href="/home" asChild>
          <TouchableOpacity style={styles.navButton}>
            <MaterialCommunityIcons name="paw" size={26} color={activeRouteName === 'home' ? Colors.primaryOrange : Colors.textSecondary} />
            <Text style={[styles.navText, activeRouteName === 'home' && styles.navTextActive]}>My Pets</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/chatbot" asChild>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color={activeRouteName === 'chatbot' ? Colors.primaryOrange : Colors.textSecondary} />
            <Text style={[styles.navText, activeRouteName === 'chatbot' && styles.navTextActive]}>Chatbot</Text>
          </TouchableOpacity>
        </Link>
        
        <View style={styles.navButton} />

        <Link href="/search" asChild>
          <TouchableOpacity style={styles.navButton}>
            <Feather name="search" size={26} color={activeRouteName === 'search' ? Colors.primaryOrange : Colors.textSecondary} />
            <Text style={[styles.navText, activeRouteName === 'search' && styles.navTextActive]}>Search</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.navButton}>
            <Feather name="user" size={26} color={activeRouteName === 'profile' ? Colors.primaryOrange : Colors.textSecondary} />
            <Text style={[styles.navText, activeRouteName === 'profile' && styles.navTextActive]}>Profile</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <TouchableOpacity style={[styles.scanButton, { bottom: 25 + insets.bottom }]}>
        <Ionicons name="scan-outline" size={30} color={Colors.primaryOrange} />
      </TouchableOpacity>
    </View>
  );
}

// Styles are unchanged
const styles = StyleSheet.create({
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: 'row',
    height: 60,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});