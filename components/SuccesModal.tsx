import { useFonts } from 'expo-font';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  primaryOrange: '#F7924A',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Define the props the component will accept
interface SuccessModalProps {
  visible: boolean;
  onConfirm: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onConfirm }) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Password Updated</Text>
          <Text style={styles.subtitle}>
            Your password has been changed successfully.{'\n'}You&apos;re all set to continue!
          </Text>
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 60,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});

export default SuccessModal;