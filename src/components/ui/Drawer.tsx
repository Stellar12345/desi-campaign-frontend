import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "relative bg-white shadow-xl w-full max-w-2xl h-full",
          side === "right" ? "ml-auto" : "mr-auto",
          "slide-in-from-right"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
