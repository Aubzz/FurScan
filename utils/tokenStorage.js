// In utils/tokenStorage.js

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "authToken";

const canUseWebStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const hasSecureStoreMethods = () =>
  typeof SecureStore?.setItemAsync === "function" &&
  typeof SecureStore?.getItemAsync === "function" &&
  typeof SecureStore?.deleteItemAsync === "function";

export async function saveToken(token) {
  try {
    if (Platform.OS === "web" && canUseWebStorage()) {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    if (hasSecureStoreMethods()) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return;
    }

    if (canUseWebStorage()) {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    console.log("Token saved successfully.");
  } catch (error) {
    if (canUseWebStorage()) {
      try {
        window.localStorage.setItem(TOKEN_KEY, token);
        return;
      } catch {}
    }
    console.error("Failed to save token:", error);
  }
}

export async function getToken() {
  try {
    if (Platform.OS === "web" && canUseWebStorage()) {
      return window.localStorage.getItem(TOKEN_KEY);
    }

    if (hasSecureStoreMethods()) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }

    if (canUseWebStorage()) {
      return window.localStorage.getItem(TOKEN_KEY);
    }

    return null;
  } catch (error) {
    if (canUseWebStorage()) {
      try {
        return window.localStorage.getItem(TOKEN_KEY);
      } catch {}
    }
    console.error("Failed to get token:", error);
    return null;
  }
}

export async function removeToken() {
  try {
    if (Platform.OS === "web" && canUseWebStorage()) {
      window.localStorage.removeItem(TOKEN_KEY);
      return;
    }

    if (hasSecureStoreMethods()) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      return;
    }

    if (canUseWebStorage()) {
      window.localStorage.removeItem(TOKEN_KEY);
      return;
    }

    console.log("Token removed successfully.");
  } catch (error) {
    if (canUseWebStorage()) {
      try {
        window.localStorage.removeItem(TOKEN_KEY);
        return;
      } catch {}
    }
    console.error("Failed to remove token:", error);
  }
}
