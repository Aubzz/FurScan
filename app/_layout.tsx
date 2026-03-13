import 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash screen has already been handled.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore splash hide race conditions.
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
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
  );
}
