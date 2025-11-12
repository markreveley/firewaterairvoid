import type { Tag } from "@/types";

/**
 * Get all parent tags for a given tag by traversing up the hierarchy
 */
export function getAllParentTags(tag: Tag, allTags: Tag[]): Tag[] {
  const parents: Tag[] = [];
  let currentTag = tag;

  while (currentTag.parent_id) {
    const parent = allTags.find(t => t.id === currentTag.parent_id);
    if (parent) {
      parents.push(parent);
      currentTag = parent;
    } else {
      break;
    }
  }

  return parents;
}

/**
 * Get the depth of a tag in the hierarchy (number of parents)
 */
function getTagDepth(tag: Tag, allTags: Tag[]): number {
  return getAllParentTags(tag, allTags).length;
}

/**
 * Expand selected tags to include all parent tags in the hierarchy
 *
 * Tags are returned in order of specificity (deepest/most specific first, root last)
 * This ensures consistent display order: (Child) (Parent) (Grandparent)
 *
 * @example
 * // If user selects "Library" (child of "Production", child of "Dirtwire")
 * // This returns [Library, Production, Dirtwire] - ordered by depth
 * getTagsWithParents([libraryTag], allTags)
 *
 * @example
 * // Even if user selects both Production AND Library
 * // This still returns [Library, Production, Dirtwire] - Library is deepest
 * getTagsWithParents([productionTag, libraryTag], allTags)
 */
export function getTagsWithParents(tags: Tag[], allTags: Tag[]): Tag[] {
  const tagSet = new Set<string>();
  const result: Tag[] = [];

  tags.forEach(tag => {
    // Add the tag itself
    if (!tagSet.has(tag.id)) {
      tagSet.add(tag.id);
      result.push(tag);
    }

    // Add all its parents
    const parents = getAllParentTags(tag, allTags);
    parents.forEach(parent => {
      if (!tagSet.has(parent.id)) {
        tagSet.add(parent.id);
        result.push(parent);
      }
    });
  });

  // Sort by depth (deepest/most specific first, root last)
  // This ensures consistent order: (Child) (Parent) (Grandparent)
  result.sort((a, b) => {
    const depthA = getTagDepth(a, allTags);
    const depthB = getTagDepth(b, allTags);
    return depthB - depthA; // Higher depth (more specific) comes first
  });

  return result;
}
