// In app/Screens/ViewPet.tsx

import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';

const Colors = {
  background: '#FFFFFF',
  headerBackground: '#F79C4E',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  bubbleBackground: '#FFF6EE',
  white: '#FFFFFF',
};

// --- TYPE DEFINITIONS ---
type InfoBubbleProps = {
  label: string;
  value: string;
};

type Pet = {
  id: number;
  first_name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  weight: number | null;
  birthdate: string | null; // Date comes as a string from JSON
  medical_history: string | null;
  pet_image_path: string | null;
};

// --- Reusable Info Bubble Component ---
const InfoBubble: React.FC<InfoBubbleProps> = ({ label, value }) => (
  <View style={styles.bubble}>
    <Text style={styles.bubbleValue}>{value}</Text>
    <Text style={styles.bubbleLabel}>{label}</Text>
  </View>
);

const ViewPetScreen = () => {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  // Apply the `Pet` type to the state
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPetDetails = useCallback(async () => {
    if (!petId || !token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pets/${petId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch pet details.');
      const data = await response.json();
      setPet(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [petId, token]);

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  const getPetImageUrl = () => {
    if (!pet?.pet_image_path) return null;
    return `${API_URL}/${pet.pet_image_path.replace(/\\/g, '/')}`;
  };

  const calculateAge = (birthdate: string | null): string => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.headerBackground} /></View>;
  }

  if (error || !pet) {
    return <View style={styles.centered}><Text>{error || 'Pet not found.'}</Text></View>;
  }
  
  const petImageUrl = getPetImageUrl();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View>
          {/* Add a check to ensure petImageUrl is not null */}
          {petImageUrl && <Image source={{ uri: petImageUrl }} style={styles.headerImage} />}
          <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><Feather name="arrow-left" size={24} color={Colors.textPrimary} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}><Feather name="more-horizontal" size={24} color={Colors.textPrimary} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.petName}>{pet.first_name}</Text>

          <View style={styles.bubbleContainer}>
            <InfoBubble label="Age" value={calculateAge(pet.birthdate)} />
            <InfoBubble label="Weight" value={pet.weight ? `${pet.weight} kg` : 'N/A'} />
            <InfoBubble label="Sex" value={pet.sex || 'N/A'} />
            <InfoBubble label="Species" value={pet.species} />
            <InfoBubble label="Breed" value={pet.breed || 'N/A'} />
          </View>

          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.historyBox}>
            <Ionicons name="paw" size={32} color={Colors.headerBackground} />
            <Text style={styles.historyText}>{pet.medical_history || 'No medical history'}</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.white} />
          <Text style={styles.chatButtonText}>Chat with Paw Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImage: { width: '100%', height: 350 },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { backgroundColor: Colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 25 },
  petName: { fontSize: 28, fontWeight: 'bold', color: Colors.headerBackground, marginBottom: 20 },
  bubbleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20, justifyContent: 'center' },
  bubble: { backgroundColor: Colors.bubbleBackground, borderRadius: 15, padding: 15, alignItems: 'center', width: '31%', marginBottom: 15 },
  bubbleValue: { fontSize: 16, fontWeight: 'bold', color: Colors.headerBackground, textAlign: 'center' },
  bubbleLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 15 },
  historyBox: { backgroundColor: Colors.bubbleBackground, borderRadius: 20, padding: 20, alignItems: 'center' },
  historyText: { color: Colors.textSecondary, marginTop: 10, fontSize: 14 },
  viewAllText: { color: Colors.headerBackground, fontWeight: 'bold', marginTop: 15 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'transparent' },
  chatButton: { backgroundColor: Colors.headerBackground, borderRadius: 15, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  chatButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});

export default ViewPetScreen;