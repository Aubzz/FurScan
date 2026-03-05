// In utils/tokenStorage.js

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "authToken";

export async function saveToken(token) {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log("Token saved successfully.");
  } catch (error) {
    console.error("Failed to save token:", error);
  }
}

export async function getToken() {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
}

export async function removeToken() {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("Token removed successfully.");
  } catch (error) {
    console.error("Failed to remove token:", error);
  }
}
