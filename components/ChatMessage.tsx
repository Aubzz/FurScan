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

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  text: string;
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
    <Text style={{ color: 'inherit' }}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} style={{ fontWeight: 'bold' }}>
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
  if (!text.includes('?')) return [];
  
  // Look for parentheses with options
  const parenthesesMatch = text.match(/\(([^)]+)\)/g);
  if (parenthesesMatch) {
    for (const match of parenthesesMatch) {
      const options = match.slice(1, -1)
        .split('/')
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);
      if (options.length >= 2) return options;
    }
  }
  
  // Check for yes/no question patterns
  const yesNoPatterns = [
    /\(Yes\s*\/\s*No\)/i,
    /Yes\s*or\s*No/i,
    /\bYes\b.*\bNo\b/i
  ];
  if (yesNoPatterns.some(pattern => pattern.test(text))) return ['Yes', 'No'];
  
  // Default yes/no for any question
  const standaloneQuestionStart = /^(Is|Are|Do|Did|Can|Could|Would|Should|Have|Has|Will|Might)\s/i;
  if (standaloneQuestionStart.test(text.trim())) return ['Yes', 'No'];
  
  return [];
};

/**
 * Main ChatMessage Component
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  text,
  onOptionPress,
  answerOptions: providedOptions
}) => {
  // Use provided options or extract from text
  const answerOptions = providedOptions || (role === 'assistant' ? extractAnswerOptions(text) : []);
  
  const isUser = role === 'user';
  const messageBackgroundColor = isUser ? '#F79C4E' : '#E5E5EA';
  const messageTextColor = isUser ? '#fff' : '#000';

  return (
    <View style={{ marginVertical: 5 }}>
      {/* Message Bubble */}
      <View
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: messageBackgroundColor,
          padding: 12,
          borderRadius: 15,
          maxWidth: '80%',
        }}
      >
        <Text style={{ fontSize: 16, color: messageTextColor }}>
          <FormattedText text={text} />
        </Text>
      </View>

      {/* Answer Options (for assistant messages with options) */}
      {answerOptions.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
            gap: 8,
            alignSelf: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {answerOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onOptionPress?.(option)}
              style={{
                backgroundColor: '#F79C4E',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
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
