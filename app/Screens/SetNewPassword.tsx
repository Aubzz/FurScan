import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  inputDefaultBorder: '#BDBDBD',
  error: '#FF0000',
};

const API_URL = Platform.select({
  web: 'http://localhost:8080',
  default: 'http://192.168.50.7:8080', // Replace with your IP
});

const SetNewPasswordScreen = () => {
  const router = useRouter();
  const { email, resetToken } = useLocalSearchParams<{ email: string; resetToken: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSetNewPassword = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill out both password fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password-with-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: resetToken,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to reset password.');
      }

      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/Screens/Login') }
      ]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- MODIFICATION: Header is now hidden --- */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* --- MODIFICATION: New illustration and reordered text --- */}
          <Image
            // IMPORTANT: Add a new image to your assets folder for this to work
            source={require('../../assets/images/set-password-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create a New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previously used passwords.
          </Text>

          <Text style={styles.label}>New Password</Text>
          <View style={[ styles.passwordContainer, focusedInput === 'password' && styles.inputFocused ]}>
            <Ionicons name="lock-closed-outline" size={22} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={[ styles.passwordContainer, focusedInput === 'confirmPassword' && styles.inputFocused ]}>
            <Ionicons name="lock-closed-outline" size={22} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              <Feather name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleSetNewPassword} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: 'center', // Center content vertically
    paddingBottom: 40, // Add padding at the bottom
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: 220,
    height: 200,
    marginBottom: 30,
    alignSelf: 'center',
  },
  label: {
    width: '100%',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputDefaultBorder,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputFocused: {
    borderColor: Colors.primaryOrange,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primaryOrange,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default SetNewPasswordScreen;