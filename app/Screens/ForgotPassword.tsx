import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

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
  default: 'http://10.151.237.144:8080', // Replace with your IP
});

const ForgotPasswordScreen = () => {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleGetQuestion = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/get-security-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to retrieve question.');
      }
      setSecurityQuestion(data.security_question);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!securityAnswer.trim()) {
      Alert.alert('Error', 'Please enter your answer.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-security-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer: securityAnswer }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Verification failed.');
      }
      router.push({
        pathname: '/Screens/SetNewPassword',
        params: { email, resetToken: data.resetToken },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: Colors.primaryOrange,
          headerTitle: '',
        }}
      />
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {step === 1 ? (
            <>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address to retrieve your security question.
              </Text>
              <Image
                source={require('../../assets/images/forgot-password-cat.png')}
                style={styles.illustration}
                resizeMode="contain"
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[ styles.input, focusedInput === 'email' && styles.inputFocused ]}
                placeholder="Enter Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity style={styles.button} onPress={handleGetQuestion} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Next</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Answer your security question to reset your password.
              </Text>
              <Image
                source={require('../../assets/images/forgot-password-cat.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
              
              <Text style={styles.label}>Your Question:</Text>
              <Text style={styles.questionText}>{securityQuestion}</Text>
              
              <Text style={styles.label}>Your Answer</Text>
              <TextInput
                style={[ styles.input, focusedInput === 'securityAnswer' && styles.inputFocused ]}
                placeholder="Enter Your Answer"
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                onFocus={() => setFocusedInput('securityAnswer')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity style={styles.button} onPress={handleVerifyAnswer} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Verify Answer</Text>}
              </TouchableOpacity>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  illustration: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  label: {
    width: '100%',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputDefaultBorder,
    borderRadius: 12,
    padding: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 25,
  },
  inputFocused: {
    borderColor: Colors.primaryOrange,
    borderWidth: 1.5,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primaryOrange,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  questionText: {
    width: '100%',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    color: Colors.error,
    marginTop: 15,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center'
  },
});

export default ForgotPasswordScreen;