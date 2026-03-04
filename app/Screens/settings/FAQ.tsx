import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Enable LayoutAnimation on Android ---
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants & Theme ---
const Colors = {
  background: '#F79C4E', // Main Orange
  backgroundLight: '#FFF6EE', 
  white: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  lightGray: '#F8F9FA', 
  shadowColor: '#000000',
  accent: '#FFAB91', 
};

// --- DATA: FAQ Content ---
const FAQ_DATA = [
  {
    id: 1,
    question: "What does this system do?",
    answer: "This system uses image-based scanning to help identify possible skin diseases in dogs and provides informational guidance through an assistive chatbot."
  },
  {
    id: 2,
    question: "Is this system a replacement for a veterinarian?",
    answer: "No. This system is designed for educational and assistive purposes only and does not replace professional veterinary diagnosis or treatment."
  },
  {
    id: 3,
    question: "How accurate is the skin disease detection?",
    answer: "The accuracy depends on image quality, lighting conditions, and the visibility of the affected skin area. The system provides a confidence level to help users understand the result."
  },
  {
    id: 4,
    question: "What type of images should I capture for better results?",
    answer: "For better detection accuracy:\n\n• Ensure good lighting\n• Capture a clear and close image of the affected area\n• Avoid blurry or filtered images\n• Keep the dog still during capture"
  },
  {
    id: 5,
    question: "Can the system detect all dog skin diseases?",
    answer: "No. The system can detect only selected common dog skin conditions based on the trained dataset. It may not recognize rare or unseen conditions."
  },
  {
    id: 6,
    question: "How does the chatbot help users?",
    answer: "The chatbot provides general information, usage guidance, and answers common questions. It does not provide medical diagnosis or prescriptions."
  },
  {
    id: 7,
    question: "Are my dog’s images and personal data safe?",
    answer: "Yes. The system stores data securely and does not share images or personal information with third parties. Users may delete their data at any time."
  },
  {
    id: 8,
    question: "Can I delete my scan history and images?",
    answer: "Yes. Users can delete individual scan records or clear all stored detection history through the system settings."
  },
  {
    id: 9,
    question: "Do I need an internet connection to use the system?",
    answer: "Some features may require an internet connection, such as chatbot responses or system updates. Image scanning may work offline depending on system configuration."
  },
  {
    id: 10,
    question: "Who developed this system?",
    answer: "This system was developed by fourth-year Bachelor of Science in Computer Science students from the Technological University of the Philippines – Manila as part of their undergraduate thesis."
  }
];

// --- Background Component ---
const BackgroundStickers = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <MaterialCommunityIcons name="paw" size={40} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', top: 50, right: 20, transform: [{ rotate: '15deg' }] }} />
    <MaterialCommunityIcons name="help-circle-outline" size={80} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', top: 20, left: -20, transform: [{ rotate: '-15deg' }] }} />
    <MaterialCommunityIcons name="dog" size={35} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', bottom: 40, right: 80, transform: [{ rotate: '-10deg' }] }} />
  </View>
);

// --- Accordion Component ---
const AccordionItem = ({ item }: { item: typeof FAQ_DATA[0] }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    // This creates the smooth slide animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={toggleExpand} 
        activeOpacity={0.7}
      >
        <View style={styles.questionContainer}>
          <Text style={[
            styles.questionText, 
            expanded && { color: Colors.background } // Highlight color when open
          ]}>
            {item.question}
          </Text>
        </View>
        <Feather 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={expanded ? Colors.background : Colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {/* Content only renders if expanded is true */}
      {expanded && (
        <View style={styles.cardContent}>
          <View style={styles.separator} />
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

const FAQScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header Section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <BackgroundStickers />
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Frequently Ask Questions</Text>
          <View style={{ width: 40 }} /> 
        </View>
        
        <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSubtitle}>Find answers to commonly asked questions about Furemedy.</Text>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {FAQ_DATA.map((item) => (
          <AccordionItem key={item.id} item={item} />
        ))}

        {/* Contact Support CTA */}
        <View style={styles.supportBox}>
          <Text style={styles.supportText}>Still have questions?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.lightGray },
  
  // Header
  headerContainer: {
    backgroundColor: Colors.background,
    paddingBottom: 30,
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0,
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
  heroContent: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Accordion Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden', // Important for animation to look clean
    // Shadow
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionContainer: {
    flex: 1,
    paddingRight: 10,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  answerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Footer / Support
  supportBox: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  supportText: {
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  contactButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
  },
});

export default FAQScreen;