import { Flame, Droplet, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FireWaterToggleProps {
  activeType: "fire" | "water" | "void";
  onToggle: (type: "fire" | "water" | "void") => void;
}

export function FireWaterToggle({ activeType, onToggle }: FireWaterToggleProps) {
  return (
    <div className={cn("flex gap-2 p-1 rounded-full w-fit mx-auto", activeType === "void" ? "bg-white border border-border" : "bg-muted")}>
      <button
        onClick={() => onToggle("fire")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
          activeType === "fire"
            ? "bg-fire-primary text-white shadow-lg scale-105"
            : "text-muted-foreground hover:text-fire-primary"
        )}
      >
        <Flame className={cn("w-5 h-5", activeType === "fire" && "animate-pulse")} />
        <span className="font-medium">Fire</span>
      </button>
      <button
        onClick={() => onToggle("water")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
          activeType === "water"
            ? "bg-water-primary text-white shadow-lg scale-105"
            : "text-muted-foreground hover:text-water-primary"
        )}
      >
        <Droplet className={cn("w-5 h-5", activeType === "water" && "animate-pulse")} />
        <span className="font-medium">Water</span>
      </button>
      <button
        onClick={() => onToggle("void")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
          activeType === "void"
            ? "bg-white text-black shadow-lg scale-105"
            : "text-muted-foreground hover:text-black"
        )}
      >
        <Circle className={cn("w-5 h-5", activeType === "void" && "animate-pulse")} />
        <span className="font-medium">Void</span>
      </button>
    </div>
  );
}
