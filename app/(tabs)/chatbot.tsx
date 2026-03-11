/**
 * chatbot.tsx
 *
 * Main Chat Screen Component
 *
 * Architecture:
 * - Uses Gemini API for AI responses
 * - Integrates with backend for chat session and message persistence
 * - Implements token tracking per session with limit enforcement
 * - Responsive layout with persistent sidebar (desktop) or modal sidebar (mobile)
 * - Clean separation of concerns with modular components
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatInput from "../../components/ChatInput";
import ChatMessage from "../../components/ChatMessage";
import ChatSidebar from "../../components/ChatSidebar";
import { useAuth } from "../../contexts/AuthContext";
import {
  addChatMessage,
  ChatMessage as ChatMessageType,
  ChatSession,
  createChatSession,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  updateChatSession,
} from "../services/chatApi";
import {
  resetConversation,
  sendMessage,
  type ChatContext,
} from "../services/geminiapi";
import { estimateTokens } from "../services/tokenCounter";

const INITIAL_CHATBOT_MESSAGE = `Hello! I'm **FurScan Assistant** 🐶

I’m here to help answer questions about **common skin diseases in dogs**, including:

• Fungal Infection
• Ringworm
• Dermatitis
• Sarcoptic Mange
• Demodectic Mange
• Hypersensitivity Dermatitis

You can ask about symptoms, possible causes, treatment options, or prevention tips.

Example questions you can try:
• "What are the symptoms of ringworm in dogs?"
• "What causes sarcoptic mange?"
• "Why is my dog scratching constantly?"

If you already analyzed an image using **FurScan**, you can also ask questions about the result.

How can I help with your dog's skin condition today?`;

// ===== TYPING ANIMATION COMPONENT =====

/**
 * TypingDots: Animated component showing bot is thinking
 */
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
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#fff",
          marginHorizontal: 2,
          opacity: animValue1,
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#fff",
          marginHorizontal: 2,
          opacity: animValue2,
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#fff",
          marginHorizontal: 2,
          opacity: animValue3,
        }}
      />
    </View>
  );
};

// ===== MAIN SCREEN COMPONENT =====

