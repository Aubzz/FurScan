// services/chatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAT_KEY = "chat_history";

export const saveChat = async (messages: { role: string; text: string }[]) => {
  try {
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (err) {
    console.log("Error saving chat:", err);
  }
};

export const loadChat = async () => {
  try {
    const data = await AsyncStorage.getItem(CHAT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log("Error loading chat:", err);
    return [];
  }
};

export const clearChat = async () => {
  try {
    await AsyncStorage.removeItem(CHAT_KEY);
  } catch (err) {
    console.log("Error clearing chat:", err);
  }
};
