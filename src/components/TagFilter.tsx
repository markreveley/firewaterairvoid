import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag, ItemType } from "@/types";

interface TagFilterProps {
  projectTags: Tag[];
  categoryTags: Tag[];
  allTags: Tag[];
  type: ItemType;
  selectedProjectTag?: string;
  selectedProjectChildTag?: string;
  selectedCategoryTags: string[];
  selectedCategoryChildTags: string[];
  onSelectProjectTag: (tagId: string | undefined) => void;
  onSelectProjectChildTag: (tagId: string | undefined) => void;
  onSelectCategoryTags: (tagIds: string[]) => void;
  onSelectCategoryChildTags: (tagIds: string[]) => void;
}

export function TagFilter({ 
  projectTags, 
  categoryTags, 
  allTags, 
  type, 
  selectedProjectTag,
  selectedProjectChildTag,
  selectedCategoryTags,
  selectedCategoryChildTags,
  onSelectProjectTag,
  onSelectProjectChildTag,
  onSelectCategoryTags,
  onSelectCategoryChildTags
}: TagFilterProps) {
  if (projectTags.length === 0 && categoryTags.length === 0) return null;

  // Get child tags for selected project tag
  const projectChildTags = selectedProjectTag
    ? allTags.filter(tag => tag.parent_id === selectedProjectTag)
    : [];

  // Get child tags for all selected category tags
  const categoryChildTags = selectedCategoryTags.length > 0
    ? allTags.filter(tag => tag.parent_id && selectedCategoryTags.includes(tag.parent_id))
    : [];

  const renderProjectTagBadges = (tags: Tag[], isChildTag = false) => {
    return tags.map((tag) => {
      const isSelected = isChildTag 
        ? selectedProjectChildTag === tag.id
        : selectedProjectTag === tag.id;

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
              // Exclusive: toggle child tag
              onSelectProjectChildTag(isSelected ? undefined : tag.id);
            } else {
              // Exclusive: select this parent and clear child
              onSelectProjectTag(isSelected ? undefined : tag.id);
              onSelectProjectChildTag(undefined);
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
                  onSelectProjectChildTag(undefined);
                } else {
                  onSelectProjectTag(undefined);
                  onSelectProjectChildTag(undefined);
                }
              }}
            />
          )}
        </Badge>
      );
    });
  };

  const renderCategoryTagBadges = (tags: Tag[], isChildTag = false) => {
    return tags.map((tag) => {
      const isSelected = isChildTag 
        ? selectedCategoryChildTags.includes(tag.id)
        : selectedCategoryTags.includes(tag.id);

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
              // Cumulative: toggle child tag
              if (isSelected) {
                onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
              } else {
                onSelectCategoryChildTags([...selectedCategoryChildTags, tag.id]);
              }
            } else {
              // Cumulative: toggle parent tag
              if (isSelected) {
                onSelectCategoryTags(selectedCategoryTags.filter(id => id !== tag.id));
                // Clear child tags belonging to this parent
                const childTagIds = allTags
                  .filter(t => t.parent_id === tag.id)
                  .map(t => t.id);
                onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => !childTagIds.includes(id)));
              } else {
                onSelectCategoryTags([...selectedCategoryTags, tag.id]);
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
                  onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
                } else {
                  onSelectCategoryTags(selectedCategoryTags.filter(id => id !== tag.id));
                  // Clear child tags belonging to this parent
                  const childTagIds = allTags
                    .filter(t => t.parent_id === tag.id)
                    .map(t => t.id);
                  onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => !childTagIds.includes(id)));
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
        <>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {renderProjectTagBadges(projectTags)}
          </div>
          {projectChildTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {renderProjectTagBadges(projectChildTags, true)}
            </div>
          )}
        </>
      )}
      {categoryTags.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {renderCategoryTagBadges(categoryTags)}
          </div>
          {categoryChildTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {renderCategoryTagBadges(categoryChildTags, true)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
