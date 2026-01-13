import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Constants & Color Palette ---
const Colors = {
  background: '#F79C4E', // Main Orange
  backgroundLight: '#FFF6EE',
  white: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#888888',
  lightGray: '#F8F9FA',
  shadowColor: '#000000',
  
  // Status Colors
  success: '#4CAF50', // Green for Healthy
  successLight: '#E8F5E9',
  warning: '#FF9800', // Orange for issues
  warningLight: '#FFF3E0',
  danger: '#F44336',  // Red for high confidence issues
  dangerLight: '#FFEBEE',
};

// --- Mock Data (Replace with API data later) ---
const MOCK_SCANS = [
  {
    id: '1',
    petName: 'Buddy',
    date: 'Today, 10:30 AM',
    diagnosis: 'Ringworm',
    confidence: 'High',
    status: 'danger', // danger, warning, or success
    imageUrl: null, // Replace with actual image URL
  },
  {
    id: '2',
    petName: 'Luna',
    date: 'Yesterday, 4:15 PM',
    diagnosis: 'Healthy',
    confidence: '98%',
    status: 'success',
    imageUrl: null,
  },
  {
    id: '3',
    petName: 'Max',
    date: 'Jan 8, 2026',
    diagnosis: 'Potential Fleas',
    confidence: 'Medium',
    status: 'warning',
    imageUrl: null,
  },
  {
    id: '4',
    petName: 'Bella',
    date: 'Jan 5, 2026',
    diagnosis: 'Healthy',
    confidence: '99%',
    status: 'success',
    imageUrl: null,
  },
];

// --- Background Component ---
const BackgroundStickers = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <MaterialCommunityIcons name="paw" size={40} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', top: 50, right: 20, transform: [{ rotate: '15deg' }] }} />
    <MaterialCommunityIcons name="magnify" size={80} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', top: 20, left: -20, transform: [{ rotate: '-15deg' }] }} />
    <MaterialCommunityIcons name="dog" size={35} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', bottom: 40, right: 80, transform: [{ rotate: '-10deg' }] }} />
  </View>
);

const ViewPastScans = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic (Simple client-side filter)
  const filteredScans = MOCK_SCANS.filter(scan => 
    scan.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return { bg: Colors.successLight, text: Colors.success };
      case 'warning': return { bg: Colors.warningLight, text: Colors.warning };
      case 'danger': return { bg: Colors.dangerLight, text: Colors.danger };
      default: return { bg: Colors.lightGray, text: Colors.textSecondary };
    }
  };

  const renderScanItem = ({ item }: { item: typeof MOCK_SCANS[0] }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => console.log('View Scan Details', item.id)}>
        
        {/* Left: Image Placeholder */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.petImage} />
          ) : (
            <View style={[styles.petImage, styles.petImagePlaceholder]}>
              <MaterialCommunityIcons name="dog-side" size={24} color={Colors.white} />
            </View>
          )}
        </View>

        {/* Middle: Info */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.petName}>{item.petName}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          
          <View style={styles.diagnosisContainer}>
            <Text style={styles.diagnosisLabel}>Result:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {item.diagnosis}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Arrow */}
        <Feather name="chevron-right" size={20} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* 1. Header Section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <BackgroundStickers />
        
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detection History</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* Floating Search Bar */}
        <View style={styles.searchContainerWrapper}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by pet or diagnosis..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* 2. List Section */}
      <View style={styles.listContainer}>
        <FlatList
          data={filteredScans}
          keyExtractor={(item) => item.id}
          renderItem={renderScanItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyText}>No scans found.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.lightGray },
  
  // Header
  headerContainer: {
    backgroundColor: Colors.background,
    paddingBottom: 30, // Extra padding for the search bar overlap
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },

  // Search Bar
  searchContainerWrapper: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: -50, // Pulls the list up, or pushes search down
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  // List
  listContainer: {
    flex: 1,
    paddingTop: 40, // Space for the floating search bar
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingTop: 20, // Extra space from search bar
    paddingBottom: 20,
  },

  // Card Item
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    // Shadow
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 15,
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },
  petImagePlaceholder: {
    backgroundColor: Colors.background, // Orange bg for placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  diagnosisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagnosisLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default ViewPastScans;