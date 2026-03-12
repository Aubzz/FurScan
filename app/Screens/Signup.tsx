import { Feather, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';


const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
  progressBarInactive: '#EAEAEA',
  asteriskRed: '#FF0000',
};

const securityQuestions = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "In what city were you born?",
  "What is your favorite book?",
];

interface FormLabelProps {
  label: string;
}

const FormLabel: React.FC<FormLabelProps> = ({ label }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.asterisk}> *</Text>
  </View>
);

const SignupScreen = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(securityQuestions[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: '',
    securityAnswer: '',
  });

  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsStep1Valid(
      firstName.trim() !== '' &&
        lastName.trim() !== '' &&
        emailRegex.test(email) &&
        mobileNumber.length >= 9
    );
  }, [firstName, lastName, email, mobileNumber]);

  useEffect(() => {
    setIsStep2Valid(
      password.length >= 8 &&
        password === confirmPassword &&
        agreedToTerms &&
        securityAnswer.trim() !== ''
    );
  }, [password, confirmPassword, agreedToTerms, securityAnswer]);

  const validateAndSetErrors = (
    validationLogic: () => { [key: string]: string }
  ) => {
    const newErrors = validationLogic();
    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.values(newErrors).every((error) => error === '');
  };

  const validateStep1Fields = () => {
    const newErrors = { firstName: '', lastName: '', email: '', mobileNumber: '' };
    if (!firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = 'Email Address is required.';
    else if (!emailRegex.test(email))
      newErrors.email = 'Please enter a valid email address.';
    if (!mobileNumber.trim())
      newErrors.mobileNumber = 'Mobile Number is required.';
    else if (mobileNumber.length < 9)
      newErrors.mobileNumber = 'Please enter a valid mobile number.';
    return newErrors;
  };

  const validateStep2Fields = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
      agreedToTerms: '',
      securityAnswer: '',
    };
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters long.';
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    if (!agreedToTerms)
      newErrors.agreedToTerms = 'You must agree to the terms to continue.';
    if (!securityAnswer.trim())
      newErrors.securityAnswer = 'An answer to the security question is required.';
    return newErrors;
  };

  const handleNext = () => {
    if (validateAndSetErrors(validateStep1Fields)) {
      setStep(2);
    }
  };

  const handlePrevious = () => setStep(1);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const handleFinalSignUp = async () => {
    if (validateAndSetErrors(validateStep2Fields)) {
      const signupApiUrl = `${API_URL}/api/auth/signup`;
      const formData = new FormData();

      // CHANGE: Sending as snake_case to match standard backend expectations
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);
      formData.append('mobile_number', mobileNumber);
      formData.append('password', password);
      formData.append('security_question', securityQuestion);
      formData.append('security_answer', securityAnswer);

      if (profileImage) {
        const filename = profileImage.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename!);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // FIX: Ensure URI is correctly formatted for multipart upload on both platforms
        const cleanUri = Platform.OS === 'ios' ? profileImage.replace('file://', '') : profileImage;

        formData.append('profileImage', {
          uri: cleanUri,
          name: filename,
          type,
        } as any);
      }

      try {
        const response = await axios.post(signupApiUrl, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
        });

        if (response.status === 201 && response.data.token) {
          Alert.alert('Success', 'Account created successfully!');
          login(response.data.user, response.data.token);
        } else {
          throw new Error('Signup successful, but no token received.');
        }
      } catch (error: any) {
        console.error(
          'Signup Error Details:',
          error.response ? error.response.data : error.message
        );
        const errorMessage =
          error.response?.data?.msg ||
          error.response?.data?.message ||
          'An unknown error occurred. Please try again.';
        Alert.alert('Signup Failed', errorMessage);
      }
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>Basic Information</Text>
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImagePreview}
                />
              ) : (
                <>
                  <Feather name="camera" size={32} color={Colors.textSecondary} />
                  <View style={styles.galleryIconContainer}>
                    <Ionicons name="image" size={16} color={Colors.white} />
                  </View>
                </>
              )}
            </TouchableOpacity>
            {profileImage && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={Colors.asteriskRed}
                />
              </TouchableOpacity>
            )}
          </View>
          <FormLabel label="First Name" />
          <TextInput
            style={[ styles.input, errors.firstName ? styles.inputError : null, focusedInput === 'firstName' && styles.inputFocused ]}
            placeholder="Enter First Name" value={firstName} onChangeText={setFirstName}
            onFocus={() => setFocusedInput('firstName')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          
          <FormLabel label="Last Name" />
          <TextInput
            style={[ styles.input, errors.lastName ? styles.inputError : null, focusedInput === 'lastName' && styles.inputFocused ]}
            placeholder="Enter Last Name" value={lastName} onChangeText={setLastName}
            onFocus={() => setFocusedInput('lastName')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

          <FormLabel label="Email Address" />
          <TextInput
            style={[ styles.input, errors.email ? styles.inputError : null, focusedInput === 'email' && styles.inputFocused ]}
            placeholder="user@furemedy.app" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <FormLabel label="Mobile Number" />
          <View style={[ styles.mobileInputContainer, errors.mobileNumber ? styles.inputError : null, focusedInput === 'mobileNumber' && styles.inputFocused ]}>
            <Text style={styles.countryCode}>+63</Text>
            <View style={styles.verticalDivider} />
            <TextInput
              style={styles.mobileInput} placeholder="XXX XXX XXXX" value={mobileNumber} onChangeText={setMobileNumber}
              keyboardType="phone-pad" maxLength={10}
              onFocus={() => setFocusedInput('mobileNumber')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
        </>
      );
    } else if (step === 2) {
      return (
        <>
          <Text style={styles.title}>Security Setup</Text>
          <FormLabel label="Password" />
          <View style={[ styles.passwordContainer, errors.password ? styles.inputError : null, focusedInput === 'password' && styles.inputFocused ]}>
            <TextInput
              style={styles.passwordInput} placeholder="Enter Password" value={password} onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <FormLabel label="Confirm Password" />
          <View style={[ styles.passwordContainer, errors.confirmPassword ? styles.inputError : null, focusedInput === 'confirmPassword' && styles.inputFocused ]}>
            <TextInput
              style={styles.passwordInput} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              <Feather name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <FormLabel label="Security Question" />
          <View style={styles.pickerContainer}>
            <Picker 
                selectedValue={securityQuestion} 
                onValueChange={(itemValue) => setSecurityQuestion(itemValue)} 
                style={styles.picker}
                dropdownIconColor={Colors.primaryOrange}
                mode="dropdown"
            >
              {securityQuestions.map((q, i) => (
                <Picker.Item 
                  key={i} 
                  label={q} 
                  value={q} 
                  color={Colors.textPrimary}
                />
              ))}
            </Picker>
          </View>

          <View style={{ marginTop: Platform.OS === 'ios' ? 15 : 0 }}>
            <FormLabel label="Your Answer" />
          </View>
          <TextInput
            style={[ styles.input, errors.securityAnswer ? styles.inputError : null, focusedInput === 'securityAnswer' && styles.inputFocused ]}
            placeholder="Enter Your Answer" value={securityAnswer} onChangeText={setSecurityAnswer}
            onFocus={() => setFocusedInput('securityAnswer')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.securityAnswer && <Text style={styles.errorText}>{errors.securityAnswer}</Text>}

          <View style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={agreedToTerms}
              onValueChange={setAgreedToTerms}
              color={agreedToTerms ? Colors.primaryOrange : undefined}
            />
            <Text style={styles.checkboxLabel}>
              By proceeding, you agree on FurScan&apos;s{' '}
              <Text style={styles.linkText}>Terms and Conditions</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </View>
          {errors.agreedToTerms ? (
            <Text style={[styles.errorText, { marginTop: -10 }]}>
              {errors.agreedToTerms}
            </Text>
          ) : null}
        </>
      );
    }
  };

  const renderButtons = () => {
    if (step === 1) {
      return (
        <TouchableOpacity
          style={[styles.nextButton, !isStep1Valid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isStep1Valid}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      );
    } else if (step === 2) {
      return (
        <>
          <TouchableOpacity
            style={[styles.nextButton, !isStep2Valid && styles.buttonDisabled]}
            onPress={handleFinalSignUp}
            disabled={!isStep2Valid}>
            <Text style={styles.nextButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        </>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primaryOrange },
          headerTintColor: Colors.white,
          headerTitle: 'Sign Up',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontFamily: 'Poppins-Bold' },
          headerShadowVisible: false,
        }}
      />
      <StatusBar barStyle="light-content" />
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, step >= 1 && styles.progressBarActive]}
        />
        <View
          style={[styles.progressBar, step >= 2 && styles.progressBarActive]}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.buttonContainer}>{renderButtons()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoidingContainer: { flex: 1 },
  scrollContainer: { paddingHorizontal: 25, paddingBottom: 150 },
  progressBarContainer: { flexDirection: 'row', paddingHorizontal: 25, paddingTop: 20, marginBottom: 20 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.progressBarInactive, marginHorizontal: 5 },
  progressBarActive: { backgroundColor: Colors.primaryOrange },
  title: { fontFamily: 'Poppins-Bold', fontSize: 20, color: Colors.textPrimary, textAlign: 'center', marginBottom: 20 },
  imagePickerContainer: { alignSelf: 'center', marginBottom: 30, position: 'relative' },
  imagePicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderColor },
  profileImagePreview: { width: '100%', height: '100%', borderRadius: 50 },
  removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: Colors.white, borderRadius: 14 },
  galleryIconContainer: { position: 'absolute', bottom: 5, right: 5, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryOrange, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
  labelContainer: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  label: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: Colors.textPrimary },
  asterisk: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: Colors.asteriskRed },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    padding: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 20,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingLeft: 15,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: Colors.primaryOrange,
    borderWidth: 1.5,
  },
  countryCode: { fontFamily: 'Poppins-Regular', fontSize: 16, color: Colors.textPrimary },
  verticalDivider: { height: '60%', width: 1, backgroundColor: Colors.borderColor, marginHorizontal: 10 },
  mobileInput: { flex: 1, paddingVertical: 15, fontFamily: 'Poppins-Regular', fontSize: 16 },
  passwordInput: { flex: 1, padding: 15, fontFamily: 'Poppins-Regular', fontSize: 16 },
  eyeIcon: { paddingHorizontal: 15 },
  
  pickerContainer: { 
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: Colors.borderColor, 
    borderRadius: 12, 
    marginBottom: 20, 
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 150 : 60, 
    overflow: 'hidden' 
  },
  picker: { 
    height: Platform.OS === 'ios' ? 150 : 60, 
    width: '100%',
    color: Colors.textPrimary,
  },

  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 30 },
  checkbox: { marginRight: 10, marginTop: 2, width: 20, height: 20 },
  checkboxLabel: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  linkText: { fontFamily: 'Poppins-Bold', color: Colors.primaryOrange, textDecorationLine: 'underline' },
  buttonContainer: { padding: 25, backgroundColor: Colors.background },
  nextButton: { backgroundColor: Colors.primaryOrange, borderRadius: 15, paddingVertical: 18, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  nextButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: Colors.white },
  previousButton: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderColor, borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  previousButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: Colors.primaryOrange },
  inputError: { borderColor: Colors.asteriskRed },
  errorText: { color: Colors.asteriskRed, fontFamily: 'Poppins-Regular', fontSize: 12, marginTop: -15, marginBottom: 10, paddingLeft: 5 },
});

export default SignupScreen;