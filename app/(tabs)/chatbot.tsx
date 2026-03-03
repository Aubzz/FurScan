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

import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import ChatInput from '../../components/ChatInput';
import ChatMessage from '../../components/ChatMessage';
import ChatSidebar from '../../components/ChatSidebar';
import TokenCounter from '../../components/TokenCounter';
import { useAuth } from '../../contexts/AuthContext';
import { resetConversation, sendMessage } from '../services/botpressApi';
import {
  addChatMessage,
  ChatMessage as ChatMessageType,
  ChatSession,
  createChatSession,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  updateChatSession,
} from '../services/chatApi';
import { estimateTokens } from '../services/tokenCounter';

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
    <View style={{ flexDirection: 'row', padding: 5 }}>
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#999',
          marginHorizontal: 2,
          opacity: animValue1,
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#999',
          marginHorizontal: 2,
          opacity: animValue2,
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#999',
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
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // ===== STATE MANAGEMENT =====

  // Chat UI state
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Chat session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Token state
  const [tokenLimitExceeded, setTokenLimitExceeded] = useState(false);

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
    }, [token, user])
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
      console.error('❌ Error loading sessions:', err);
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
      const newSession = await createChatSession(token, 'New Chat');
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      setMessageText('');
      setTokenLimitExceeded(false);
      resetConversation();
      setSidebarVisible(false);

      console.log(`✅ Started new chat session ${newSession.id}`);
    } catch (err) {
      console.error('❌ Error creating session:', err);
      alert('Failed to create new chat session');
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
      setMessageText('');

      // Update token limit check
      const exceeded =
        session.total_tokens_used >= session.max_token_limit;
      setTokenLimitExceeded(exceeded);

      setSidebarVisible(false);
      console.log(`✅ Loaded session ${sessionId}`);
    } catch (err) {
      console.error('❌ Error loading session:', err);
      alert('Failed to load chat session');
    }
  };

  /**
   * Delete a chat session
   */
  const deleteSession = async (sessionId: number) => {
    if (!token) return;

    try {
      await deleteChatSession(token, sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));

      // If deleted session was current, load another or create new
      if (currentSession?.id === sessionId) {
        if (sessions.length > 1) {
          const nextSession = sessions.find(s => s.id !== sessionId);
          if (nextSession) await selectSession(nextSession.id);
        } else {
          await startNewChat();
        }
      }

      console.log(`✅ Deleted session ${sessionId}`);
    } catch (err) {
      console.error('❌ Error deleting session:', err);
      alert('Failed to delete chat session');
    }
  };

  // ===== MESSAGE HANDLING =====

  /**
   * Send a message to the bot
   * 1. Estimate token usage
   * 2. Check token limits
   * 3. Add user message to session
   * 4. Get bot response via Gemini API
   * 5. Add bot response to session
   * 6. Update session title if first message
   */
  const sendChatMessage = async (text: string) => {
    if (!text.trim() || !currentSession || !token) return;

    // Estimate tokens for this message
    const userTokens = estimateTokens(text);
    const projectedTotal =
      (currentSession?.total_tokens_used || 0) + userTokens;

    // Check token limit
    if (projectedTotal > currentSession.max_token_limit) {
      setTokenLimitExceeded(true);
      alert(
        'Token limit reached. Please start a new chat to continue.'
      );
      return;
    }

    // Add user message to local state
    const userMessage: ChatMessageType = {
      id: 0, // Temporary ID until saved to backend
      session_id: currentSession.id,
      role: 'user',
      content: text,
      tokens_used: userTokens,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setMessageText('');
    setLoading(true);

    try {
      // Save user message to backend
      await addChatMessage(
        token,
        currentSession.id,
        'user',
        text,
        userTokens
      );

      // Get bot response
      const botResponse = await sendMessage(text);

      // Estimate bot response tokens
      const botTokens = estimateTokens(botResponse);

      // Add bot message to local state
      const assistantMessage: ChatMessageType = {
        id: 0, // Temporary ID
        session_id: currentSession.id,
        role: 'assistant',
        content: botResponse,
        tokens_used: botTokens,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save bot message to backend
      await addChatMessage(
        token,
        currentSession.id,
        'assistant',
        botResponse,
        botTokens
      );

      // Refresh session to get updated token count
      const updatedSession = await getChatSession(
        token,
        currentSession.id
      );
      setCurrentSession(updatedSession);

      // Update session title if this is the first message
      if (messages.length === 0) {
        const firstMessageText = text.substring(0, 50) + 
          (text.length > 50 ? '...' : '');
        await updateChatSession(token, currentSession.id, {
          title: firstMessageText,
        });

        // Update local sessions list
        setSessions(
          sessions.map(s =>
            s.id === currentSession.id
              ? { ...s, title: firstMessageText }
              : s
          )
        );
      }

      // Check if approaching limit
      if (
        updatedSession.total_tokens_used >=
        updatedSession.max_token_limit
      ) {
        setTokenLimitExceeded(true);
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);

      // Remove user message from local state if failed
      setMessages(messages.filter((m, i) => i !== messages.length - 1));

      // Handle token limit error
      if ((err as any)?.response?.status === 403) {
        setTokenLimitExceeded(true);
        alert('Token limit exceeded. Please start a new chat.');
        return;
      }

      // Generic error
      const errorMessage: ChatMessageType = {
        id: 0,
        session_id: currentSession.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
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
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View
              style={{
                paddingTop: 10,
                paddingBottom: 8,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ fontSize: 24, fontWeight: '300' }}>←</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Chat with AI bot
              </Text>
              {isMobile && (
                <TouchableOpacity
                  onPress={() => setSidebarVisible(true)}
                  disabled={loading}
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  <Text style={{ fontSize: 24 }}>⋯</Text>
                </TouchableOpacity>
              )}
              {!isMobile && <View style={{ width: 24 }} />}
            </View>

            {/* Token Counter */}
            {currentSession && (
              <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
                <TokenCounter
                  currentTokens={currentSession.total_tokens_used}
                  maxTokens={currentSession.max_token_limit}
                  isLimitExceeded={tokenLimitExceeded}
                  showLabel
                  size="medium"
                />
              </View>
            )}

            {/* Messages Area */}
            {!currentSession ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="large" color="#F79C4E" />
                <Text style={{ marginTop: 10, color: '#999' }}>
                  Loading chat...
                </Text>
              </View>
            ) : tokenLimitExceeded && messages.length > 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#FF6B6B',
                    marginBottom: 15,
                    textAlign: 'center',
                  }}
                >
                  Token Limit Reached
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 25,
                    textAlign: 'center',
                  }}
                >
                  This chat has used {currentSession.total_tokens_used} of{' '}
                  {currentSession.max_token_limit} available tokens.
                </Text>
                <TouchableOpacity
                  onPress={startNewChat}
                  style={{
                    backgroundColor: '#F79C4E',
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    borderRadius: 25,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                    Start New Chat
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Greeting (only on first load) */}
                {messages.length === 0 && (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Image
                      source={require('../../assets/images/dogbot.png')}
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        marginBottom: 5,
                      }}
                    />
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      Good morning, Friend
                    </Text>
                    <Text
                      style={{
                        color: '#777',
                        marginTop: 3,
                        fontSize: 13,
                      }}
                    >
                      How can I help you and your pet?
                    </Text>
                  </View>
                )}

                {/* Messages List */}
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(_, index) => index.toString()}
                  style={{ flex: 1, paddingHorizontal: 15 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  renderItem={({ item }) => (
                    <ChatMessage
                      role={item.role}
                      text={item.content}
                      onOptionPress={sendChatMessage}
                    />
                  )}
                  ListFooterComponent={
                    loading ? (
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          backgroundColor: '#E5E5EA',
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
              />
            )}
          </View>

          {/* ===== SIDEBAR MODAL (Mobile) ===== */}
          {isMobile && sidebarVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            >
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ width: '75%' }}>
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
    </SafeAreaView>
  );
}