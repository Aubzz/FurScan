import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker'; // Import Image Picker
import React, { useRef, useState } from 'react';
import {
  Alert,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  lightOrange: '#FDEFE5',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
  cameraView: '#000000',
};

const ScanScreen = () => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  // --- States ---
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torchEnabled, setTorchEnabled] = useState(false); // State for Flashlight

  // Height of the orange header bar
  const headerHeight = insets.top + 60;

  // 1. Handle Permissions Loading
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Handle Permissions Denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // --- Actions ---

  // Toggle Flashlight
  const toggleFlash = () => {
    setTorchEnabled((prev) => !prev);
  };

  // Open Gallery
  const pickImage = async () => {
    // Ask for permission to access library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image Selected:', result.assets[0].uri);
      Alert.alert("Photo Selected", "Photo successfully loaded from gallery.");
      // Here you would typically save the image to state or navigate to a new screen
    }
  };

  // Capture Photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Photo taken:', photo?.uri);
        Alert.alert("Photo Taken", "Image captured successfully!");
      } catch (error) {
        console.log("Error taking photo:", error);
      }
    }
  };

  // General Handler
  const handleAction = (action: string) => {
    console.log(`${action} Tapped`);
    // Navigation logic would go here
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryOrange} />

      {/* --- Top Header (Orange) --- */}
      <View style={[styles.topHeaderBackground, { height: headerHeight, paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.topHeaderTitle}>Dermapaw Reader</Text>
          <TouchableOpacity style={styles.topHeaderInfoButton} onPress={() => handleAction('Info')}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Main Content Area --- */}
      <View style={[styles.content, { marginTop: headerHeight }]}>
        
        {/* CAMERA COMPONENT */}
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torchEnabled} // Controls the flash/torch
          ref={cameraRef}
        >
          {/* Overlay Container inside Camera */}
          <View style={styles.overlayContainer}>
            
            {/* 1. Top Camera Bar */}
            <View style={styles.topCameraBar}>
              <TouchableOpacity onPress={() => handleAction('Back')}>
                <Ionicons name="arrow-back" size={28} color={Colors.white} />
              </TouchableOpacity>

              <View style={styles.scanHeader}>
                <Text style={styles.scanTitle}>Scan Pet Skin</Text>
                <Text style={styles.scanInstructions}>
                  Place your pet skin inside the frame. Keep steady...
                </Text>
              </View>

              <TouchableOpacity onPress={toggleFlash}>
                {/* Change icon based on flash state */}
                <Ionicons 
                  name={torchEnabled ? "flash" : "flash-outline"} 
                  size={28} 
                  color={Colors.white} 
                />
              </TouchableOpacity>
            </View>

            {/* 2. Central Scan Frame */}
            <View style={styles.scanFrameWrapper}>
              <View style={styles.scanFrameBorder} />
            </View>

            {/* 3. Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* UPLOAD BUTTON */}
              <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={30} color={Colors.white} />
                <Text style={styles.controlText}>Upload</Text>
              </TouchableOpacity>

              {/* CAPTURE BUTTON */}
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInnerCircle} />
              </TouchableOpacity>

              {/* EMPTY SPACER (To balance layout after removing Cat) */}
              <View style={styles.controlButton} />
            </View>
          </View>
        </CameraView>
      </View>

      {/* --- Bottom Navigation Bar --- */}
      <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 10), height: 65 + insets.bottom }]}>
        <TouchableOpacity style={styles.navButton} onPress={() => handleAction('Pets')}>
          <MaterialCommunityIcons name="paw" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>My Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => handleAction('Chatbot')}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Chatbot</Text>
        </TouchableOpacity>

        {/* Spacer for Floating Button */}
        <View style={styles.navButton} />

        <TouchableOpacity style={styles.navButton} onPress={() => handleAction('Search')}>
          <Feather name="search" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => handleAction('Profile')}>
          <Feather name="user" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        {/* Floating Scan Button */}
        <TouchableOpacity
          style={[styles.scanButton, { bottom: 35 + insets.bottom }]}
          onPress={() => handleAction('Scan Active')}
        >
          <Ionicons name="scan-outline" size={30} color={Colors.primaryOrange} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  // --- Header Styles ---
  topHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primaryOrange,
    zIndex: 50,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5,
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  topHeaderInfoButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
  // --- Main Content ---
  content: {
    flex: 1,
    backgroundColor: Colors.cameraView,
    overflow: 'hidden',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  // --- Camera Overlays ---
  topCameraBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scanHeader: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  scanInstructions: {
    fontSize: 12,
    color: '#EEE',
    textAlign: 'center',
  },
  scanFrameWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrameBorder: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  // --- Camera Bottom Controls ---
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 15,
  },
  controlButton: {
    alignItems: 'center',
    width: 80,
  },
  controlText: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 5,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  captureInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.white,
  },
  // --- Navigation Bar ---
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    backgroundColor: Colors.white,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 10,
    zIndex: 60,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scanButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: Colors.lightOrange,
    borderWidth: 5,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 70,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default ScanScreen;