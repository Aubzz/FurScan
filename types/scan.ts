export interface Prediction {
  label: string;
  confidence: number;
  percentage: number;
  display_text?: string;
}

export interface ScanResultParams {
  imageUri: string;
  status: string;
  predictions: string;
  petName?: string;
  petAge?: string;
  petBreed?: string;
}

export interface DiagnosisReportParams {
  condition: string;
  imageUri: string;
  allResults: string;
  summary: string;
  petName?: string;
  petAge?: string;
  petBreed?: string;
}
