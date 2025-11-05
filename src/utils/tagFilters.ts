import type { Tag, ItemType } from "@/types";

/**
 * Get tags filtered for a specific item type
 * Each type has completely independent tags except water which has no tags
 */
export const getTagsForItemType = (
  allTags: Tag[],
  itemType: ItemType
): Tag[] => {
  // Water items have no tags
  if (itemType === "water") {
    return [];
  }
  
  // Return only root tags (no parent) matching the item type
  return allTags.filter(tag => tag.type === itemType && !tag.parent_id);
};

/**
 * Get all tags (including children) for a specific item type
 * Used when you need the full tag tree
 */
export const getAllTagsForItemType = (
  allTags: Tag[],
  itemType: ItemType
): Tag[] => {
  // Water items have no tags
  if (itemType === "water") {
    return [];
  }
  
  // Return all tags matching the item type (root and children)
  return allTags.filter(tag => tag.type === itemType);
};
