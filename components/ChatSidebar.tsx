/**
 * ChatSidebar.tsx
 *
 * Left sidebar component for chat history (ChatGPT-style)
 * Handles:
 * - Displaying list of chat sessions
 * - Session selection and switching
 * - New chat creation
 * - Chat deletion with confirmation
 * - Responsive sizing for mobile/tablet/web
 * - Session filtering (archived/active)
 */

import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ChatSession } from "../services/chatApi";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
  onNewChat: () => void;
  onDeleteChat: (sessionId: number) => void;
  onClose?: () => void;
  isLoading?: boolean;
  isModal?: boolean; // If true, displays as full-screen modal; if false, as persistent sidebar
}

/**
 * ChatSidebar Component
 * Can render as persistent sidebar or modal depending on screen size
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteChat,
  onClose,
  isLoading = false,
  isModal = true,
}) => {
  const [selectedForDelete, setSelectedForDelete] = useState<number | null>(
    null,
  );
  const screenWidth = Dimensions.get("window").width;
  const isMobile = screenWidth < 768;

  // Separate active and archived sessions
  const activeSessions = sessions.filter((s) => !s.is_archived);
  const archivedSessions = sessions.filter((s) => s.is_archived);

  const handleDeleteChat = (sessionId: number) => {
    onDeleteChat(sessionId);
    setSelectedForDelete(null);
  };

  // Container styles based on display mode
  const containerStyle = isModal
    ? { flex: 1, backgroundColor: "#fff" }
    : {
        width: isMobile ? 0 : 250,
        backgroundColor: "#f8f9fa",
        borderRightWidth: 1,
        borderRightColor: "#eee",
        height: "100%",
      };

  // Content component
  const renderContent = () => (
    <>
      {/* Header */}
      {isModal && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Chat History</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* New Chat Button */}
      <TouchableOpacity
        onPress={onNewChat}
        disabled={isLoading}
        style={{
          marginHorizontal: 15,
          marginVertical: 15,
          backgroundColor: "#F79C4E",
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: "center",
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          + New Chat
        </Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#F79C4E" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 15 }}>
          {/* Active Sessions */}
          {activeSessions.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <Text style={{ color: "#999", fontSize: 14 }}>No chats yet</Text>
              <Text style={{ color: "#999", fontSize: 12, marginTop: 5 }}>
                Start a new conversation
              </Text>
            </View>
          ) : (
            <>
              {/* Active Chats Section */}
              {activeSessions.map((session) => (
                <View key={session.id}>
                  {/* Session Card */}
                  <TouchableOpacity
                    onPress={() => {
                      onSelectSession(session.id);
                      if (isModal) onClose?.();
                    }}
                    style={{
                      backgroundColor:
                        currentSessionId === session.id ? "#F5F5F5" : "#fff",
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      marginVertical: 5,
                      borderRadius: 8,
                      borderLeftWidth: currentSessionId === session.id ? 3 : 0,
                      borderLeftColor:
                        currentSessionId === session.id
                          ? "#F79C4E"
                          : "transparent",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 14,
                          color: "#333",
                          fontWeight: "500",
                        }}
                      >
                        {session.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#999",
                          marginTop: 2,
                        }}
                      >
                        {session.message_count || 0} messages •{" "}
                        {session.total_tokens_used} tokens
                      </Text>
                    </View>

                    {/* Delete Button */}
                    {currentSessionId === session.id && (
                      <TouchableOpacity
                        onPress={() => setSelectedForDelete(session.id)}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ fontSize: 16 }}>🗑</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {/* Delete Confirmation */}
                  {selectedForDelete === session.id && (
                    <View
                      style={{
                        backgroundColor: "#FFE5E5",
                        borderLeftWidth: 4,
                        borderLeftColor: "#FF6B6B",
                        padding: 10,
                        marginVertical: 5,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#721C24",
                          marginBottom: 8,
                        }}
                      >
                        Delete this chat? This cannot be undone.
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => setSelectedForDelete(null)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 4,
                            backgroundColor: "#fff",
                            borderWidth: 1,
                            borderColor: "#ddd",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#333" }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteChat(session.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 4,
                            backgroundColor: "#FF6B6B",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#fff",
                              fontWeight: "600",
                            }}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              {/* Archived Section Divider */}
              {archivedSessions.length > 0 && (
                <>
                  <View
                    style={{
                      marginVertical: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#eee",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#999",
                      marginVertical: 8,
                    }}
                  >
                    ARCHIVED
                  </Text>

                  {/* Archived Chats */}
                  {archivedSessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      onPress={() => onSelectSession(session.id)}
                      style={{
                        backgroundColor: "#fff",
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        marginVertical: 5,
                        borderRadius: 8,
                        opacity: 0.6,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 12,
                          color: "#999",
                        }}
                      >
                        {session.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </>
  );

  // If persistent sidebar (not modal), return as a side-by-side layout
  if (!isModal) {
    return (
      <View
        style={{
          width: 250,
          backgroundColor: "#f8f9fa",
          borderRightWidth: 1,
          borderRightColor: "#eee",
        }}
      >
        {renderContent()}
      </View>
    );
  }

  // Otherwise render as modal/overlay
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {renderContent()}
    </SafeAreaView>
  );
};

export default ChatSidebar;
