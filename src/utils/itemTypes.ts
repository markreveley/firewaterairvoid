import type { ItemType } from "@/types";

/**
 * Check if an item type supports URL field
 */
export const supportsUrl = (type: ItemType): boolean => {
  return type === "air" || type === "void" || type === "earth";
};

/**
 * Check if an item type supports status field
 */
export const supportsStatus = (type: ItemType): boolean => {
  return type === "fire";
};

/**
 * Check if an item type supports deadline field
 */
export const supportsDeadline = (type: ItemType): boolean => {
  return type === "fire";
};
