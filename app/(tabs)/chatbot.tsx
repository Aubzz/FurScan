import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { resetConversation, sendMessage } from "../services/botpressApi";

// Typing animation
const TypingDots = () => {
  const animValue1 = useRef(new Animated.Value(0)).current;
  const animValue2 = useRef(new Animated.Value(0)).current;
  const animValue3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animValue1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(animValue2, {
            toValue: 1,
            duration: 300,
            delay: 100,
            useNativeDriver: false,
          }),
          Animated.timing(animValue3, {
            toValue: 1,
            duration: 300,
            delay: 200,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animValue1, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(animValue2, {
            toValue: 0,
            duration: 300,
            delay: 100,
            useNativeDriver: false,
          }),
          Animated.timing(animValue3, {
            toValue: 0,
            duration: 300,
            delay: 200,
            useNativeDriver: false,
          }),
        ]),
      ]).start(startAnimation);
    };

    startAnimation();
  }, [animValue1, animValue2, animValue3]);

  return (
    <View style={{ flexDirection: "row", padding: 5 }}>
      <Animated.View style={{ 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: "#999", 
        marginHorizontal: 2, 
        opacity: animValue1 
      }} />
      <Animated.View style={{ 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: "#999", 
        marginHorizontal: 2, 
        opacity: animValue2 
      }} />
      <Animated.View style={{ 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: "#999", 
        marginHorizontal: 2, 
        opacity: animValue3 
      }} />
    </View>
  );
};

// Component to render text with bold formatting
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

