// In app/components/ConfirmationModal.tsx

import React from 'react';
import { Image, ImageSourcePropType, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F79C4E',
  lightOrange: '#FDEFE0',
  textPrimary: '#333333',
  textSecondary: '#6c757d',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message?: string; // Optional detailed message
  imageSource: ImageSourcePropType; // To pass different images
  confirmButtonText?: string; // e.g., "Confirm" or "Delete"
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  imageSource,
  confirmButtonText = 'Confirm', // Default value
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Image
            source={imageSource} // Use the image from props
            style={styles.image}
          />
          <Text style={styles.titleText}>{title}</Text>
          
          {/* Render the detailed message only if it's provided */}
          {message && <Text style={styles.messageText}>{message}</Text>}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              {/* Use the button text from props */}
              <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryOrange,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: Colors.lightOrange,
  },
  cancelButtonText: {
    color: Colors.primaryOrange,
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: Colors.primaryOrange,
  },
  confirmButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConfirmationModal;