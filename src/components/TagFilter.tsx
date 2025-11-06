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
  // If selectedProjectTag is not a root tag, show all siblings
  const selectedParentTag = selectedProjectTag ? allTags.find(t => t.id === selectedProjectTag) : null;
  const projectChildTags = selectedProjectTag
    ? selectedParentTag?.parent_id
      ? allTags.filter(tag => tag.parent_id === selectedParentTag.parent_id) // Show all siblings (including selected)
      : allTags.filter(tag => tag.parent_id === selectedProjectTag) // Show children of root tag
    : [];

  // Get grandchild tags (third row) - children of selected parent tag if it's not a root
  const projectGrandchildTags = selectedProjectTag && selectedParentTag?.parent_id
    ? allTags.filter(tag => tag.parent_id === selectedProjectTag)
    : selectedProjectChildTag
    ? allTags.filter(tag => tag.parent_id === selectedProjectChildTag)
    : [];

  // Get child tags for selected category tags (second row) - multi-select mode
  // Show children of all selected parent tags combined
  const categoryChildTags = selectedCategoryTags.length > 0
    ? allTags.filter(tag => 
        selectedCategoryTags.some(parentId => tag.parent_id === parentId)
      )
    : [];

  // Get grandchild tags (third row) - children of all selected child tags combined
  const categoryGrandchildTags = selectedCategoryChildTags.length > 0
    ? allTags.filter(tag => 
        selectedCategoryChildTags.some(childId => tag.parent_id === childId)
      )
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
              // If this tag is the selectedProjectTag itself, go back to parent
              if (tag.id === selectedProjectTag) {
                onSelectProjectTag(tag.parent_id);
                onSelectProjectChildTag(undefined);
              } else {
                // Otherwise just toggle child tag selection
                onSelectProjectChildTag(isSelected ? undefined : tag.id);
              }
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
                  // If this tag is the selectedProjectTag itself, go back to its parent
                  if (tag.id === selectedProjectTag) {
                    onSelectProjectTag(tag.parent_id);
                    onSelectProjectChildTag(undefined);
                  } else {
                    // Clear child selection, keep parent
                    onSelectProjectChildTag(undefined);
                  }
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

  const renderCategoryTagBadges = (tags: Tag[], isChildTag = false, isGrandchildTag = false) => {
    return tags.map((tag) => {
      const isSelected = isGrandchildTag
        ? selectedCategoryChildTags.includes(tag.id)
        : isChildTag
        ? (selectedCategoryChildTags.includes(tag.id) || selectedCategoryTags.includes(tag.id)) // Highlight if selected as parent or child
        : selectedCategoryTags.includes(tag.id); // Highlight if directly selected (multi-select mode)

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
              // Grandchild tag clicked - toggle in array (multi-select)
              if (isSelected) {
                onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
              } else {
                onSelectCategoryChildTags([...selectedCategoryChildTags, tag.id]);
              }
            } else if (isChildTag) {
              // Child tag clicked - toggle in array (multi-select)
              if (isSelected) {
                onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
              } else {
                onSelectCategoryChildTags([...selectedCategoryChildTags, tag.id]);
              }
            } else {
              // Parent tag clicked - toggle selection (multi-select)
              if (isSelected) {
                onSelectCategoryTags(selectedCategoryTags.filter(id => id !== tag.id));
                // Also clear any child tags that belonged to this parent
                const childTagsOfThisParent = allTags
                  .filter(t => t.parent_id === tag.id)
                  .map(t => t.id);
                onSelectCategoryChildTags(
                  selectedCategoryChildTags.filter(id => !childTagsOfThisParent.includes(id))
                );
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
                if (isGrandchildTag) {
                  // Remove this specific grandchild tag
                  onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
                } else if (isChildTag) {
                  // Remove this specific child tag
                  onSelectCategoryChildTags(selectedCategoryChildTags.filter(id => id !== tag.id));
                } else {
                  // Remove this specific parent tag and its children
                  onSelectCategoryTags(selectedCategoryTags.filter(id => id !== tag.id));
                  const childTagsOfThisParent = allTags
                    .filter(t => t.parent_id === tag.id)
                    .map(t => t.id);
                  onSelectCategoryChildTags(
                    selectedCategoryChildTags.filter(id => !childTagsOfThisParent.includes(id))
                  );
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
          {categoryGrandchildTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {renderCategoryTagBadges(categoryGrandchildTags, false, true)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
