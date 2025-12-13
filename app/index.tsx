// In app/index.tsx

import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
// Make sure the path is correct based on your file structure.
// If you moved contexts to the root, it should be '../contexts/AuthContext'
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { token, isLoading } = useAuth();

  // 1. While the AuthProvider is checking for a token, show a loading spinner.
  // This prevents a screen flicker.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F79C4E" />
      </View>
    );
  }

  // 2. If a token IS found, the user is logged in. Redirect to the main app.
  if (token) {
    return <Redirect href="/home" />;
  }

  // 3. If NO token is found, the user is logged out. Redirect to the CreateAccount screen.
  // --- THIS IS THE CHANGE ---
  return <Redirect href="/Screens/scan" />;
};

export default Index;