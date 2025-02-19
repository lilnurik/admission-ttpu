import { cn } from "@/lib/utils";

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex flex-col items-center flex-1"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                index <= currentStep
                  ? "bg-primary text-white border-primary"
                  : "bg-secondary border-gray-300 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            <div
              className={cn(
                "mt-2 text-xs text-center",
                index <= currentStep ? "text-primary" : "text-gray-500"
              )}
            >
              {step}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-full mt-4",
                  index < currentStep ? "bg-primary" : "bg-gray-300"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};