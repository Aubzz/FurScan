/**
 * chatApi.ts
 *
 * Service for communicating with the backend chat API
 * Handles all chat session and message operations via RESTful endpoints
 */

import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

const API_URL = Platform.select({
  web: "http://localhost:8080",
  default: "http://192.168.50.7:8080",
});

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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const createAxiosInstance = (token?: string) => {
  const instance = axios.create({
    baseURL: `${API_URL}/api/chat`,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

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

export const createChatSession = async (
  token: string,
  title?: string,
  maxTokenLimit: number = 1000,
): Promise<ChatSession> => {
  const client = createAxiosInstance(token);
  const response = await client.post("/sessions", {
    title: title || "New Chat",
    max_token_limit: maxTokenLimit,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to create session");
  }

  return response.data.data;
};

export const getChatSessions = async (
  token: string,
  includeArchived: boolean = false,
  limit: number = 50,
  offset: number = 0,
): Promise<ChatSession[]> => {
  const client = createAxiosInstance(token);
  const response = await client.get("/sessions", {
    params: {
      include_archived: includeArchived,
      limit,
      offset,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch sessions");
  }

  return response.data.data;
};

export const getChatSession = async (
  token: string,
  sessionId: number,
): Promise<ChatSession> => {
  const client = createAxiosInstance(token);
  const response = await client.get(`/sessions/${sessionId}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch session");
  }

  return response.data.data;
};

export const updateChatSession = async (
  token: string,
  sessionId: number,
  updates: { title?: string; is_archived?: boolean },
): Promise<ChatSession> => {
  const client = createAxiosInstance(token);
  const response = await client.patch(`/sessions/${sessionId}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to update session");
  }

  return response.data.data;
};

export const deleteChatSession = async (
  token: string,
  sessionId: number,
): Promise<boolean> => {
  const client = createAxiosInstance(token);
  const response = await client.delete(`/sessions/${sessionId}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete session");
  }

  return true;
};

export const addChatMessage = async (
  token: string,
  sessionId: number,
  role: "user" | "assistant",
  content: string,
  tokensUsed: number = 0,
): Promise<ChatMessage> => {
  const client = createAxiosInstance(token);
  const response = await client.post("/messages", {
    session_id: sessionId,
    role,
    content,
    tokens_used: tokensUsed,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to add message");
  }

  return response.data.data;
};

export const getChatMessages = async (
  token: string,
  sessionId: number,
  limit: number = 100,
  offset: number = 0,
): Promise<ChatMessage[]> => {
  const client = createAxiosInstance(token);
  const response = await client.get(`/messages/${sessionId}`, {
    params: { limit, offset },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch messages");
  }

  return response.data.data;
};

export const deleteChatMessage = async (
  token: string,
  messageId: number,
): Promise<number> => {
  const client = createAxiosInstance(token);
  const response = await client.delete(`/messages/${messageId}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete message");
  }

  return response.data.tokens_refunded || 0;
};

export const getTokenStats = async (token: string): Promise<TokenStats> => {
  const client = createAxiosInstance(token);
  const response = await client.get("/stats");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch stats");
  }

  return response.data.data;
};
