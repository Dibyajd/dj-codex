import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-[#d7ccba] bg-white px-3 py-2 text-sm text-ink outline-none transition",
        "focus:border-accent focus:ring-2 focus:ring-[#0e6e6325]",
        className
      )}
      {...props}
    />
  );
}
