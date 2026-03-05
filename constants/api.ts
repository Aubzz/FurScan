// In constants/api.ts

import { Platform } from "react-native";

/**
 * The single source of truth for the backend API URL.
 * Change the IP address here, and it will update across the entire app.
 */
export const API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_API_URL_WEB || "http://localhost:8080",

  // This is for the mobile app (Expo Go).
  // THIS IS THE ONLY LINE YOU'LL EVER NEED TO CHANGE.
  default: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.52:8080",
});
