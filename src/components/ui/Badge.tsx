import { cn } from "@/utils/cn";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    success: "bg-[#F3B44C] text-white",
    warning: "bg-[#FFD465] text-gray-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-[#E9488A] text-white",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
