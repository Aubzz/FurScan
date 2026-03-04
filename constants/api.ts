// In constants/api.ts

import { Platform } from "react-native";

/**
 * The single source of truth for the backend API URL.
 * Change the IP address here, and it will update across the entire app.
 */
export const API_URL = Platform.select({
  // This is used when running the app in a web browser
  web: "http://localhost:8080",

  // This is for the mobile app (Expo Go).
  // THIS IS THE ONLY LINE YOU'LL EVER NEED TO CHANGE.
  default: "http://192.168.100.4:8080", // IMPORTANT: Replace with your computer's IP
});
