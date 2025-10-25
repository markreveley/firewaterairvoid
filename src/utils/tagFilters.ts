import type { Tag, ItemType } from "@/types";
import { FIRE_TAG_NAMES } from "@/constants/tags";

/**
 * Get filtered tags for a specific item type
 * Returns primary tags (fire tags) and secondary tags (non-fire tags) based on item type
 */
export const getTagsForItemType = (
  allTags: Tag[],
  itemType: ItemType
): { primaryTags: Tag[]; secondaryTags: Tag[] } => {
  const primaryTags = allTags.filter(tag => FIRE_TAG_NAMES.includes(tag.name as any));
  const secondaryTags = allTags.filter(tag => !FIRE_TAG_NAMES.includes(tag.name as any));

  const showPrimaryTags = itemType === "fire" || itemType === "water";
  const showSecondaryTags = itemType === "water" || itemType === "earth" || itemType === "air" || itemType === "void";

  return {
    primaryTags: showPrimaryTags ? primaryTags : [],
    secondaryTags: showSecondaryTags ? secondaryTags : []
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
