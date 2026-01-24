// In app/_layout.tsx


import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext'; // 1. Import your new AuthProvider

/**
 * This is the root layout for the entire app.
 * All other screens and navigators are nested inside this.
 */
export default function RootLayout() {
  return (
    // 2. Wrap the entire Stack navigator with the AuthProvider.
    // Now, every screen defined within this Stack can access the auth context.
    <AuthProvider>
      <Stack
        // A common practice is to hide the default header at the root level,
        // as individual screens or nested layouts (like your tabs) will manage their own headers.
        screenOptions={{
          headerShown: false, 
        }}

      >
        {/* 
          3. Define your main app screens/layouts here.
          The 'name' prop must match the file or directory name in the 'app' folder.
        */}

        {/* This refers to the layout defined in 'app/(tabs)/_layout.tsx' */}
        <Stack.Screen name="(tabs)" />


        {/* These refer to your individual authentication screens */}
        <Stack.Screen name="Screens/Login" />
        <Stack.Screen name="Screens/StartScreen" />
        <Stack.Screen name="Screens/CreateAccount" />
        <Stack.Screen name="Screens/VerifyOtp" />
        <Stack.Screen name="Screens/SetNewPassword" />
        <Stack.Screen name="Screens/ForgotPassword" />
        <Stack.Screen name="Screens/Settings" />
        <Stack.Screen name="Screens/AddPet" />
        <Stack.Screen name="Screens/ViewPet" />
        <Stack.Screen name="Screens/ArticleDetail" />
      </Stack>
    </AuthProvider>
  );
}