const extractAnswerOptions = (text: string): string[] => {
  if (!text.includes("?")) return [];
  const parenthesesMatch = text.match(/\(([^)]+)\)/g);
  if (parenthesesMatch) {
    for (const match of parenthesesMatch) {
      const options = match.slice(1, -1).split("/").map(opt => opt.trim()).filter(opt => opt.length > 0);
      if (options.length >= 2) return options;
    }
  }
  const yesNoPatterns = [/\(Yes\s*\/\s*No\)/i, /Yes\s*or\s*No/i, /\bYes\b.*\bNo\b/i];
  if (yesNoPatterns.some(pattern => pattern.test(text))) return ["Yes", "No"];
  const standaloneQuestionStart = /^(Is|Are|Do|Did|Can|Could|Would|Should|Have|Has|Will|Might)\s/i;
  if (standaloneQuestionStart.test(text.trim())) return ["Yes", "No"];
  return [];
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; messages: { role: "user" | "assistant"; text: string }[] }>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetConversation();
      };
    }, [])
  );

  const send = async (text: string) => {
    // Initialize a new chat if no current chat exists
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
        messages: [{ role: "user" as const, text }]
      };
      setChatHistory([newChat]);
      setCurrentChatId(newChatId);
      setChat([{ role: "user", text }]);
    } else {
      setChat((prev) => [...prev, { role: "user", text }]);
    }
    setMessage("");
    setLoading(true);

    try {
      const response = await sendMessage(text);
      setChat((prev) => {
        const updated: { role: "user" | "assistant"; text: string }[] = [...prev, { role: "assistant", text: response }];
        updateChatHistory(updated);
        return updated;
      });
    } catch (err) {
      setChat((prev) => {
        const updated: { role: "user" | "assistant"; text: string }[] = [
          ...prev,
          { role: "assistant", text: "Sorry, something went wrong." },
        ];
        updateChatHistory(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      send(message);
    }
  };

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: []
    };
    setChatHistory([newChat, ...chatHistory]);
    setCurrentChatId(newChatId);
    setChat([]);
    setMessage("");
    setSidebarVisible(false);
    resetConversation();
  };

  const loadChatHistory = (chatId: string) => {
    const selectedChat = chatHistory.find(c => c.id === chatId);
    if (selectedChat) {
      setCurrentChatId(chatId);
      setChat(selectedChat.messages);
      setMessage("");
      setSidebarVisible(false);
    }
  };

  const updateChatHistory = (newMessages: { role: "user" | "assistant"; text: string }[]) => {
    setChatHistory(prevHistory =>
      prevHistory.map(c => {
        if (c.id === currentChatId) {
          const firstUserMessage = newMessages.find(m => m.role === "user");
          return {
            ...c,
            title: firstUserMessage ? firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? "..." : "") : "New Chat",
            messages: newMessages
          };
        }
        return c;
      })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>

          {/* Header */}
          <View style={{ paddingTop: 10, paddingBottom: 8, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eee" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 24, fontWeight: "300" }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Chat with AI bot</Text>
            <TouchableOpacity onPress={() => setSidebarVisible(true)} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
              <Text style={{ fontSize: 24 }}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Info Modal Overlay */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={infoVisible}
            onRequestClose={() => setInfoVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>How to use Chatbot</Text>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 15, color: '#444', marginBottom: 10 }}>• This chatbot provides educational information only about specific dog skin-related conditions.</Text>
                  <Text style={{ fontSize: 15, color: '#444', marginBottom: 10 }}>• It is not a diagnostic tool and cannot replace a licensed veterinarian.</Text>
                  <Text style={{ fontSize: 15, color: '#444', marginBottom: 10 }}>• For accurate diagnosis and treatment, consult a veterinarian.</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setInfoVisible(false)}
                  style={{ backgroundColor: '#F79C4E', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Got it!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Sidebar Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={sidebarVisible}
            onRequestClose={() => setSidebarVisible(false)}
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
              <View style={{ flex: 1 }}>
                {/* Sidebar Header */}
                <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>Chat History</Text>
                  <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                    <Text style={{ fontSize: 24 }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* New Chat Button */}
                <TouchableOpacity
                  onPress={startNewChat}
                  style={{ marginHorizontal: 15, marginVertical: 15, backgroundColor: "#F79C4E", paddingVertical: 12, borderRadius: 10, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>+ New Chat</Text>
                </TouchableOpacity>

                {/* Chat History List */}
                <ScrollView style={{ flex: 1, paddingHorizontal: 15 }}>
                  {chatHistory.length === 0 ? (
                    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                      <Text style={{ color: "#999", fontSize: 14 }}>No chat history yet</Text>
                    </View>
                  ) : (
                    chatHistory.map((historyItem) => (
                      <TouchableOpacity
                        key={historyItem.id}
                        onPress={() => loadChatHistory(historyItem.id)}
                        style={{
                          backgroundColor: currentChatId === historyItem.id ? "#F5F5F5" : "#fff",
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          marginVertical: 5,
                          borderRadius: 8,
                          borderLeftWidth: currentChatId === historyItem.id ? 3 : 0,
                          borderLeftColor: currentChatId === historyItem.id ? "#F79C4E" : "transparent"
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#333", fontWeight: "500" }}>
                          {historyItem.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                          {historyItem.messages.length} messages
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </SafeAreaView>
          </Modal>

          {/* Greeting */}
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <Image
              source={require("../../assets/images/dogbot.png")}
              style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 5 }}
            />
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Good morning, Friend</Text>
            <Text style={{ color: "#777", marginTop: 3, fontSize: 13 }}>
              How can I help you and your pet?
            </Text>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={chat}
            keyExtractor={(_, index) => index.toString()}
            style={{ flex: 1, paddingHorizontal: 15 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const answerOptions = item.role === "assistant" ? extractAnswerOptions(item.text) : [];
              return (
                <View style={{ marginVertical: 5 }}>
                  <View style={{
                    alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                    backgroundColor: item.role === "user" ? "#F79C4E" : "#E5E5EA",
                    padding: 12,
                    borderRadius: 15,
                    maxWidth: "80%",
                  }}>
                    <Text style={{ fontSize: 16, color: item.role === "user" ? "#fff" : "#000" }}>
                      <FormattedText text={item.text} />
                    </Text>
                  </View>
                  {answerOptions.length > 0 && (
                    <View style={{ flexDirection: "row", marginTop: 10, gap: 8, alignSelf: "flex-start", flexWrap: "wrap" }}>
                      {answerOptions.map((option, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => send(option)}
                          disabled={loading}
                          style={{ backgroundColor: "#F79C4E", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, opacity: loading ? 0.6 : 1 }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            }}
            ListFooterComponent={loading ? (
              <View style={{ alignSelf: "flex-start", backgroundColor: "#E5E5EA", padding: 10, borderRadius: 15, marginVertical: 10 }}>
                <TypingDots />
              </View>
            ) : null}
          />

          {/* Input - Flush with bottom */}
          <View style={{
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderColor: "#ddd",
            paddingHorizontal: 10,
            paddingTop: 10,
            paddingBottom: Platform.OS === "ios" ? 1 : 15,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
                placeholder="Ask me anything..."
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
                }}
              />
              <TouchableOpacity onPress={handleSendMessage} disabled={loading} style={{ width: 35, height: 35, justifyContent: "center", alignItems: "center", backgroundColor: "#F79C4E", borderRadius: 22.5 }}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 24, color: "#fff" }}>➤</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}