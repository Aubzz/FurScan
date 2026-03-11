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

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isWithinTokenLimit } from "../components/TokenCounter";

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
  placeholder = "Ask me anything...",
}) => {
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);

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
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom + 6 : 8,
        },
      ]}
    >
      <View
        style={[
          styles.composer,
          {
            borderColor: isFocused ? "#F79C4E" : "#D4D4D4",
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isFocused ? "#FFF8F2" : "#FFFFFF",
            },
          ]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={handleSend}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            placeholderTextColor="#8E8E8E"
            multiline={false}
            returnKeyType="send"
            blurOnSubmit={false}
            maxLength={2000}
            editable={!isLoading && !isDisabled}
            style={styles.textInput}
          />
        </View>

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          onHoverIn={() => setIsSendHovered(true)}
          onHoverOut={() => setIsSendHovered(false)}
          style={[
            styles.sendButton,
            {
              backgroundColor: isSendHovered ? "#F9B489" : "#F7924A",
              opacity: 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="arrow-up"
              size={19}
              color="#fff"
              style={styles.sendIcon}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 3,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 6,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    marginRight: 10,
  },
  textInput: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.1,
    color: "#222222",
    maxHeight: 82,
    minHeight: 38,
    paddingVertical: 6,
    lineHeight: 20,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  sendIcon: {
    marginTop: -1,
  },
});

export default ChatInput;
