import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/api'; // Use your central API constant

const Colors = {
    gradientStart: '#F79C4E',
    gradientEnd: '#F7924A',
    white: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    lightOrange: '#FDEFE5',
};

// Define the shape of the pet data this component expects
type Pet = {
  id: number;
  first_name: string;
  species: string;
  breed: string | null;
  pet_image_path: string | null;
};

type PetInfoCardProps = {
  pet: Pet;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};

const PetInfoCard: React.FC<PetInfoCardProps> = ({ pet, onEdit, onDelete, onView }) => {
  const getPetImageUrl = () => {
    if (!pet.pet_image_path) return null;
    const path = pet.pet_image_path;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  const petImageUrl = getPetImageUrl();

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Decorative Paw Prints */}
      <Ionicons name="paw" size={48} style={[styles.paw, styles.paw1]} />
      <Ionicons name="paw" size={32} style={[styles.paw, styles.paw2]} />
      
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {petImageUrl ? (
            <Image source={{ uri: petImageUrl }} style={styles.petImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
                <Ionicons name="paw" size={40} color={Colors.gradientStart} />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>Pet Information</Text>
          <Text style={styles.detailText}>Name: {pet.first_name}</Text>
          <Text style={styles.detailText}>Species: {pet.species}</Text>
          {pet.breed && <Text style={styles.detailText}>Breed: {pet.breed}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
            <Feather name="edit-2" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.viewAllButton} onPress={onView}>
        <Text style={styles.viewAllText}>View</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {

    borderRadius: 25,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  imagePlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 45,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.white,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  viewAllButton: {
    position: 'absolute',
    bottom: 15,
    right: 20,
  },
  viewAllText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  paw: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.15)',
  },
  paw1: {
    bottom: 10,
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  paw2: {
    bottom: 40,
    left: 60,
    transform: [{ rotate: '15deg' }],
  },
});

export default PetInfoCard;