import { Feather, Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

// --- Constants ---
const Colors = {
  background: "#FFFFFF",
  textPrimary: "#212529",
  textSecondary: "#6c757d",
  primaryOrange: "#F79C4E",
  inputDefaultBorder: "#E0E0E0", // A neutral gray for the default border
  error: "#D32F2F",
  white: "#FFFFFF",
};

// --- Main Screen Component ---
const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Add state to track the focused input
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "788397205962-3gd5qoead1migmabcbgmoh1pcmqhp90d.apps.googleusercontent.com",
    iosClientId:
      "788397205962-rua3cgceoc60ve5js05a19vbdtmr0oh6.apps.googleusercontent.com",
    androidClientId:
      "788397205962-8glgkjltugsou14j2ffvdcqpfkkvv648.apps.googleusercontent.com",
  });

  const sendGoogleTokenToBackend = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/social-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "google",
            token,
          }),
        });

        const data = await response.json();

        if (response.ok && data.token && data.user) {
          login(data.user, data.token);
          return;
        }

        throw new Error(data.msg || "Unable to log in with Google.");
      } catch (err: any) {
        console.error("Google social login failed:", err);
        Alert.alert(
          "Google Login Failed",
          err?.message || "An error occurred during Google Sign-In.",
        );
      }
    },
    [login],
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        sendGoogleTokenToBackend(id_token);
      }
    } else if (response?.type === "error") {
      console.error("Google Auth Error:", response.error);
      Alert.alert(
        "Authentication Failed",
        "An error occurred during Google Sign-In.",
      );
    }
  }, [response, sendGoogleTokenToBackend]);

  const handleGoogleContinue = () => {
    if (request) {
      promptAsync();
    }
  };

  const handleLoginPress = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    setError("");

    // Debugging: View exactly what is being sent in your VS Code terminal
    console.log(`[Login] Sending to: ${API_URL}/api/auth/login`);
    console.log(`[Login] Payload:`, {
      email: cleanEmail,
      password: cleanPassword,
    });

    try {
      // 1. Add a timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout if response received

      const data = await response.json();
      console.log(`[Login] Response Status: ${response.status}`, data);

      if (response.ok) {
        login(data.user, data.token);
      } else {
        // Handle specific server messages
        setError(data.msg || "Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.name === "AbortError") {
        setError(
          "Request timed out. Please check if your backend server is running on port 5000.",
        );
      } else if (err.message.includes("Network request failed")) {
        setError(
          "Network error. Ensure phone/emulator is on the same Wi-Fi as your PC.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryOrange}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log In</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.title}>Welcome to </Text>
              <Text style={[styles.title, { color: Colors.primaryOrange }]}>
                Furemedy!
              </Text>
            </View>
            <Text style={styles.subtitle}>Login to your account.</Text>

            <Text style={styles.inputLabel}>Email</Text>
            {/* 2. Apply conditional styling and event handlers */}
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "email" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            {/* 3. Apply conditional styling and event handlers */}
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "password" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/Screens/ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLoginPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                (!request || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleGoogleContinue}
              disabled={!request || isLoading}
            >
              <Image
                source={require("../../assets/images/google-logo.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/Screens/Signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Image
        source={require("../../assets/images/login-dogs-illustration.png")}
        style={styles.bottomImage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 250, // Give enough space for the scroll to avoid the image
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputDefaultBorder, // Use the new gray color
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  // 4. Add the focused style
  inputFocused: {
    borderColor: Colors.primaryOrange,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.primaryOrange,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.inputDefaultBorder,
  },
  dividerText: {
    marginHorizontal: 10,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.inputDefaultBorder,
    borderRadius: 15,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  signupText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  signupLink: {
    color: Colors.primaryOrange,
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    position: "absolute",
    bottom: 0,
    zIndex: -1,
  },
});

export default LoginScreen;
