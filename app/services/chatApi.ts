/**
 * chatApi.ts
 *
 * Service for communicating with the backend chat API
 * Handles all chat session and message operations via RESTful endpoints
 *
 * Architecture:
 * - Base URL configured from AuthContext
 * - All requests include Authorization header with JWT token
 * - Error handling with consistent response format
 * - Type-safe interfaces for request/response data
 */

import axios, { AxiosError } from "axios";
import { API_URL } from "../../constants/api";

// =============================================
// Type Definitions for API Requests/Responses
// =============================================

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  total_tokens_used: number;
  max_token_limit: number;
  is_archived: boolean;
  message_count?: number;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  tokens_used: number;
  created_at: string;
}

export interface TokenStats {
  total_sessions: number;
  total_tokens_used: number;
  avg_tokens_per_session: number;
  highest_limit: number;
}

// =============================================
// API Response Type
// =============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// =============================================
// Axios Instance Configuration
// =============================================

/**
 * Create axios instance with auth headers
 * Token should be provided from authenticated context
 */
const createAxiosInstance = (token?: string) => {
  const instance = axios.create({
    baseURL: `${API_URL}/api/chat`,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add authorization header if token is provided
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Error interceptor for consistent error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      console.error("❌ Chat API Error:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    },
  );

  return instance;
};

// =============================================
// Chat Session Endpoints
// =============================================

/**
 * Create a new chat session
 *
 * @param token - JWT authentication token
 * @param title - Optional session title
 * @param maxTokenLimit - Maximum tokens for this session (default: 1000)
 * @returns Newly created chat session
 */
export const createChatSession = async (
  token: string,
  title?: string,
  maxTokenLimit: number = 1000,
): Promise<ChatSession> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.post("/sessions", {
      title: title || "New Chat",
      max_token_limit: maxTokenLimit,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create session");
    }

    console.log("✅ Chat session created:", response.data.data.id);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error creating chat session:", error);
    throw error;
  }
};

/**
 * Fetch all chat sessions for the current user
 *
 * @param token - JWT authentication token
 * @param includeArchived - Include archived sessions (default: false)
 * @param limit - Number of sessions to fetch (default: 50)
 * @param offset - Pagination offset (default: 0)
 * @returns Array of chat sessions
 */
export const getChatSessions = async (
  token: string,
  includeArchived: boolean = false,
  limit: number = 50,
  offset: number = 0,
): Promise<ChatSession[]> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.get("/sessions", {
      params: {
        include_archived: includeArchived,
        limit,
        offset,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch sessions");
    }

    console.log(`✅ Fetched ${response.data.count} chat sessions`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching chat sessions:", error);
    throw error;
  }
};

/**
 * Fetch a specific chat session with all messages
 *
 * @param token - JWT authentication token
 * @param sessionId - The session ID to fetch
 * @returns Chat session with full message history
 */
export const getChatSession = async (
  token: string,
  sessionId: number,
): Promise<ChatSession> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.get(`/sessions/${sessionId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch session");
    }

    console.log(
      `✅ Fetched chat session ${sessionId} with ${response.data.data.messages?.length} messages`,
    );
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching chat session:", error);
    throw error;
  }
};

/**
 * Update a chat session (title, archive status)
 *
 * @param token - JWT authentication token
 * @param sessionId - The session ID to update
 * @param updates - Object containing fields to update
 * @returns Updated chat session
 */
export const updateChatSession = async (
  token: string,
  sessionId: number,
  updates: { title?: string; is_archived?: boolean },
): Promise<ChatSession> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.patch(`/sessions/${sessionId}`, updates);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update session");
    }

    console.log(`✅ Updated chat session ${sessionId}`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error updating chat session:", error);
    throw error;
  }
};

/**
 * Delete a chat session and all its messages
 *
 * @param token - JWT authentication token
 * @param sessionId - The session ID to delete
 * @returns Success response
 */
export const deleteChatSession = async (
  token: string,
  sessionId: number,
): Promise<boolean> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.delete(`/sessions/${sessionId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete session");
    }

    console.log(`✅ Deleted chat session ${sessionId}`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting chat session:", error);
    throw error;
  }
};

// =============================================
// Chat Message Endpoints
// =============================================

/**
 * Add a message to a chat session
 *
 * @param token - JWT authentication token
 * @param sessionId - The session ID
 * @param role - Message role: 'user' or 'assistant'
 * @param content - The message content
 * @param tokensUsed - Tokens consumed by this message (estimated or actual)
 * @returns Newly created message
 */
export const addChatMessage = async (
  token: string,
  sessionId: number,
  role: "user" | "assistant",
  content: string,
  tokensUsed: number = 0,
): Promise<ChatMessage> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.post("/messages", {
      session_id: sessionId,
      role,
      content,
      tokens_used: tokensUsed,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add message");
    }

    console.log(`✅ Message added to session ${sessionId}`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error adding message:", error);
    throw error;
  }
};

/**
 * Fetch messages for a chat session (with pagination)
 *
 * @param token - JWT authentication token
 * @param sessionId - The session ID
 * @param limit - Number of messages to fetch (default: 100)
 * @param offset - Pagination offset (default: 0)
 * @returns Array of messages
 */
export const getChatMessages = async (
  token: string,
  sessionId: number,
  limit: number = 100,
  offset: number = 0,
): Promise<ChatMessage[]> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.get(`/messages/${sessionId}`, {
      params: { limit, offset },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch messages");
    }

    console.log(`✅ Fetched ${response.data.count} messages`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    throw error;
  }
};

/**
 * Delete a specific message
 *
 * @param token - JWT authentication token
 * @param messageId - The message ID to delete
 * @returns Tokens refunded
 */
export const deleteChatMessage = async (
  token: string,
  messageId: number,
): Promise<number> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.delete(`/messages/${messageId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete message");
    }

    console.log(`✅ Deleted message ${messageId}`);
    return response.data.tokens_refunded || 0;
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    throw error;
  }
};

// =============================================
// Statistics Endpoints
// =============================================

/**
 * Get token usage statistics for the current user
 *
 * @param token - JWT authentication token
 * @returns Token usage statistics
 */
export const getTokenStats = async (token: string): Promise<TokenStats> => {
  try {
    const axios = createAxiosInstance(token);
    const response = await axios.get("/stats");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch stats");
    }

    console.log("✅ Fetched token statistics");
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching token stats:", error);
    throw error;
  }
};
