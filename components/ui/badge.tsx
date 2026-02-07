import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#d7ccba] bg-[#f9f6ef] px-3 py-1 text-xs font-semibold text-[#5f5446]",
        className
      )}
      {...props}
    />
  );
}
