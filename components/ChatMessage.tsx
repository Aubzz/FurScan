/**
 * ChatMessage.tsx
 *
 * Reusable component for displaying individual chat messages
 * Handles:
 * - User vs assistant message styling
 * - Text formatting (bold, italics)
 * - Answer option buttons for quick responses
 * - Responsive sizing based on content
 */

import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ChatMessageProps {
  role: "user" | "assistant";
  text: string;
  createdAt?: string;
  onOptionPress?: (option: string) => void;
  isLoading?: boolean;
  answerOptions?: string[];
}

/**
 * Component for formatted text with bold support
 * Parses **text** syntax for bold formatting
 */
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontWeight: "700" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

/**
 * Extract answer options from bot message text
 * Looks for parentheses with options or yes/no questions
 */
const extractAnswerOptions = (text: string): string[] => {
  if (!text.includes("?")) return [];

  // Look for parentheses with options
  const parenthesesMatch = text.match(/\(([^)]+)\)/g);
  if (parenthesesMatch) {
    for (const match of parenthesesMatch) {
      const options = match
        .slice(1, -1)
        .split("/")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
      if (options.length >= 2) return options;
    }
  }

  // Check for yes/no question patterns
  const yesNoPatterns = [
    /\(Yes\s*\/\s*No\)/i,
    /Yes\s*or\s*No/i,
    /\bYes\b.*\bNo\b/i,
  ];
  if (yesNoPatterns.some((pattern) => pattern.test(text))) return ["Yes", "No"];

  // Default yes/no for any question
  const standaloneQuestionStart =
    /^(Is|Are|Do|Did|Can|Could|Would|Should|Have|Has|Will|Might)\s/i;
  if (standaloneQuestionStart.test(text.trim())) return ["Yes", "No"];

  return [];
};

/**
 * Main ChatMessage Component
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  text,
  onOptionPress,
  answerOptions: providedOptions,
}) => {
  // Use provided options or extract from text
  const answerOptions =
    providedOptions || (role === "assistant" ? extractAnswerOptions(text) : []);

  const isUser = role === "user";

  return (
    <View style={{ marginVertical: 7 }}>
      {isUser ? (
        <View
          style={{
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#F79C4E",
              borderRadius: 13,
              paddingHorizontal: 12,
              paddingVertical: 9,
              maxWidth: "77%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#FFFFFF",
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              <FormattedText text={text} />
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              overflow: "hidden",
              marginRight: 8,
              borderWidth: 1,
              borderColor: "#D8D8D8",
              backgroundColor: "#FFF",
            }}
          >
            <Image
              source={require("../assets/images/dogbot.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>

          <View
            style={{
              backgroundColor: "#ececec",
              borderRadius: 13,
              paddingHorizontal: 12,
              paddingVertical: 9,
              maxWidth: "70%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#232323",
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              <FormattedText text={text} />
            </Text>
          </View>
        </View>
      )}

      {/* Answer Options (for assistant messages with options) */}
      {answerOptions.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            marginTop: 8,
            gap: 8,
            alignSelf: isUser ? "flex-end" : "flex-start",
            marginLeft: isUser ? 0 : 32,
            flexWrap: "wrap",
          }}
        >
          {answerOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onOptionPress?.(option)}
              style={{
                backgroundColor: "#F79C4E",
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default ChatMessage;
