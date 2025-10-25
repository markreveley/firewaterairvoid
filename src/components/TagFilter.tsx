import { Badge } from "@/components/ui/badge";
import { Flame, Droplet, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagFilterProps {
  tags: Tag[];
  type: "fire" | "water" | "air" | "void" | "earth";
  selectedTag?: string;
  onSelectTag: (tagId: string | undefined) => void;
}

export function TagFilter({ tags, type, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {tags.map((tag) => {
        const isSelected = selectedTag === tag.id;

        return (
          <Badge
            key={tag.id}
            className={cn(
              "cursor-pointer transition-all duration-200 flex items-center gap-1",
              isSelected
                ? type === "fire"
                  ? "bg-fire-primary text-white shadow-md scale-105"
                  : type === "water"
                  ? "bg-water-primary text-white shadow-md scale-105"
                  : type === "air"
                  ? "bg-air-primary text-white shadow-md scale-105"
                  : type === "earth"
                  ? "bg-earth-primary text-white shadow-md scale-105"
                  : "bg-white text-black shadow-md scale-105 border-2 border-black"
                : type === "fire"
                ? "bg-fire-light text-fire-dark hover:bg-fire-secondary"
                : type === "water"
                ? "bg-water-light text-water-dark hover:bg-water-secondary"
                : type === "air"
                ? "bg-air-light text-air-dark hover:bg-air-secondary"
                : type === "earth"
                ? "bg-earth-light text-earth-dark hover:bg-earth-secondary"
                : "bg-void-light text-void-dark hover:bg-white hover:text-black hover:border-black"
            )}
            onClick={() => onSelectTag(isSelected ? undefined : tag.id)}
          >
            <span>{tag.name}</span>
            {isSelected && (
              <X
                className="w-3 h-3 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(undefined);
                }}
              />
            )}
          </Badge>
        );
      })}
    </div>
  );
}
