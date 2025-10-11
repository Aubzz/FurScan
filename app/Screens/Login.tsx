import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

// --- Constants ---
const Colors = {
  background: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  primaryOrange: '#F79C4E',
  inputDefaultBorder: '#E0E0E0', // A neutral gray for the default border
  error: '#D32F2F',
  white: '#FFFFFF',
};

const API_URL = Platform.select({
  web: 'http://localhost:8080',
  default: 'http://10.151.237.144:8080', // Replace with your IP
});

// --- Main Screen Component ---
const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Add state to track the focused input
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLoginPress = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
      } else {
        setError(data.msg || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('A network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryOrange} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log In</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.title}>Welcome to </Text>
              <Text style={[styles.title, { color: Colors.primaryOrange }]}>Furemedy!</Text>
            </View>
            <Text style={styles.subtitle}>Login to your account.</Text>

            <Text style={styles.inputLabel}>Email</Text>
            {/* 2. Apply conditional styling and event handlers */}
            <View style={[ styles.inputWrapper, focusedInput === 'email' && styles.inputFocused ]}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            {/* 3. Apply conditional styling and event handlers */}
            <View style={[ styles.inputWrapper, focusedInput === 'password' && styles.inputFocused ]}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
                <Ionicons
                  name={isPasswordVisible ?  'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => router.push('/Screens/ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLoginPress}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.loginButtonText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/Screens/Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Image
        source={require('../../assets/images/login-dogs-illustration.png')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.primaryOrange,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  signupText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  signupLink: {
    color: Colors.primaryOrange,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});

export default LoginScreen;