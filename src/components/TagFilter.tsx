import { Badge } from "@/components/ui/badge";
import { Flame, Droplet, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagFilterProps {
  tags: Tag[];
  type: "fire" | "water" | "void";
  selectedTag?: string;
  onSelectTag: (tagId: string | undefined) => void;
}

export function TagFilter({ tags, type, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      <span className="text-sm text-muted-foreground">Filter by tag:</span>
      {selectedTag && (
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-muted"
          onClick={() => onSelectTag(undefined)}
        >
          Clear filter
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          className={cn(
            "cursor-pointer transition-all duration-200",
            selectedTag === tag.id
              ? type === "fire"
                ? "bg-fire-primary text-white shadow-md scale-105"
                : type === "water"
                ? "bg-water-primary text-white shadow-md scale-105"
                : "bg-white text-black shadow-md scale-105 border-2 border-black"
              : type === "fire"
              ? "bg-fire-light text-fire-dark hover:bg-fire-secondary"
              : type === "water"
              ? "bg-water-light text-water-dark hover:bg-water-secondary"
              : "bg-void-light text-void-dark hover:bg-white hover:text-black hover:border-black"
          )}
          onClick={() => onSelectTag(selectedTag === tag.id ? undefined : tag.id)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
