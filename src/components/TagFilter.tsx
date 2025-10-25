import { Badge } from "@/components/ui/badge";
import { Flame, Droplet, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface TagFilterProps {
  primaryTags: Tag[];
  secondaryTags: Tag[];
  allTags: Tag[];
  type: "fire" | "water" | "air" | "void" | "earth";
  selectedTag?: string;
  selectedChildTag?: string;
  onSelectTag: (tagId: string | undefined) => void;
  onSelectChildTag: (tagId: string | undefined) => void;
}

export function TagFilter({ primaryTags, secondaryTags, allTags, type, selectedTag, selectedChildTag, onSelectTag, onSelectChildTag }: TagFilterProps) {
  if (primaryTags.length === 0 && secondaryTags.length === 0) return null;

  // Get child tags for selected parent
  const childTags = selectedTag 
    ? allTags.filter(tag => tag.parent_id === selectedTag)
    : [];

  const renderTagBadges = (tags: Tag[], isChildTag = false) => {
    return tags.map((tag) => {
      const isSelected = isChildTag ? selectedChildTag === tag.id : selectedTag === tag.id;

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
          onClick={() => {
            if (isChildTag) {
              onSelectChildTag(isSelected ? undefined : tag.id);
            } else {
              onSelectTag(isSelected ? undefined : tag.id);
              // Clear child tag selection when selecting a different parent
              if (!isSelected && selectedChildTag) {
                onSelectChildTag(undefined);
              }
            }
          }}
        >
          <span>{tag.name}</span>
          {isSelected && (
            <X
              className="w-3 h-3 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                if (isChildTag) {
                  onSelectChildTag(undefined);
                } else {
                  onSelectTag(undefined);
                  onSelectChildTag(undefined); // Clear child when clearing parent
                }
              }}
            />
          )}
        </Badge>
      );
    });
  };

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      {primaryTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {renderTagBadges(primaryTags)}
        </div>
      )}
      {secondaryTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {renderTagBadges(secondaryTags)}
        </div>
      )}
      {childTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {renderTagBadges(childTags, true)}
        </div>
      )}
    </div>
  );
}
