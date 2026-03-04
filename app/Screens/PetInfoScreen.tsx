import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

export default function PetInfoScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");

  const ages = [
    { key: '1', value: "Under 1 year" },
    { key: '2', value: "1-3 years" },
    { key: '3', value: "3-5 years" },
    
  ];
  
  const breeds = [
    { key: '1', value: "Aspin (Asong Pinoy)" },
    { key: '2', value: "Beagle" },
    { key: '3', value: "Bulldog" },
    { key: '4', value: "Chihuahua" },
    { key: '5', value: "Chow Chow" },
    { key: '6', value: "Corgi" },
    { key: '7', value: "Dachshund" },
    { key: '8', value: "Dalmatian" },
    { key: '9', value: "French Bulldog" },
    { key: '10', value: "German Shepherd" },
    { key: '11', value: "Golden Retriever" },
    { key: '12', value: "Labrador Retriever" },
    { key: '13', value: "Pomeranian" },
    { key: '14', value: "Poodle" },
    { key: '15', value: "Pug" },
    { key: '16', value: "Rottweiler" },
    { key: '17', value: "Siberian Husky" },
    { key: '18', value: "Shih Tzu" },
    { key: '19', value: "Terrier" },
    { key: '20', value: "Others" }
  ].sort((a, b) => a.value.localeCompare(b.value));

  // Validation: Name and Age are REQUIRED. Breed is OPTIONAL.
  const handleContinue = () => {
    if (!name.trim() || !age) {
      Alert.alert("Missing Information", "Please enter your pet's name and select an age to continue.");
      return;
    }

    // Determine the final breed value to pass
    let finalBreed = "Not specified";
    if (breed === "Others") {
      finalBreed = customBreed.trim() || "Others";
    } else if (breed) {
      finalBreed = breed;
    }

    router.push({
      pathname: '/Screens/PhotoTipsScreen' as any,
      params: { 
        petName: name, 
        petAge: age,
        petBreed: finalBreed
      }
    });
  };

  // Button is enabled only if Name and Age are filled
  const isFormValid = name.trim() !== "" && age !== "";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrapper}>
          <View>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={28} color="#E89152" />
            </TouchableOpacity>

            <View style={styles.stepper}>
              <View style={[styles.dot, styles.activeDot]}><Text style={styles.dotText}>1</Text></View>
              <View style={styles.line} />
              <View style={styles.dot}><Text style={styles.dotText}>2</Text></View>
              <View style={styles.line} />
              <View style={styles.dot}><Text style={styles.dotText}>3</Text></View>
              <View style={styles.line} />
              <View style={styles.dot}><Text style={styles.dotText}>4</Text></View>
            </View>

            <Text style={styles.title}>Pet's Information</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter name" 
                value={name} 
                onChangeText={setName} 
              />

              <Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
              <SelectList 
                setSelected={(val: string) => setAge(val)} 
                data={ages} 
                save="value"
                boxStyles={styles.dropdown}
                placeholder="Choose your pet's age"
                search={false}
              />

              <Text style={styles.label}>Breed (Optional)</Text>
              <SelectList 
                setSelected={(val: string) => setBreed(val)} 
                data={breeds} 
                save="value"
                boxStyles={styles.dropdown}
                placeholder="Search or select breed"
              />

              {breed === "Others" && (
                <View style={styles.customInputContainer}>
                  <Text style={styles.label}>Specify Breed</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Enter breed type" 
                    value={customBreed} 
                    onChangeText={setCustomBreed} 
                  />
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.continueBtn, !isFormValid && styles.disabledBtn]} 
            onPress={handleContinue}
            activeOpacity={isFormValid ? 0.7 : 1}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  wrapper: { flexGrow: 1, paddingHorizontal: 25, justifyContent: 'space-between', paddingBottom: 40 },
  backBtn: { marginTop: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  dot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center' },
  activeDot: { backgroundColor: '#E89152' },
  dotText: { color: '#FFF', fontWeight: 'bold' },
  line: { width: 40, height: 3, backgroundColor: '#E5E5E5' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#E89152', marginBottom: 20 },
  form: { marginTop: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 15 },
  required: { color: '#D9534F' },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 12, fontSize: 16 },
  dropdown: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 15 },
  customInputContainer: { marginTop: 5 },
  continueBtn: { backgroundColor: '#E89152', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 30 },
  disabledBtn: { backgroundColor: '#F2C6A5' },
  continueText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});