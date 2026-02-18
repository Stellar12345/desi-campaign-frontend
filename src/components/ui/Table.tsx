import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto overflow-y-visible">
      <table className={cn("w-full", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>{children}</thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn("divide-y divide-gray-200", className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn("hover:bg-gray-50 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: TableProps) {
  return (
    <td className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900 relative", className)}>
      {children}
    </td>
  );
}
