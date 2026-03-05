//AssessmentContext.tsx
import React, { createContext, useContext, useState } from "react";
// FIX: Use lowercase 'assessment' to match the file name on disk
import { Assessment } from "../types/Assessment";

interface AssessmentContextType {
  assessment: Assessment;
  updateAssessment: (data: Partial<Assessment>) => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

const emptyAssessment: Assessment = {
  id: "",
  createdAt: "",
  petInfo: { name: "", age: 0, breed: "" },
  detectedLesions: [],
  symptoms: [],
  possibleCauses: [],
};

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [assessment, setAssessment] = useState<Assessment>(emptyAssessment);

  const updateAssessment = (data: Partial<Assessment>) => {
    setAssessment((prev) => ({ ...prev, ...data }));
  };

  const resetAssessment = () => setAssessment(emptyAssessment);

  return (
    <AssessmentContext.Provider
      value={{ assessment, updateAssessment, resetAssessment }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within provider");
  return ctx;
};
