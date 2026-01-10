import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { resetConversation, sendMessage } from "../services/botpressApi";

// Typing animation
const TypingDots = () => {
  return (
    <View style={{ flexDirection: "row", padding: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#999", marginHorizontal: 2, opacity: 0.3 }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#999", marginHorizontal: 2, opacity: 0.6 }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#999", marginHorizontal: 2, opacity: 1 }} />
    </View>
  );
};

// Component to render text with bold formattingg
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <Text style={{ color: "inherit" }}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontWeight: "bold" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

// Helper function to extract answer options from a system message
const extractAnswerOptions = (text: string): string[] => {
  // Check if it's a question
  if (!text.includes("?")) {
    return [];
  }
  
  // Pattern 1: Extract (Option1 / Option2 / Option3) format
  const parenthesesMatch = text.match(/\(([^)]+)\)/g);
  if (parenthesesMatch) {
    for (const match of parenthesesMatch) {
      const options = match
        .slice(1, -1) // Remove parentheses
        .split("/")
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);
      
      // Only return if we found valid options (2 or more)
      if (options.length >= 2) {
        return options;
      }
    }
  }
  
  // Pattern 2: Check for explicit yes/no indicators
  const yesNoPatterns = [
    /\(Yes\s*\/\s*No\)/i,
    /Yes\s*or\s*No/i,
    /\bYes\b.*\bNo\b/i,
  ];
  
  if (yesNoPatterns.some(pattern => pattern.test(text))) {
    return ["Yes", "No"];
  }
  
  // Pattern 3: Standalone yes/no questions (Is, Are, Do, Did, Can, Could, Would, Should)
  const standaloneQuestionStart = /^(Is|Are|Do|Did|Can|Could|Would|Should|Have|Has|Will|Might)\s/i;
  if (standaloneQuestionStart.test(text.trim())) {
    return ["Yes", "No"];
  }
  
  return [];
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Reset conversation when leaving the chatbot screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        resetConversation();
      };
    }, [])
  );

  const send = async (text: string) => {
    setChat((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await sendMessage(text);
      setChat((prev) => [...prev, { role: "assistant", text: response }]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      send(message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Header */}
      <View style={{ paddingTop: 50, paddingBottom: 8, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eee" }}>
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Chat with AI bot</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 24 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={{ alignItems: "center", paddingVertical: 10 }}>
        <Image
          source={require("../../assets/images/samplecat.png")}
          style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 5 }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Good morning, [Name]</Text>
        <Text style={{ color: "#777", marginTop: 3, fontSize: 13 }}>
          How can I help you and your pet?
        </Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={chat}
        keyExtractor={(_, index) => index.toString()}
        style={{ flex: 1, paddingHorizontal: 15, paddingBottom: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item, index }) => {
          const answerOptions = item.role === "assistant" ? extractAnswerOptions(item.text) : [];
          
          return (
            <View style={{ marginVertical: 5 }}>
              <View
                style={{
                  alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: item.role === "user" ? "#F79C4E" : "#E5E5EA",
                  padding: 12,
                  borderRadius: 15,
                  maxWidth: "80%",
                }}
              >
                <FormattedText 
                  text={item.text} 
                />
              </View>
              
              {/* Answer Option Buttons for Assistant Messages */}
              {answerOptions.length > 0 && (
                <View style={{ flexDirection: "row", marginTop: 10, gap: 8, alignSelf: "flex-start", flexWrap: "wrap" }}>
                  {answerOptions.map((option, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => send(option)}
                      disabled={loading}
                      style={{
                        backgroundColor: "#F79C4E",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          loading ? (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#E5E5EA",
                padding: 10,
                borderRadius: 15,
                marginVertical: 10,
              }}
            >
              <TypingDots />
            </View>
          ) : null
        }
      />

      {/* Input - Fixed at bottom above tab bar */}
      <View
        style={{
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#ddd",
          paddingHorizontal: 10,
          paddingVertical: 15,
          paddingBottom: 120,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {/* Text Input */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            placeholder="Ask me anything about your pet's skin & care..."
            placeholderTextColor="#999"
            style={{
              flex: 1,
              backgroundColor: "#F5F5F5",
              paddingHorizontal: 15,
              paddingVertical: 12,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#DDD",
              fontSize: 14,
              minHeight: 45,
            }}
          />

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={loading}
            style={{
              minWidth: 45,
              height: 45,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#F79C4E" />
            ) : (
              <Text style={{ fontSize: 20 }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}
