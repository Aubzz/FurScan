import { Stack } from "expo-router";
import React from "react";
import { AssessmentProvider } from "../contexts/AssessmentContext"; // 1. Import AssessmentProvider
import { AuthProvider } from "../contexts/AuthContext";

/**
 * This is the root layout for the entire app.
 * All other screens and navigators are nested inside this.
 */
export default function RootLayout() {
  return (
    // 2. Wrap everything with AuthProvider
    <AuthProvider>
      {/* 3. Wrap everything with AssessmentProvider so screens can use useAssessment() */}
      <AssessmentProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />

          {/* Auth Screens */}
          <Stack.Screen name="Screens/Login" />
          <Stack.Screen name="Screens/StartScreen" />
          <Stack.Screen name="Screens/CreateAccount" />
          <Stack.Screen name="Screens/VerifyOtp" />
          <Stack.Screen name="Screens/SetNewPassword" />
          <Stack.Screen name="Screens/ForgotPassword" />

          {/* App Screens */}
          <Stack.Screen name="Screens/Settings" />
          <Stack.Screen name="Screens/PetInfoScreen" />
          <Stack.Screen name="Screens/PhotoTipsScreen" />
          <Stack.Screen name="Screens/ScanScreen" />
          <Stack.Screen name="Screens/ResultScreen" />
          <Stack.Screen name="Screens/TellMeMoreScreen" />
          <Stack.Screen name="Screens/DiagnosisReportScreen" />
        </Stack>
      </AssessmentProvider>
    </AuthProvider>
  );
}
