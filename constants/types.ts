// types.ts

export interface Prediction {
  label: string;
  confidence: number;
  percentage: number; // Added this to match your backend's round(float(conf) * 100, 1)
  display_text?: string;
}

/**
 * Define the parameters passed between screens.
 * In Expo Router, everything passed via 'params' arrives as a string.
 */
export interface ScanResultParams {
  imageUri: string;
  status: string; // "Issues Detected" or "No skin diseases found"
  predictions: string; // Stringified Prediction[]
  petName?: string;
  petAge?: string;
  petBreed?: string;
}

export interface DiagnosisReportParams {
  condition: string; // Primary finding for the header
  imageUri: string;
  allResults: string; // Stringified Prediction[] (The full list we passed from Results)
  summary: string; // Stringified JSON array of symptoms from TellMeMore questionnaire
  petName?: string;
  petAge?: string;
  petBreed?: string;
}
