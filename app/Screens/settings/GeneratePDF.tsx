import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Constants & Theme ---
const Colors = {
  background: '#F79C4E', // Main Orange
  white: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  lightGray: '#F8F9FA',
  accent: '#E65100', // Darker orange for text accents
  border: '#FFE0B2',
};

// --- MOCK DATA (Static Content) ---
const REPORT_DATA = {
  owner: {
    name: "Arvin Ibarra",
    email: "hevarvin@gmail.com",
    mobile: "9290085543",
  },
  scan: {
    dogName: "Buddy",
    date: "January 10, 2026 - 2:30 PM",
    condition: "Ringworm (Dermatophytosis)",
    confidence: "96%",
    severity: "Moderate",
    // Placeholder image
    imageUrl: "https://placedog.net/500/500?id=10", 
  },
  summary: {
    explanation: "Ringworm is a fungal infection of the skin. It typically appears as a circular, red, itchy rash.",
    symptoms: "Circular hair loss, crusty skin, excessive scratching.",
    causes: "Contact with infected animals, bedding, or soil.",
  },
  recommendations: [
    "Isolate the dog from other pets and children.",
    "Clean and disinfect the dog's bedding and environment.",
    "Schedule a visit to the vet for antifungal medication."
  ],
  system: {
    name: "Furemedy System",
    version: "v1.0.0",
    team: "TUP - Manila (CS Dept)",
  }
};

// --- Background Component ---
const BackgroundStickers = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <MaterialCommunityIcons name="paw" size={40} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', top: 50, right: 20, transform: [{ rotate: '15deg' }] }} />
    <MaterialCommunityIcons name="file-chart-outline" size={80} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', top: 20, left: -20, transform: [{ rotate: '-15deg' }] }} />
    <MaterialCommunityIcons name="dog" size={35} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', bottom: 40, right: 80, transform: [{ rotate: '-10deg' }] }} />
  </View>
);

const ExportReportScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- STATIC ACTION ---
  const handleDownloadPress = () => {
    Alert.alert(
      "Report Preview",
      "This is a static preview of how the PDF report will look. PDF generation is currently disabled."
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <BackgroundStickers />
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Report</Text>
          <View style={{ width: 40 }} /> 
        </View>
        <Text style={styles.headerSubtitle}>Preview your scan report below</Text>
      </View>

      {/* Preview Section */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Paper Preview Card */}
        <View style={styles.paperCard}>
          
          {/* Paper Header */}
          <View style={styles.paperHeader}>
            <Text style={styles.brandTitle}>Furemedy Report</Text>
            <View style={styles.divider} />
          </View>

          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.label}>Owner</Text>
            <Text style={styles.value}>{REPORT_DATA.owner.name}</Text>
            <Text style={styles.valueSm}>{REPORT_DATA.owner.email}</Text>
          </View>

          {/* Scan Info */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Subject</Text>
              <Text style={styles.value}>{REPORT_DATA.scan.dogName}</Text>
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.label}>Date</Text>
               <Text style={styles.valueSm}>{REPORT_DATA.scan.date}</Text>
            </View>
          </View>

          {/* Image */}
          <View style={styles.imageSection}>
             <Image source={{ uri: REPORT_DATA.scan.imageUrl }} style={styles.previewImage} />
             <View style={styles.severityBadge}>
                <Text style={styles.severityText}>{REPORT_DATA.scan.severity}</Text>
             </View>
          </View>

          {/* Result */}
          <View style={styles.section}>
             <Text style={styles.label}>Detected Condition</Text>
             <Text style={styles.resultText}>{REPORT_DATA.scan.condition}</Text>
             <Text style={styles.valueSm}>Confidence: {REPORT_DATA.scan.confidence}</Text>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.label}>Summary</Text>
            <Text style={styles.bodyText}>{REPORT_DATA.summary.explanation}</Text>
            <Text style={[styles.label, { marginTop: 10 }]}>Symptoms</Text>
            <Text style={styles.bodyText}>{REPORT_DATA.summary.symptoms}</Text>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.label}>Recommendations</Text>
            {REPORT_DATA.recommendations.map((rec, index) => (
                <View key={index} style={{ flexDirection: 'row', marginBottom: 5 }}>
                    <Text style={{ marginRight: 5, color: '#555' }}>•</Text>
                    <Text style={styles.bodyText}>{rec}</Text>
                </View>
            ))}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Feather name="alert-circle" size={14} color="#D32F2F" />
            <Text style={styles.disclaimerText}>
              This report is for educational purposes only and not a substitute for veterinary diagnosis.
            </Text>
          </View>

          {/* Footer Info */}
          <View style={styles.paperFooter}>
            <Text style={styles.footerText}>Generated by Furemedy System</Text>
          </View>

        </View>

        {/* Spacer for Floating Button */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* Floating Action Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={handleDownloadPress}
        >
          <Feather name="download" size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.exportButtonText}>Download Report</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.lightGray },
  
  // Header
  headerContainer: {
    backgroundColor: Colors.background,
    paddingBottom: 30,
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
  headerSubtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: 5, fontSize: 13 },

  scrollContent: { padding: 20 },

  // Paper Preview Card
  paperCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 25,
    // Paper Shadow effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  paperHeader: { alignItems: 'center', marginBottom: 20 },
  brandTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.background, textTransform: 'uppercase', letterSpacing: 1 },
  divider: { width: 40, height: 3, backgroundColor: Colors.background, marginTop: 5, borderRadius: 2 },

  section: { marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 15 },
  label: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
  valueSm: { fontSize: 13, color: '#555' },
  bodyText: { fontSize: 13, color: '#444', lineHeight: 20 },
  
  resultText: { fontSize: 18, color: Colors.accent, fontWeight: 'bold' },

  // Image Preview
  imageSection: { alignItems: 'center', marginVertical: 15, position: 'relative' },
  previewImage: { 
    width: '100%', 
    height: 220, 
    borderRadius: 12, 
    borderWidth: 4, 
    borderColor: Colors.background 
  },
  severityBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  severityText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  // Disclaimer
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D32F2F',
    alignItems: 'center',
  },
  disclaimerText: { fontSize: 11, color: '#D32F2F', marginLeft: 8, flex: 1, fontStyle: 'italic' },
  
  paperFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, alignItems: 'center' },
  footerText: { color: '#ccc', fontSize: 10 },

  // Bottom Button
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  exportButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ExportReportScreen;