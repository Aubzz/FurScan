import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Animated,
  Button, Dimensions, SafeAreaView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';

const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.75;
const FRAME_HEIGHT = width * 0.9;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter(); 
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  const { petName, petAge, petBreed } = useLocalSearchParams();

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(textOpacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
          ])
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isProcessing]);

// It must look exactly like this:
const BACKEND_URL = 'http://192.168.100.4:8000/predict';
  const uploadToModel = async (uri: string) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      const filePayload = {
        uri: uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      };
      // @ts-ignore
      formData.append('file', filePayload);
      
      const response = await fetch(BACKEND_URL, { 
        method: 'POST',
        body: formData,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const data = await response.json();
      
      router.push({
        pathname: "/Screens/ResultScreen" as any, 
        params: { 
          imageUri: uri, 
          status: data.status, 
          predictions: JSON.stringify(data.predictions || []), 
          petName, 
          petAge,  
          petBreed 
        }
      });
    } catch (e: any) {
      console.error("Upload Error:", e);
      Alert.alert("Scan Failed", "Check backend connection and Wi-Fi.");
    } finally { 
      setIsProcessing(false); 
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.3 });
      if (photo?.uri) uploadToModel(photo.uri);
    }
  };

  if (!permission?.granted) return (
    <View style={styles.container}><Button title="Grant Camera" onPress={requestPermission}/></View>
  );

  return (
    <View style={styles.container}>
      {/* LOADING OVERLAY */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <View style={styles.spinnerWrapper}>
              <View style={{ transform: [{ scale: 4 }] }}>
                <ActivityIndicator size="large" color="#F7924A" />
              </View>
              <Animated.View style={[styles.pawInside, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="paw" size={60} color="#F7924A" />
              </Animated.View>
            </View>
            <Animated.Text style={[styles.loadingText, { opacity: textOpacity }]}>
                ANALYZING SKIN
            </Animated.Text>
            {/* FIXED: Replaced 'div' with 'View' */}
            <View style={styles.loadingBarContainer}>
                <View style={styles.loadingBarActive} />
            </View>
          </View>
        </View>
      )}

      <CameraView style={styles.camera} ref={cameraRef} zoom={zoom} enableTorch={torchEnabled}>
        <View style={styles.maskOverlay}>
          <View style={styles.maskRow} />
          <View style={styles.maskCenterRow}>
            <View style={styles.maskSide} />
            <View style={styles.frameContainer}>
               <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5 }]} />
               <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5 }]} />
               <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5 }]} />
               <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5 }]} />
            </View>
            <View style={styles.maskSide} />
          </View>
          <View style={styles.maskRow} />
        </View>

        <SafeAreaView style={styles.uiContainer}>
          {/* HEADER SECTION - FIXED BACK BUTTON */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.replace('/Screens/PhotoTipsScreen' as any)}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PET SKIN SCANNER</Text>
            <TouchableOpacity onPress={() => setTorchEnabled(!torchEnabled)}>
              <MaterialCommunityIcons name={torchEnabled ? "flash" : "flash-outline"} size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* CONTROLS SECTION */}
          <View style={styles.controlsSection}>
            <Slider
              style={styles.zoomSlider}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#F7924A"
              value={zoom}
              onValueChange={setZoom}
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.utilityBtn} onPress={async () => {
                  const res = await ImagePicker.launchImageLibraryAsync({ 
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.3 
                  });
                  if (!res.canceled) uploadToModel(res.assets[0].uri);
              }}>
                <Ionicons name="images-outline" size={26} color="white" />
                <Text style={styles.utilityText}>Library</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shutterOuter} 
                onPress={takePicture}
                disabled={isProcessing}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <View style={styles.utilityBtn} />
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.92)', 
    zIndex: 100, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingBox: { alignItems: 'center', justifyContent: 'center' },
  spinnerWrapper: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pawInside: { position: 'absolute', zIndex: 10 },
  loadingText: { color: '#F7924A', marginTop: 60, fontWeight: '900', fontSize: 16, letterSpacing: 3 },
  loadingBarContainer: { width: 120, height: 3, backgroundColor: 'rgba(247, 146, 74, 0.2)', marginTop: 12, borderRadius: 2, overflow: 'hidden' },
  loadingBarActive: { width: '45%', height: '100%', backgroundColor: '#F7924A' },
  maskOverlay: { ...StyleSheet.absoluteFillObject },
  maskRow: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  maskCenterRow: { flexDirection: 'row', height: FRAME_HEIGHT },
  maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  frameContainer: { width: FRAME_WIDTH, height: FRAME_HEIGHT, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#F7924A' },
  uiContainer: { flex: 1, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 2 },
  controlsSection: { paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.2)' },
  zoomSlider: { width: '80%', alignSelf: 'center', height: 40 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  shutterOuter: { width: 82, height: 82, borderRadius: 41, borderWidth: 4, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: 'white' },
  utilityBtn: { alignItems: 'center', width: 70 },
  utilityText: { color: 'white', fontSize: 11, marginTop: 4, fontWeight: '500' }
});