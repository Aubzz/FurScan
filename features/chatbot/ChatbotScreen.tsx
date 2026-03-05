import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

const ChatbotScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chatbot Screen</Text>
      <Text style={styles.subtitle}>This page is under construction.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
});

export default ChatbotScreen; 