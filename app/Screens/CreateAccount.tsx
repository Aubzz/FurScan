import axios from 'axios';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const Colors = {
  background: '#F8F8F8',
  primaryOrange: '#F7924A',
  secondaryOrange: '#FDEFE0',
  textPrimary: '#333333',
  textSecondary: '#AAAAAA',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
};


const CreateAccount = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '788397205962-3gd5qoead1migmabcbgmoh1pcmqhp90d.apps.googleusercontent.com',
    iosClientId: '788397205962-rua3cgceoc60ve5js05a19vbdtmr0oh6.apps.googleusercontent.com',
    androidClientId: '788397205962-8glgkjltugsou14j2ffvdcqpfkkvv648.apps.googleusercontent.com',
  });

  // The type is now simplified to only include 'google' and 'apple'
  const sendTokenToBackend = useCallback(async (provider: 'google' | 'apple', token: string) => {
    try {
      const backendResponse = await axios.post(`${API_URL}/api/auth/social-login`, {
        provider,
        token,
      });

      if (backendResponse.data.token && backendResponse.data.user) {
        login(backendResponse.data.user, backendResponse.data.token);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error("Social login failed:", errorMessage);
      Alert.alert('Login Failed', 'An error occurred while trying to log in.');
    }
  }, [login]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        sendTokenToBackend('google', id_token);
      }
    } else if (response?.type === 'error') {
      console.error("Google Auth Error:", response.error);
      Alert.alert('Authentication Failed', 'An error occurred during Google Sign-In.');
    }
  }, [response, sendTokenToBackend]);

  const handleGoogle = () => {
    if (request) {
      promptAsync();
    }
  };

  // The handleFacebook function has been removed.

  const handleApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        sendTokenToBackend('apple', credential.identityToken);
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        console.error('Apple Sign-In error:', e);
        Alert.alert('Login Failed', 'An error occurred during Apple Sign-In.');
      }
    }
  };

  const handleSignUp = () => router.push('/Screens/Signup');
  const handleLogin = () => router.push('/Screens/Login');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={require('../../assets/images/furemedy-logo.png')} 
          style={styles.logo} 
        />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to </Text>
          <Text style={styles.appName}>FurScan!</Text>
        </View>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSignUp}>
          <Text style={styles.buttonTextPrimary}>Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleLogin}>
          <Text style={styles.buttonTextSecondary}>Login</Text>
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogle} disabled={!request}>
          <Image source={require('../../assets/images/google-logo.png')} style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        
        {/* The Facebook button TouchableOpacity has been removed from here. */}

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={50}
            style={styles.socialButton}
            onPress={handleApple}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 20 },
  welcomeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  welcomeText: { fontWeight: 'bold', fontSize: 22, color: Colors.textPrimary },
  appName: { fontWeight: 'bold', fontSize: 22, color: Colors.primaryOrange },
  buttonPrimary: { backgroundColor: Colors.primaryOrange, borderRadius: 15, paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 15 },
  buttonTextPrimary: { fontWeight: 'bold', fontSize: 16, color: Colors.white },
  buttonSecondary: { backgroundColor: Colors.secondaryOrange, borderRadius: 15, paddingVertical: 18, width: '100%', alignItems: 'center' },
  buttonTextSecondary: { fontWeight: 'bold', fontSize: 16, color: Colors.primaryOrange },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderColor },
  dividerText: { marginHorizontal: 15, fontSize: 12, color: Colors.textSecondary },
  socialButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderColor, borderRadius: 50, height: 55, width: '100%', justifyContent: 'center', marginBottom: 15 },
  socialIcon: { width: 24, height: 24, marginRight: 15 },
  socialButtonText: { fontWeight: '600', fontSize: 16, color: Colors.textPrimary },
});

export default CreateAccount;