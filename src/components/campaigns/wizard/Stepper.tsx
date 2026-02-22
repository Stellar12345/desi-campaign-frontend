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
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden",
                    isCompleted
                      ? "bg-[#F3B44C] text-white"
                      : isActive
                      ? "bg-gradient-to-r from-[#E9488A] to-[#F3B44C] text-white ring-5 ring-[#FFD465]/30"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : step.icon ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {step.icon}
                    </div>
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
                    isCompleted ? "bg-[#F3B44C]" : "bg-gray-300"
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
