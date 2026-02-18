import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface StepperProps {
  currentStep: number;
  steps: { number: number; label: string; icon?: React.ReactNode }[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isActive
                      ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive || isCompleted ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-all duration-300",
                    isCompleted ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
