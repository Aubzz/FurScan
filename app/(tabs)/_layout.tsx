// In app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { AuthProvider } from '../../contexts/AuthContext';
// 1. Import GestureHandlerRootView

/**
 * This is the root layout for the entire app.
 * All other screens and navigators are nested inside this.
 */
export default function RootLayout() {
  return (
    // 2. Wrap the entire app with GestureHandlerRootView and apply flex: 1
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack
          // A common practice is to hide the default header at the root level,
          // as individual screens or nested layouts (like your tabs) will manage their own headers.
          screenOptions={{
            headerShown: false, 
          }}
        >
          {/* Define your main app screens/layouts here. */}

          {/* This refers to the layout defined in 'app/(tabs)/_layout.tsx' */}
          <Stack.Screen name="(tabs)" />

          {/* These refer to your individual screens */}
          <Stack.Screen name="Screens/Login" />
          <Stack.Screen name="Screens/StartScreen" />
          <Stack.Screen name="Screens/CreateAccount" />
          <Stack.Screen name="Screens/VerifyOtp" />
          <Stack.Screen name="Screens/SetNewPassword" />
          <Stack.Screen name="Screens/ForgotPassword" />
          <Stack.Screen name="Screens/Settings" />
          <Stack.Screen name="Screens/Signup" />
          <Stack.Screen name="Screens/PetInfoScreen" />
          <Stack.Screen name="Screens/ScanScreen" />
          <Stack.Screen name="Screens/UploadImageScreen" />
          <Stack.Screen name="Screens/ResultsScreen" />
          <Stack.Screen name="Screens/TellMeMoreScreen" />
          
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}