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

  // Always show root tags in the first row
  const projectParentTags = projectTags;

  // Find the root ancestor of selectedProjectTag for highlighting
  const selectedParent = selectedProjectTag ? allTags.find(t => t.id === selectedProjectTag) : null;
  let rootAncestorId = selectedProjectTag;
  if (selectedParent) {
    let current = selectedParent;
    while (current.parent_id) {
      const parent = allTags.find(t => t.id === current.parent_id);
      if (!parent) break;
      rootAncestorId = parent.id;
      current = parent;
    }
  }

  // Get child tags for selected project tag (second row)
  // If selectedProjectTag is not a root tag, show it and its siblings
  const selectedParentTag = selectedProjectTag ? allTags.find(t => t.id === selectedProjectTag) : null;
  const projectChildTags = selectedProjectTag
    ? selectedParentTag?.parent_id
      ? [selectedParentTag] // Show the selected non-root tag itself
      : allTags.filter(tag => tag.parent_id === selectedProjectTag) // Show children of root tag
    : [];

  // Get grandchild tags (third row) - children of selected parent tag if it's not a root
  const projectGrandchildTags = selectedProjectTag && selectedParentTag?.parent_id
    ? allTags.filter(tag => tag.parent_id === selectedProjectTag)
    : selectedProjectChildTag
    ? allTags.filter(tag => tag.parent_id === selectedProjectChildTag)
    : [];

  // Get child tags for all selected category tags
  // If child tags are selected, show their children; otherwise show children of selected parent tags
  const categoryChildTags = selectedCategoryChildTags.length > 0
    ? allTags.filter(tag => tag.parent_id && selectedCategoryChildTags.includes(tag.parent_id))
    : selectedCategoryTags.length > 0
    ? allTags.filter(tag => tag.parent_id && selectedCategoryTags.includes(tag.parent_id))
    : [];

  const renderProjectTagBadges = (tags: Tag[], isChildTag = false, isGrandchildTag = false) => {
    return tags.map((tag) => {
      const isSelected = isGrandchildTag
        ? selectedProjectChildTag === tag.id
        : isChildTag
        ? (selectedProjectChildTag === tag.id || selectedProjectTag === tag.id) // Highlight if selected as parent or child
        : (selectedProjectTag === tag.id || rootAncestorId === tag.id); // Highlight if selected or is ancestor

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
              ? "bg-fire-light text-fire-dark dark:text-foreground hover:bg-fire-secondary"
              : type === "water"
              ? "bg-water-light text-water-dark dark:text-foreground hover:bg-water-secondary"
              : type === "air"
              ? "bg-air-light text-air-dark dark:text-foreground hover:bg-air-secondary"
              : type === "earth"
              ? "bg-earth-light text-earth-dark dark:text-foreground hover:bg-earth-secondary"
              : "bg-void-light text-void-dark dark:text-foreground hover:bg-white hover:text-black hover:border-black"
          )}
          onClick={() => {
            if (isGrandchildTag) {
              // Grandchild tag clicked - promote parent to selectedProjectTag
              // and this tag to selectedProjectChildTag
              if (isSelected) {
                // Deselect: go back to just having the parent selected
                onSelectProjectChildTag(undefined);
              } else {
                // Select: set parent as selectedProjectTag and this as selectedProjectChildTag
                onSelectProjectTag(tag.parent_id || selectedProjectTag);
                onSelectProjectChildTag(tag.id);
              }
            } else if (isChildTag) {
              // Select/deselect child tag (both leaf and branch tags)
              onSelectProjectChildTag(isSelected ? undefined : tag.id);
            } else {
              // Parent tag clicked - toggle selection
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
                if (isGrandchildTag) {
                  // Clear grandchild selection, keep parent (go back to showing just Rust)
                  onSelectProjectChildTag(undefined);
                } else if (isChildTag) {
                  // Clear child selection, keep parent
                  onSelectProjectChildTag(undefined);
                } else {
                  // Clear parent selection
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
              ? "bg-fire-light text-fire-dark dark:text-foreground hover:bg-fire-secondary"
              : type === "water"
              ? "bg-water-light text-water-dark dark:text-foreground hover:bg-water-secondary"
              : type === "air"
              ? "bg-air-light text-air-dark dark:text-foreground hover:bg-air-secondary"
              : type === "earth"
              ? "bg-earth-light text-earth-dark dark:text-foreground hover:bg-earth-secondary"
              : "bg-void-light text-void-dark dark:text-foreground hover:bg-white hover:text-black hover:border-black"
          )}
          onClick={() => {
            if (isChildTag) {
              // Check if this child tag has its own children
              const hasChildren = allTags.some(t => t.parent_id === tag.id);
              if (hasChildren) {
                // Promote to parent level for deeper navigation
                // Clear current selections and select this as parent
                onSelectCategoryTags([tag.id]);
                onSelectCategoryChildTags([]);
              } else {
                // Leaf tag: cumulative toggle
                if (isSelected) {
                  onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
                } else {
                  onSelectCategoryChildTags([...selectedCategoryChildTags, tag.id]);
                }
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
            {renderProjectTagBadges(projectParentTags)}
          </div>
          {projectChildTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {renderProjectTagBadges(projectChildTags, true)}
            </div>
          )}
          {projectGrandchildTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {renderProjectTagBadges(projectGrandchildTags, false, true)}
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
