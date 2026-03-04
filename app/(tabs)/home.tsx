import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmationModal from '../../components/ConfirmationModal';
import PetInfoCard from '../../components/PetInfoCard';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  lightOrange: '#FDEFE5',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
};

type Pet = {
  id: number;
  first_name: string;
  species: string;
  breed: string | null;
  pet_image_path: string | null;
};

const HomeScreen = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [petsError, setPetsError] = useState<string | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchPets = async () => {
        if (!token) {
          setPets([]);
          setIsLoadingPets(false);
          return;
        }

        setIsLoadingPets(true);
        setPetsError(null);
        try {
          const response = await fetch(`${API_URL}/api/pets/mine`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch pets.');
          }

          const data: Pet[] = await response.json();
          
          setPets(data);

        } catch (error: any) {
          setPetsError(error.message);
        } finally {
          setIsLoadingPets(false);
        }
      };

      fetchPets();
    }, [token]) // Dependency array ensures it refetches if the user logs in/out
  );

  const handleEdit = (petToEdit: Pet) => {
    router.push({
      pathname: '/Screens/AddPet',
      params: { petToEdit: JSON.stringify(petToEdit) }
    });
  };

  const handleDelete = (pet: Pet) => {
    setPetToDelete(pet);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete) return;

     try {
      await axios.delete(`${API_URL}/api/pets/${petToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // On success, update the UI instantly
      setPets(currentPets => currentPets.filter(p => p.id !== petToDelete.id));
      Alert.alert('Success', `${petToDelete.first_name} has been deleted.`);
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert('Error', 'Failed to delete pet.');
    } finally {
      // Close the modal and clear the state
      setDeleteModalVisible(false);
      setPetToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setPetToDelete(null);
  };

  const getProfileImageUrl = () => {
    if (!user) {
      return null;
    }
    const path = user.profile_image_path || user.profileImagePath;
    if (!path) {
      return null;
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  const profileImageUrl = getProfileImageUrl();

  const handleViewPet = (petId: number) => {
    router.push({
      pathname: '/Screens/ViewPet',
      params: { petId: petId.toString() } // Pass the pet's ID
    });
  };

  const renderPetContent = () => {
    if (isLoadingPets) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      );
    }
    if (petsError) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>{petsError}</Text>
        </View>
      );
    }
    if (pets.length > 0) {
      return (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PetInfoCard 
              pet={item} 
              onEdit={() => handleEdit(item)} 
              onDelete={() => handleDelete(item)} 
              onView={() => handleViewPet(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }
    // If loading is done and there are no pets, show the empty state
     return (
      <View style={styles.contentArea}>
        <MaterialCommunityIcons name="paw-off" size={80} color={Colors.primaryOrange} />
        <Text style={styles.emptyStateText}>
          No pets found. Tap + to add one now.
        </Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Furemedy</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Feather name="user" size={24} color={Colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            placeholder="Search here"
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
          <TouchableOpacity>
              <Feather name="sliders" size={20} color={Colors.primaryOrange} />
            </TouchableOpacity>
          </View>

        {/* My Pets Header Section */}
        <View style={styles.myPetsHeader}>
          <View style={styles.myPetsTitleContainer}>
            <Text style={styles.myPetsTitle}>My Pets</Text>
            <Ionicons name="paw" size={16} color={Colors.primaryOrange} style={styles.pawIcon} />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/Screens/AddPet')}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Pet Content Section */}
        {renderPetContent()}

        
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="paw" size={26} color={Colors.primaryOrange} />
          <Text style={[styles.navText, styles.navTextActive]}>My Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Chatbot</Text>
        </TouchableOpacity>
        
        <View style={styles.navButton} />

        <TouchableOpacity style={styles.navButton}>
          <Feather name="search" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/profile')}>
          <Feather name="user" size={26} color={Colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.scanButton, { bottom: 25 + insets.bottom }]}>
          <Ionicons name="scan-outline" size={30} color={Colors.primaryOrange} />
        </TouchableOpacity>
      </View>

       {petToDelete && (
        <ConfirmationModal
          visible={isDeleteModalVisible}
          title={`Are you sure you want to delete ${petToDelete.first_name} from your pets?`}
          message="This action cannot be undone. All scan records for this pet will also be deleted."
          imageSource={require('../../assets/images/sad-cat.png')} // Make sure this image exists in assets/images
          confirmButtonText="Delete"
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // --- THIS IS THE MODIFICATION ---
        paddingTop: 10, // Add this line to create space above the header
        paddingBottom: 20,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primaryOrange,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightOrange,
    },
    profileImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 25,
         borderWidth: 1,
        borderColor: Colors.lightOrange,
        // Add Shadow
        shadowColor: Colors.primaryOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    myPetsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    myPetsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    myPetsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
     pawIcon: {
    marginLeft: 8,
    transform: [{ rotate: '15deg' }],
  },
    addButton: {
        backgroundColor: Colors.primaryOrange,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyStateText: {
        marginTop: 15,
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    navBar: {
        flexDirection: 'row',
        height: 70,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: Colors.white,
    },
    navButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    navTextActive: {
        color: Colors.primaryOrange,
        fontWeight: 'bold',
    },
    scanButton: {
        position: 'absolute',
        left: '50%',
        marginLeft: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        borderColor: Colors.lightOrange,
        borderWidth: 6,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
    flex: 1, // This is crucial. It tells the list area to expand and fill the remaining space.
    },
    contentArea: { // Used for loading and empty states to ensure they are centered
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 60,
    },
});

export default HomeScreen;