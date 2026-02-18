import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";

interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownProps {
  items: DropdownItem[];
  className?: string;
}

export default function Dropdown({ items, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use setTimeout to ensure the dropdown is rendered before adding the listener
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Actions menu"
        type="button"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[160px] bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
          onClick={(e) => e.stopPropagation()}
          style={{ minWidth: "180px" }}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(item.onClick);
                }}
                type="button"
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors whitespace-nowrap",
                  item.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
