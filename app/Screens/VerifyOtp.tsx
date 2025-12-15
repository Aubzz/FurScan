import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,

  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  textPrimary: '#333333',
  textSecondary: '#888888',
  borderColor: '#E0E0E0',
  boxBackground: '#F5F5F5',
  error: '#D32F2F',
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // 60 seconds

const VerifyOtpScreen = () => {
  const router = useRouter();
  const { mobileNumber = '09123456789' } = useLocalSearchParams<{ mobileNumber: string }>();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  // Timer for the resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);


  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCooldown(RESEND_COOLDOWN);
    setError('');

    try {
        const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobileNumber }),
        });
        
        if (!response.ok) throw new Error("Failed to resend OTP.");
        
        Alert.alert("Success", "A new OTP has been sent to your mobile number.");
        setOtp(''); // Clear old OTP input

    } catch (err: any) {
        setError(err.message || 'An error occurred.');
        setCanResend(true); // Allow user to try again if it failed
    }
  };
  
  const handleOtpPress = () => { textInputRef.current?.focus(); };

  const handleOtpChange = (text: string) => {
    setError(''); // Clear error on new input
    setOtp(text);
    if (text.length === OTP_LENGTH) {
      verifyOtp(text);
    }
  };

  const verifyOtp = async (enteredOtp: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    setError('');

    try {
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobileNumber, otp: enteredOtp }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || "Verification failed.");
        }
        
        Alert.alert("Success", "Your account has been verified. Please log in.", [
            { text: "OK", onPress: () => router.replace('/Screens/Login') }
        ]);

    } catch (err: any) {
        setError(err.message);
        setOtp(''); // Clear incorrect OTP
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verify your account</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit one-time password (OTP) sent to{' '}
            <Text style={styles.mobileText}>{mobileNumber}</Text>
          </Text>

          <TextInput
            ref={textInputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={handleOtpChange}
            maxLength={OTP_LENGTH}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            editable={!isLoading}
          />
          
          <TouchableOpacity style={styles.otpContainer} onPress={handleOtpPress} activeOpacity={1}>
            {isLoading ? (
                <ActivityIndicator size="large" color={Colors.primaryOrange} />
            ) : (
                Array.from({ length: OTP_LENGTH }).map((_, index) => (
                  <View key={index} style={[ styles.otpBox, otp.length === index && styles.otpBoxFocused ]}>
                    <Text style={styles.otpText}>{otp[index] || ''}</Text>
                  </View>
                ))
            )}
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive any OTP? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={!canResend}>
              <Text style={[styles.resendLink, !canResend && styles.resendDisabled]}>
                {canResend ? 'Resend Code' : `Resend in ${cooldown}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoidingContainer: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 25, paddingTop: 120 },
  title: { fontWeight: 'bold', fontSize: 24, color: Colors.textPrimary, marginBottom: 15 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  mobileText: { fontWeight: 'bold', color: Colors.textPrimary },
  hiddenInput: { width: 0, height: 0, position: 'absolute' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', height: 50, marginBottom: 30 },
  otpBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: Colors.boxBackground, borderWidth: 1, borderColor: Colors.borderColor, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  otpBoxFocused: { borderColor: Colors.primaryOrange },
  otpText: { fontWeight: 'bold', fontSize: 22, color: Colors.textPrimary },
  errorText: { color: Colors.error, fontSize: 14, marginBottom: 20, textAlign: 'center' },
  resendContainer: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: 14, color: Colors.textSecondary },
  resendLink: { fontWeight: 'bold', fontSize: 14, color: Colors.primaryOrange },
  resendDisabled: { opacity: 0.5 },
});

export default VerifyOtpScreen;