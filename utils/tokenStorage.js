// In utils/tokenStorage.js

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';

export async function saveToken(token) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log("Token saved successfully.");
  } catch (error) {
    console.error("Failed to save token:", error);
  }
}

export async function getToken() {
  try {
    // This is the correct function name
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
}

export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("Token removed successfully.");
  } catch (error) {
    console.error("Failed to remove token:", error);
  }
}