export interface Assessment {
  id: string;
  createdAt: string;
  petInfo: {
    name: string;
    age: string | number;
    breed: string;
  };
  scanImage?: string;
  detectedLesions: string[];
  confidence?: number;
  symptoms: string[];
  possibleCauses: string[];

  // UPDATED: Added support for Clinical Decision Support fields
  diagnosisDetails?: {
    severity?: "low" | "moderate" | "high";
    category?: string; // e.g. "URGENT VETERINARY CARE"
    title?: string; // e.g. "Sarcoptic Mange"
    description?: string; // Contains the full reasoning text
    urgency?: string;
    features?: string;
    disclaimer?: string; // New field for Rule 10
  };

  aiResults?: { name: string; score: number }[];
}
