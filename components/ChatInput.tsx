/**
 * ChatInput.tsx
 * 
 * Reusable input component for composing chat messages
 * Handles:
 * - Text input with placeholder
 * - Send button with loading indicator
 * - Token limit enforcement
 * - Accessibility and keyboard handling
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { isWithinTokenLimit } from '../app/services/tokenCounter';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  currentTokens?: number;
  maxTokens?: number;
  placeholder?: string;
}

/**
 * ChatInput Component
 * Manages message composition with token awareness
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSendMessage,
  isLoading = false,
  isDisabled = false,
  currentTokens = 0,
  maxTokens = 1000,
  placeholder = 'Ask me anything...',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Check if message would exceed token limit
  const canSend = 
    !isDisabled && 
    !isLoading && 
    value.trim().length > 0 &&
    isWithinTokenLimit(currentTokens, value, maxTokens);

  const handleSend = () => {
    if (canSend) {
      onSendMessage();
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 1 : 15,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSend}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={2000}
          editable={!isLoading && !isDisabled}
          style={{
            flex: 1,
            backgroundColor: '#F5F5F5',
            paddingHorizontal: 15,
            paddingVertical: 12,
            borderRadius: 25,
            borderWidth: 1,
            borderColor: isFocused ? '#F79C4E' : '#DDD',
            fontSize: 14,
            maxHeight: 100, // Allow multi-line with max height
          }}
        />

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={{
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: canSend ? '#F79C4E' : '#CCCCCC',
            borderRadius: 22.5,
            opacity: canSend ? 1 : 0.6,
          }}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 24, color: '#fff' }}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;
