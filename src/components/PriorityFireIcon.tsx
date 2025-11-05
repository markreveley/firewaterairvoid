import { Flame } from "lucide-react";
import { PRIORITY_CONFIG, PRIORITY_LEVELS } from "@/constants/priority";
import { cn } from "@/lib/utils";

interface PriorityFireIconProps {
  priority: number;
  className?: string;
  filled?: boolean;
}

export function PriorityFireIcon({ priority, className, filled = true }: PriorityFireIconProps) {
  // Default to TODO if priority is outside expected range
  const validPriority = priority >= 1 && priority <= 5 ? priority : PRIORITY_LEVELS.TODO;
  const config = PRIORITY_CONFIG[validPriority as keyof typeof PRIORITY_CONFIG];

  return (
    <Flame
      className={cn("w-4 h-4", filled && "fill-current", className)}
      style={{ color: config.color }}
    />
  );
}
