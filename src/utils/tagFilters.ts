import type { Tag, ItemType } from "@/types";
import { FIRE_TAG_NAMES } from "@/constants/tags";

/**
 * Get filtered tags for a specific item type
 * Returns project tags (fire tags) and category tags (non-fire tags) based on item type
 */
export const getTagsForItemType = (
  allTags: Tag[],
  itemType: ItemType
): { projectTags: Tag[]; categoryTags: Tag[] } => {
  const projectTags = allTags.filter(tag => FIRE_TAG_NAMES.includes(tag.name as any));
  const categoryTags = allTags.filter(tag => !FIRE_TAG_NAMES.includes(tag.name as any));

  const showProjectTags = itemType === "fire" || itemType === "water";
  const showCategoryTags = itemType === "water" || itemType === "earth" || itemType === "air" || itemType === "void";

  return {
    projectTags: showProjectTags ? projectTags : [],
    categoryTags: showCategoryTags ? categoryTags : []
  };
};

/**
 * Filter tags based on item type (for ItemDetail component)
 */
export const filterTagsForItemType = (existingTags: Tag[], itemType: ItemType): Tag[] => {
  if (itemType === "fire") {
    return existingTags.filter(tag => FIRE_TAG_NAMES.includes(tag.name as any));
  }
  return existingTags.filter(tag => !FIRE_TAG_NAMES.includes(tag.name as any));
};

/**
 * Get project tags (fire tags) and category tags (non-fire tags) separately
 * Used for water items where both sets are displayed
 */
export const getProjectAndCategoryTags = (
  allTags: Tag[],
  itemType: ItemType
): { projectTags: Tag[]; categoryTags: Tag[] } => {
  const projectTags = allTags.filter(tag => FIRE_TAG_NAMES.includes(tag.name as any) && !tag.parent_id);
  const categoryTags = allTags.filter(tag => !FIRE_TAG_NAMES.includes(tag.name as any) && !tag.parent_id);
  
  if (itemType === "water") {
    return { projectTags, categoryTags };
  }
  
  return { projectTags: [], categoryTags: [] };
};
