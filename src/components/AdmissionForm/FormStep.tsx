import React from "react";
import { cn } from "@/lib/utils";

interface FormStepProps {
  children: React.ReactNode;
  isActive: boolean;
}

export const FormStep: React.FC<FormStepProps> = ({ children, isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
};