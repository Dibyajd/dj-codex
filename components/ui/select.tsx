import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-[#d7ccba] bg-white px-3 py-2 text-sm text-ink outline-none transition",
        "focus:border-accent focus:ring-2 focus:ring-[#0e6e6325]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
