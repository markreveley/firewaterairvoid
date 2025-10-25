import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Droplet, Circle, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Tag, ItemType } from "@/types";

interface TagFilterProps {
  projectTags: Tag[];
  categoryTags: Tag[];
  allTags: Tag[];
  type: ItemType;
  selectedTags: string[];
  selectedChildTags: string[];
  onSelectTags: (tagIds: string[]) => void;
  onSelectChildTags: (tagIds: string[]) => void;
}

export function TagFilter({ projectTags, categoryTags, allTags, type, selectedTags, selectedChildTags, onSelectTags, onSelectChildTags }: TagFilterProps) {
  const navigate = useNavigate();
  
  if (projectTags.length === 0 && categoryTags.length === 0) return null;

  // Get child tags for all selected parents
  const childTags = selectedTags.length > 0
    ? allTags.filter(tag => tag.parent_id && selectedTags.includes(tag.parent_id))
    : [];

  const renderTagBadges = (tags: Tag[], isChildTag = false) => {
    return tags.map((tag) => {
      const isSelected = isChildTag 
        ? selectedChildTags.includes(tag.id) 
        : selectedTags.includes(tag.id);

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
              if (isSelected) {
                onSelectChildTags(selectedChildTags.filter(id => id !== tag.id));
              } else {
                onSelectChildTags([...selectedChildTags, tag.id]);
              }
            } else {
              if (isSelected) {
                // Remove tag and clear any child tags belonging to this parent
                onSelectTags(selectedTags.filter(id => id !== tag.id));
                const childTagIds = allTags
                  .filter(t => t.parent_id === tag.id)
                  .map(t => t.id);
                onSelectChildTags(selectedChildTags.filter(id => !childTagIds.includes(id)));
              } else {
                onSelectTags([...selectedTags, tag.id]);
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
                  onSelectChildTags(selectedChildTags.filter(id => id !== tag.id));
                } else {
                  onSelectTags(selectedTags.filter(id => id !== tag.id));
                  // Clear child tags belonging to this parent
                  const childTagIds = allTags
                    .filter(t => t.parent_id === tag.id)
                    .map(t => t.id);
                  onSelectChildTags(selectedChildTags.filter(id => !childTagIds.includes(id)));
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
      {projectTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {renderTagBadges(projectTags)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tags/projects")}
            className="h-6 px-2"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      )}
      {categoryTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {renderTagBadges(categoryTags)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tags/categories")}
            className="h-6 px-2"
          >
            <Settings className="w-3 h-3" />
          </Button>
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
