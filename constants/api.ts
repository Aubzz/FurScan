import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// 1. Define Base URLs
export const API_URL = Platform.select({
  web: "http://localhost:8080",
  // REPLACE with your IP
  default: "http://10.190.159.144:8080",
}) as string;

export const ML_API_URL = Platform.select({
  web: "http://localhost:8082",
  default: "http://10.190.159.144:8082",
}) as string;

// 2. Create Axios Instance
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Add Token Interceptor (ROBUST VERSION)
apiClient.interceptors.request.use(
  async (config) => {
    // Check both potential keys
    const token =
      (await AsyncStorage.getItem("userToken")) ||
      (await AsyncStorage.getItem("token"));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      console.log(`[API] Attaching Token: ${token.substring(0, 10)}...`); // Debug log
    } else {
      console.log(
        "[API] No token found in storage (Guest mode or Login failed)",
      );
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 4. Export API definitions
export const api = {
  getHistory: async () => {
    const response = await apiClient.get("/skin-assessment/history");
    return response.data;
  },

  saveAssessment: async (data: any) => {
    const response = await apiClient.post("/skin-assessment/save", data);
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    const response = await apiClient.delete(`/skin-assessment/${id}`);
    return response.data;
  },
};

export default apiClient;
