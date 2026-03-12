// In constants/api.ts

import { Platform } from 'react-native';

/**
 * The single source of truth for the backend API URL.
 * Now pointing to the live Render production server.
 */
export const API_URL = Platform.select({
  // Use the Render URL for web as well to ensure consistency
  web: 'https://furemedy-backend-joob.onrender.com',

  // This is for the mobile app (Expo Go). 
  // Pointing to your live Render backend instead of a local IP.
  default: 'https://furemedy-backend-joob.onrender.com',
});