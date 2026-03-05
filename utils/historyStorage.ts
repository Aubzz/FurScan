//historyStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../constants/api";
import { Assessment } from "../types/Assessment";

const STORAGE_KEY = "DERMAPAW_HISTORY";

export const saveAssessmentToHistory = async (assessment: Assessment) => {
  // 1. ALWAYS SAVE LOCALLY FIRST (Optimistic Save)
  // This failsafe ensures that even if the API crashes or returns 401, data is safe.
  try {
    const existing = await getLocalHistory();
    // Check for duplicates to avoid double-saving if user presses button twice
    const isDuplicate = existing.some((item) => item.id === assessment.id);

    if (!isDuplicate) {
      const updated = [assessment, ...existing];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (localError) {
    console.error("Local save failed:", localError);
  }

  // 2. ATTEMPT CLOUD SYNC
  try {
    // Pass the whole assessment object. This ensures ID, symptoms, etc are included.
    // The previous manual mapping was risky if fields were missing.
    await api.saveAssessment(assessment);

    // 3. IF SUCCEESS: SYNC DOWN (Consistency check)
    // We fetch the trusted list from server to ensure IDs and timestamps align
    const freshHistory = await api.getHistory();
    if (freshHistory && Array.isArray(freshHistory)) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(freshHistory));
    }
  } catch (error: any) {
    // Handle 401/403 gracefully - it just means we are likely in Guest mode
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      console.log("Guest mode or Session expired - Local save only.");
    } else {
      // Only warn for actual network failures
      console.log("Cloud sync skipped (Offline/Network Error)");
    }
    // No action needed - data was already saved locally in Step 1.
  }
};

export const deleteAssessmentFromHistory = async (id: string) => {
  // 1. DELETE LOCALLY FIRST (Optimistic UI)
  try {
    const currentHistory = await getLocalHistory();
    const updatedHistory = currentHistory.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Local delete failed", e);
    return false;
  }

  // 2. ATTEMPT CLOUD DELETE
  try {
    await api.deleteAssessment(id);
    console.log("Deleted from cloud");
  } catch (error) {
    // Ignore cloud errors for delete (guest mode or offline)
    console.log("Cloud delete skipped");
  }

  return true;
};

export const getHistoryFromStorage = async (): Promise<Assessment[]> => {
  try {
    // Try to get fresh data from cloud
    const cloudData = await api.getHistory();
    if (cloudData && Array.isArray(cloudData)) {
      // Update local cache
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
      return cloudData;
    }
  } catch (_error) {
    console.log("Offline or server error. Loading local data.");
  }

  // Fallback to local data
  return getLocalHistory();
};

const getLocalHistory = async (): Promise<Assessment[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
};
