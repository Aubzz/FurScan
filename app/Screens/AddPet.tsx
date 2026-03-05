import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import axios from "axios";
import { Checkbox } from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfirmationModal from "../../components/ConfirmationModal";
import { API_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";

// --- Constants & Data (unchanged) ---
const Colors = {
  background: "#FFFFFF",
  headerBackground: "#F79C4E",
  textPrimary: "#212529",
  textSecondary: "#6c757d",
  placeholder: "#adb5bd",
  borderColor: "#ced4da",
  white: "#FFFFFF",
  lightGray: "#f8f9fa",
};
const SPECIES_DATA = [
  { label: "Dog", value: "Dog" },
  { label: "Cat", value: "Cat" },
];

const SEX_DATA = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const BREED_DATA = [
  {
    label: "Aspin / Mixed-breed",
    value: "Aspin / Mixed-breed",
    species: "Dog",
  },
  { label: "Labrador Retriever", value: "Labrador Retriever", species: "Dog" },
  { label: "Beagle", value: "Beagle", species: "Dog" },
  { label: "Shih Tzu", value: "Shih Tzu", species: "Dog" },
  { label: "Golden Retriever", value: "Golden Retriever", species: "Dog" },
  { label: "Pomeranian", value: "Pomeranian", species: "Dog" },
  { label: "Siberian Husky", value: "Siberian Husky", species: "Dog" },
  { label: "German Shepherd", value: "German Shepherd", species: "Dog" },
  { label: "Pug", value: "Pug", species: "Dog" },
  {
    label: "Domestic Short Hair",
    value: "Domestic Short Hair",
    species: "Cat",
  },
  { label: "Domestic Long Hair", value: "Domestic Long Hair", species: "Cat" },
  { label: "Siamese", value: "Siamese", species: "Cat" },
  { label: "Persian", value: "Persian", species: "Cat" },
  { label: "Maine Coon", value: "Maine Coon", species: "Cat" },
  { label: "Ragdoll", value: "Ragdoll", species: "Cat" },
];

const AddPetScreen = () => {
  const router = useRouter();
  const { token } = useAuth();

  const params = useLocalSearchParams();
  const petToEdit = params.petToEdit
    ? JSON.parse(params.petToEdit as string)
    : null;
  const isEditMode = !!petToEdit;

  // State variables
  const [petImage, setPetImage] = useState<string | null>(
    petToEdit?.pet_image_path || null,
  );
  const [firstName, setFirstName] = useState(petToEdit?.first_name || "");
  const [species, setSpecies] = useState<string | null>(
    petToEdit?.species || null,
  );
  const [breed, setBreed] = useState<string | null>(petToEdit?.breed || null);
  const [birthdate, setBirthdate] = useState<Date | null>(
    petToEdit?.birthdate ? new Date(petToEdit.birthdate) : null,
  );
  const [sex, setSex] = useState<string | null>(petToEdit?.sex || null);
  const [weight, setWeight] = useState(petToEdit?.weight?.toString() || "");
  const [medicalHistory, setMedicalHistory] = useState(
    petToEdit?.medical_history || "",
  );
  const [isConfirmed, setIsConfirmed] = useState(isEditMode);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Helper functions
  const filteredBreeds = useMemo(() => {
    if (!species) return [];
    return BREED_DATA.filter((b) => b.species === species).map((b) => ({
      label: b.label,
      value: b.value,
    }));
  }, [species]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need access to your photos to add a pet picture.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      // The warning was misleading. For your installed version, `MediaTypeOptions` is the correct name.
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPetImage(result.assets[0].uri);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsModalVisible(false); // Close the modal
    setIsLoading(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("species", species!);
    if (breed) formData.append("breed", breed);
    if (birthdate)
      formData.append("birthdate", birthdate.toISOString().split("T")[0]);
    if (medicalHistory) formData.append("medicalHistory", medicalHistory);
    if (sex) formData.append("sex", sex);
    if (weight) formData.append("weight", weight);

    if (petImage && petImage.startsWith("file://")) {
      const uriParts = petImage.split(".");
      const fileType = uriParts[uriParts.length - 1];

      // The `any` cast is often necessary for React Native FormData
      formData.append("petImage", {
        uri: petImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      let response;
      if (isEditMode) {
        // UPDATE request
        response = await axios.put(
          `${API_URL}/api/pets/${petToEdit.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        // ADD request
        response = await axios.post(`${API_URL}/api/pets/add`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success!",
          `Pet has been ${isEditMode ? "updated" : "added"} successfully.`,
        );
        router.back();
      }
    } catch (error: any) {
      console.error("Add pet frontend error:", error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server Response Data:", error.response.data);
        console.error("Server Response Status:", error.response.status);
        Alert.alert(
          "Submission Failed",
          `Server responded with an error: ${error.response.data.msg || "Please try again."}`,
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        Alert.alert(
          "Submission Failed",
          "Could not connect to the server. Please check your network connection and server status.",
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        Alert.alert("Submission Failed", "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!firstName || !species) {
      Alert.alert(
        "Missing Information",
        "Please fill out the pet's name and species.",
      );
      return;
    }
    if (!isConfirmed) {
      Alert.alert(
        "Confirmation Required",
        "Please confirm that the information provided is correct.",
      );
      return;
    }
    if (!token) {
      Alert.alert("Authentication Error", "You must be logged in.");
      return;
    }
    setIsModalVisible(true);
  };

  const getDisplayImageUri = () => {
    if (!petImage) return null;
    // If it's a local file URI (from the image picker), use it directly.
    if (petImage.startsWith("file://")) {
      return petImage;
    }
    // Otherwise, it's a path from the database, so construct the full URL.
    return `${API_URL}/${petImage}`;
  };
  const displayImageUri = getDisplayImageUri();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.headerBackground}
      />
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header & Image Picker */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerIcon}
            >
              <Feather name="arrow-left" size={28} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Feather name="more-vertical" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handleImagePick}
            >
              {displayImageUri ? (
                <Image
                  source={{ uri: displayImageUri }}
                  style={styles.petImagePreview}
                />
              ) : (
                <Feather name="camera" size={40} color={Colors.textSecondary} />
              )}
              <View style={styles.galleryIconContainer}>
                <Ionicons name="image" size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.formTitle}>
            {isEditMode ? "Edit Pet Information" : "Pet's Information"}
          </Text>
          <Text style={styles.label}>Pet&apos;s Name</Text>
          <View style={styles.fullWidthInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter pet's name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <Text style={styles.label}>Species</Text>
          <View style={styles.fullWidthInputContainer}>
            <RNPickerSelect
              onValueChange={(value: string | null) => {
                setSpecies(value);
                setBreed(null);
              }}
              items={SPECIES_DATA}
              style={pickerSelectStyles}
              value={species}
              placeholder={{ label: "Choose your pet species", value: null }}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Feather
                  name="chevron-down"
                  size={24}
                  color={Colors.textSecondary}
                />
              )}
            />
          </View>
          <Text style={styles.label}>Breed</Text>
          <View style={styles.fullWidthInputContainer}>
            <RNPickerSelect
              onValueChange={(value: string | null) => setBreed(value)}
              items={filteredBreeds}
              style={pickerSelectStyles}
              value={breed}
              placeholder={{ label: "Choose your pet breed", value: null }}
              disabled={!species}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Feather
                  name="chevron-down"
                  size={24}
                  color={Colors.textSecondary}
                />
              )}
            />
          </View>

          {/* Sex and Weight row */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { paddingHorizontal: 0 }]}>Sex</Text>
              <RNPickerSelect
                onValueChange={(value: string | null) => setSex(value)}
                items={SEX_DATA}
                style={pickerSelectStyles}
                value={sex}
                placeholder={{ label: "Select sex", value: null }}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <Feather
                    name="chevron-down"
                    size={24}
                    color={Colors.textSecondary}
                  />
                )}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { paddingHorizontal: 0 }]}>
                Weight
              </Text>
              <View style={styles.unitInputContainer}>
                <TextInput
                  style={styles.unitInput}
                  placeholder="0.00"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Birthdate</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerText}>
              {birthdate ? birthdate.toLocaleDateString() : "Birthdate"}
            </Text>
            <Feather name="calendar" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
          <Text style={styles.label}>Medical History</Text>
          <View style={styles.fullWidthInputContainer}>
            <TextInput
              style={styles.textArea}
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={isConfirmed}
              onValueChange={setIsConfirmed}
              color={isConfirmed ? Colors.headerBackground : undefined}
            />
            <Text style={styles.checkboxLabel}>
              I confirm that the above information about my pet is correct.
            </Text>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.submitButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? "Save Changes" : "Submit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <ConfirmationModal
        visible={isModalVisible}
        title={
          isEditMode
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to add your pet?"
        }
        imageSource={
          isEditMode
            ? require("../../assets/images/happy-cat.png")
            : require("../../assets/images/happy-cat.png")
        }
        confirmButtonText={isEditMode ? "Save Changes" : "Confirm"}
        onCancel={() => setIsModalVisible(false)}
        onConfirm={handleConfirmSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    backgroundColor: Colors.headerBackground,
    height: 180,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  headerIcon: { height: 40 },
  imagePickerContainer: {
    alignItems: "center",
    marginTop: -70,
    marginBottom: 20,
  },
  imagePicker: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.white,
  },
  petImagePreview: { width: "100%", height: "100%", borderRadius: 70 },
  galleryIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.headerBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.headerBackground,
    paddingHorizontal: 25,
    marginBottom: 20,
  },

  // --- THIS IS THE FIX ---
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  // --- END OF FIX ---

  inputGroup: { width: "48%" },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 5,
    fontWeight: "500",
    paddingHorizontal: 25,
    marginTop: 5,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 25,
    marginBottom: 15,
  },
  pickerText: { fontSize: 16, color: Colors.textPrimary },
  textArea: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  checkbox: { marginRight: 10 },
  checkboxLabel: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  fullWidthInputContainer: { paddingHorizontal: 25 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerButton: {
    width: "48%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.headerBackground,
  },
  submitButton: {
    backgroundColor: Colors.headerBackground,
    borderColor: Colors.headerBackground,
  },
  submitButtonText: { fontSize: 16, fontWeight: "bold", color: Colors.white },
  buttonDisabled: { opacity: 0.7 },
  unitInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  unitInput: { flex: 1, height: 54, fontSize: 16 },
  unitText: { fontSize: 16, color: Colors.textSecondary, fontWeight: "600" },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    paddingRight: 30,
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    paddingRight: 30,
    marginBottom: 15,
  },
  iconContainer: { top: 18, right: 15 },
  placeholder: { color: Colors.placeholder },
});

export default AddPetScreen;