export default function ChatbotScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const isMobile = screenWidth < 768;

  // ===== STATE MANAGEMENT =====

  // Chat UI state
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Chat session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null,
  );
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Token state
  const [tokenLimitExceeded, setTokenLimitExceeded] = useState(false);
  const isSendingRef = useRef(false);

  // UI references
  const flatListRef = useRef<FlatList>(null);

  // ===== EFFECTS =====

  /**
   * Load chat sessions when user authenticates or screen focuses
   */
  useFocusEffect(
    useCallback(() => {
      if (token && user) {
        loadSessions();
      }
      return () => {
        // Reset conversation when leaving screen
        resetConversation();
      };
    }, [token, user]),
  );

  /**
   * Scroll to bottom when messages update
   */
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // ===== SESSION MANAGEMENT =====

  /**
   * Load all chat sessions for the user
   */
  const loadSessions = async () => {
    if (!token) return;

    try {
      setSessionsLoading(true);
      const fetchedSessions = await getChatSessions(token);
      setSessions(fetchedSessions);

      // If no current session, create one
      if (!currentSession && fetchedSessions.length === 0) {
        await startNewChat();
      } else if (!currentSession && fetchedSessions.length > 0) {
        // Load most recent session
        await selectSession(fetchedSessions[0].id);
      }
    } catch (err) {
      console.error("❌ Error loading sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  /**
   * Create a new chat session
   */
  const startNewChat = async () => {
    if (!token) return;

    try {
      const newSession = await createChatSession(token, "New Chat");
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      setMessageText("");
      setTokenLimitExceeded(false);
      resetConversation();
      setSidebarVisible(false);

      console.log(`✅ Started new chat session ${newSession.id}`);
    } catch (err) {
      console.error("❌ Error creating session:", err);
      alert("Failed to create new chat session");
    }
  };

  /**
   * Select and load a specific chat session
   */
  const selectSession = async (sessionId: number) => {
    if (!token) return;

    try {
      const session = await getChatSession(token, sessionId);
      setCurrentSession(session);
      setMessages(session.messages || []);
      setMessageText("");

      // Update token limit check
      const exceeded = session.total_tokens_used >= session.max_token_limit;
      setTokenLimitExceeded(exceeded);

      setSidebarVisible(false);
      console.log(`✅ Loaded session ${sessionId}`);
    } catch (err) {
      console.error("❌ Error loading session:", err);
      alert("Failed to load chat session");
    }
  };

  /**
   * Delete a chat session
   */
  const deleteSession = async (sessionId: number) => {
    if (!token) return;

    try {
      await deleteChatSession(token, sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));

      // If deleted session was current, load another or create new
      if (currentSession?.id === sessionId) {
        if (sessions.length > 1) {
          const nextSession = sessions.find((s) => s.id !== sessionId);
          if (nextSession) await selectSession(nextSession.id);
        } else {
          await startNewChat();
        }
      }

      console.log(`✅ Deleted session ${sessionId}`);
    } catch (err) {
      console.error("❌ Error deleting session:", err);
      alert("Failed to delete chat session");
    }
  };

  // ===== MESSAGE HANDLING =====

  const extractDetectedFeatures = (texts: string[]): string[] => {
    const combined = texts.join(" ").toLowerCase();
    const features: string[] = [];

    if (/\bred(ness)?\b|\binflamed?\b/.test(combined)) features.push("redness");
    if (/\bscal(y|ing)\b|\bflak(y|ing)\b|\bpeel(ing)?\b/.test(combined))
      features.push("scaling");
    if (/\bhair loss\b|\bbald\b|\bfur loss\b/.test(combined))
      features.push("hair loss");
    if (/\bcircular\b.*\bbald\b|\bring[- ]?shaped\b|\bringworm\b/.test(combined))
      features.push("circular bald patches");

    return features;
  };

  const extractPossibleCause = (texts: string[]): string | undefined => {
    const combined = texts.join(" ");
    const causes = [
      "Dermatophytosis (Ringworm)",
      "Dermatitis",
      "Demodectic Mange",
      "Sarcoptic Mange",
      "Hypersensitivity",
    ];
    return causes.find((cause) => new RegExp(cause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(combined));
  };

  const extractUrgencyLevel = (texts: string[]): string | undefined => {
    const combined = texts.join(" ");
    if (/Urgent Veterinary Care/i.test(combined)) return "Urgent Veterinary Care";
    if (/Schedule Veterinary Visit/i.test(combined))
      return "Schedule Veterinary Visit";
    if (/Monitor at Home/i.test(combined)) return "Monitor at Home";
    return undefined;
  };

  /**
   * Send a message to the bot
   */
  const sendChatMessage = async (text: string) => {
    if (!text.trim() || !currentSession || !token || isSendingRef.current) return;
    isSendingRef.current = true;

    // Estimate tokens for this message
    const userTokens = estimateTokens(text);
    const projectedTotal =
      (currentSession?.total_tokens_used || 0) + userTokens;

    // Check token limit
    if (projectedTotal > currentSession.max_token_limit) {
      setTokenLimitExceeded(true);
      alert("Token limit reached. Please start a new chat to continue.");
      return;
    }

    // Add user message to local state
    const userMessage: ChatMessageType = {
      id: 0, // Temporary ID until saved to backend
      session_id: currentSession.id,
      role: "user",
      content: text,
      tokens_used: userTokens,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setMessageText("");
    setLoading(true);

    try {
      // Save user message to backend
      await addChatMessage(token, currentSession.id, "user", text, userTokens);

      // Get bot response with structured context
      const recentMessages = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const contextTextPool = [...recentMessages.map((m) => m.content), text];
      const chatContext: ChatContext = {
        detectedFeatures: extractDetectedFeatures(contextTextPool),
        symptomAnswers: messages
          .filter((m) => m.role === "user")
          .slice(-4)
          .map((m) => m.content),
        possibleCause: extractPossibleCause(contextTextPool),
        urgencyLevel: extractUrgencyLevel(contextTextPool),
        recentMessages,
      };
      const botResponse = await sendMessage(text, chatContext);

      // Estimate bot response tokens
      const botTokens = estimateTokens(botResponse);

      // Add bot message to local state
      const assistantMessage: ChatMessageType = {
        id: 0, // Temporary ID
        session_id: currentSession.id,
        role: "assistant",
        content: botResponse,
        tokens_used: botTokens,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save bot message to backend
      await addChatMessage(
        token,
        currentSession.id,
        "assistant",
        botResponse,
        botTokens,
      );

      // Refresh session to get updated token count
      const updatedSession = await getChatSession(token, currentSession.id);
      setCurrentSession(updatedSession);

      // Update session title if this is the first message
      if (messages.length === 0) {
        const firstMessageText =
          text.substring(0, 50) + (text.length > 50 ? "..." : "");
        await updateChatSession(token, currentSession.id, {
          title: firstMessageText,
        });

        // Update local sessions list
        setSessions(
          sessions.map((s) =>
            s.id === currentSession.id ? { ...s, title: firstMessageText } : s,
          ),
        );
      }

      // Check if approaching limit
      if (updatedSession.total_tokens_used >= updatedSession.max_token_limit) {
        setTokenLimitExceeded(true);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);

      // Remove user message from local state if failed
      setMessages(messages.filter((m, i) => i !== messages.length - 1));

      // Handle token limit error
      if ((err as any)?.response?.status === 403) {
        setTokenLimitExceeded(true);
        alert("Token limit exceeded. Please start a new chat.");
        return;
      }

      // Generic error
      const errorMessage: ChatMessageType = {
        id: 0,
        session_id: currentSession.id,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      isSendingRef.current = false;
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendChatMessage(messageText);
    }
  };

  // ===== RENDER =====

  // Determine layout based on screen size
  const showPersistentSidebar = !isMobile && sessions.length > 0;
  const usedTokens = currentSession?.total_tokens_used ?? 0;
  const maxTokens = currentSession?.max_token_limit ?? 1000;
  const tokenPercentage = Math.min(
    Math.round((usedTokens / Math.max(maxTokens, 1)) * 100),
    100,
  );
  const remainingTokens = Math.max(maxTokens - usedTokens, 0);
  const displayedMessages: ChatMessageType[] =
    messages.length === 0 && currentSession
      ? [
          {
            id: -1,
            session_id: currentSession.id,
            role: "assistant",
            content: INITIAL_CHATBOT_MESSAGE,
            tokens_used: 0,
            created_at: new Date().toISOString(),
          },
        ]
      : messages;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* ===== PERSISTENT SIDEBAR (Desktop) ===== */}
          {showPersistentSidebar && (
            <ChatSidebar
              sessions={sessions}
              currentSessionId={currentSession?.id || null}
              onSelectSession={selectSession}
              onNewChat={startNewChat}
              onDeleteChat={deleteSession}
              isLoading={sessionsLoading}
              isModal={false}
            />
          )}

          {/* ===== MAIN CHAT AREA ===== */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
            }}
          >
            {/* Header */}
            <View
              style={{
                paddingTop: insets.top + 10, // Added inset.top to account for the notch safely
                paddingBottom: 10,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: "#E7E7E7",
                backgroundColor: "#FFFFFF",
                minHeight: 64 + insets.top,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.75}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FFF3EA",
                  borderWidth: 1,
                  borderColor: "#F8D9C3",
                }}
              >
                <Ionicons name="chevron-back" size={22} color="#F7924A" />
              </TouchableOpacity>

              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#1A1A1A",
                    letterSpacing: -0.3,
                  }}
                >
                  <Text style={{ color: "#F7924A", fontWeight: "800" }}>
                    FurScan AI
                  </Text>{" "}
                  <Text style={{ color: "#1A1A1A", fontWeight: "700" }}>
                    Bot
                  </Text>
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#757575",
                    marginTop: 2,
                  }}
                >
                  Ask anything about your pet’s skin health
                </Text>
              </View>

              {isMobile && (
                <TouchableOpacity
                  onPress={() => setSidebarVisible(true)}
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.5 : 1,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#FFF3EA",
                    borderWidth: 1,
                    borderColor: "#F8D9C3",
                  }}
                >
                  <Ionicons name="menu" size={20} color="#F7924A" />
                </TouchableOpacity>
              )}
              {!isMobile && <View style={{ width: 40 }} />}
            </View>



            {/* Messages Area */}
            {!currentSession ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#F79C4E" />
                <Text
                  style={{
                    marginTop: 10,
                    color: "#777",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Loading chat...
                </Text>
              </View>
            ) : tokenLimitExceeded && messages.length > 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#FF6B6B",
                    marginBottom: 15,
                    textAlign: "center",
                    letterSpacing: -0.1,
                  }}
                >
                  Token Limit Reached
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginBottom: 25,
                    textAlign: "center",
                    lineHeight: 21,
                  }}
                >
                  This chat has used {currentSession.total_tokens_used} of{" "}
                  {currentSession.max_token_limit} available tokens.
                </Text>
                <TouchableOpacity
                  onPress={startNewChat}
                  style={{
                    backgroundColor: "#F79C4E",
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    borderRadius: 25,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                  >
                    Start New Chat
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Messages List */}
                <FlatList
                  ref={flatListRef}
                  data={displayedMessages}
                  keyExtractor={(_, index) => index.toString()}
                  style={{ flex: 1, paddingHorizontal: 14 }}
                  contentContainerStyle={{ paddingBottom: 20, paddingTop: 6 }}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  renderItem={({ item }) => (
                    <ChatMessage
                      role={item.role}
                      text={item.content}
                      createdAt={item.created_at}
                      onOptionPress={sendChatMessage}
                    />
                  )}
                  ListFooterComponent={
                    loading ? (
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#F79C4A",
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
              </>
            )}

            {/* Input Area */}
            {currentSession && (
              
              <ChatInput
                value={messageText}
                onChangeText={setMessageText}
                onSendMessage={handleSendMessage}
                isLoading={loading}
                isDisabled={tokenLimitExceeded}
                currentTokens={currentSession.total_tokens_used}
                maxTokens={currentSession.max_token_limit}
                placeholder="Ask me anything about your pet’s skin & care..."
              />
              
            )}
          </View>

          {/* ===== SIDEBAR MODAL (Mobile) ===== */}
          {isMobile && sidebarVisible && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ width: "75%" }}>
                  <ChatSidebar
                    sessions={sessions}
                    currentSessionId={currentSession?.id || null}
                    onSelectSession={selectSession}
                    onNewChat={startNewChat}
                    onDeleteChat={deleteSession}
                    onClose={() => setSidebarVisible(false)}
                    isLoading={sessionsLoading}
                    isModal={true}
                  />
                </View>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setSidebarVisible(false)}
                />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}