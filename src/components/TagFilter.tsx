import { Badge } from "@/components/ui/badge";
import { Flame, Droplet, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  type: "fire" | "water" | "void";
}

interface TagFilterProps {
  tags: Tag[];
  type: "fire" | "water" | "void";
  selectedTag?: string;
  onSelectTag: (tagId: string | undefined) => void;
}

export function TagFilter({ tags, type, selectedTag, onSelectTag }: TagFilterProps) {
  const filteredTags = tags.filter((tag) => tag.type === type);

  if (filteredTags.length === 0) return null;

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
      {filteredTags.map((tag) => (
        <Badge
          key={tag.id}
          className={cn(
            "cursor-pointer transition-all duration-200",
            selectedTag === tag.id
              ? type === "fire"
                ? "bg-fire-primary text-white shadow-md scale-105"
                : type === "water"
                ? "bg-water-primary text-white shadow-md scale-105"
                : "bg-void-primary text-white shadow-md scale-105"
              : type === "fire"
              ? "bg-fire-light text-fire-dark hover:bg-fire-secondary"
              : type === "water"
              ? "bg-water-light text-water-dark hover:bg-water-secondary"
              : "bg-void-light text-void-dark hover:bg-void-secondary"
          )}
          onClick={() => onSelectTag(selectedTag === tag.id ? undefined : tag.id)}
        >
          {type === "fire" ? (
            <Flame className="w-3 h-3 mr-1" />
          ) : type === "water" ? (
            <Droplet className="w-3 h-3 mr-1" />
          ) : (
            <Circle className="w-3 h-3 mr-1" />
          )}
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
