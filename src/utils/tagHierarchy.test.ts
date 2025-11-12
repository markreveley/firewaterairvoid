import { describe, it, expect } from 'vitest';
import { getAllParentTags, getTagsWithParents } from './tagHierarchy';
import type { Tag } from '@/types';

describe('tagHierarchy', () => {
  const mockTags: Tag[] = [
    { id: 'dirtwire', name: 'Dirtwire', parent_id: null },
    { id: 'production', name: 'Production', parent_id: 'dirtwire' },
    { id: 'library', name: 'Library', parent_id: 'production' },
    { id: 'vieux', name: 'Vieux', parent_id: 'production' },
    { id: 'maple', name: 'Maple', parent_id: null },
    { id: 'socials', name: 'Socials', parent_id: 'maple' },
  ];

  describe('getAllParentTags', () => {
    it('should return all parent tags in order from immediate parent to root', () => {
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const parents = getAllParentTags(libraryTag, mockTags);

      expect(parents).toHaveLength(2);
      expect(parents[0].name).toBe('Production');
      expect(parents[1].name).toBe('Dirtwire');
    });

    it('should return single parent for tag with one level', () => {
      const productionTag = mockTags.find(t => t.name === 'Production')!;
      const parents = getAllParentTags(productionTag, mockTags);

      expect(parents).toHaveLength(1);
      expect(parents[0].name).toBe('Dirtwire');
    });

    it('should return empty array for root tag', () => {
      const dirtwireTag = mockTags.find(t => t.name === 'Dirtwire')!;
      const parents = getAllParentTags(dirtwireTag, mockTags);

      expect(parents).toHaveLength(0);
    });

    it('should handle broken parent chain gracefully', () => {
      const orphanTag: Tag = { id: 'orphan', name: 'Orphan', parent_id: 'nonexistent' };
      const parents = getAllParentTags(orphanTag, mockTags);

      expect(parents).toHaveLength(0);
    });
  });

  describe('getTagsWithParents', () => {
    it('should include selected tag and all parent tags', () => {
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const result = getTagsWithParents([libraryTag], mockTags);

      expect(result).toHaveLength(3);
      expect(result.map(t => t.name)).toEqual(['Library', 'Production', 'Dirtwire']);
    });

    it('should maintain order: selected tag first, then parents in hierarchy order', () => {
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const result = getTagsWithParents([libraryTag], mockTags);

      // Order should be: child, parent, grandparent (for display left-to-right)
      expect(result[0].name).toBe('Library');
      expect(result[1].name).toBe('Production');
      expect(result[2].name).toBe('Dirtwire');
    });

    it('should handle root tag without parents', () => {
      const dirtwireTag = mockTags.find(t => t.name === 'Dirtwire')!;
      const result = getTagsWithParents([dirtwireTag], mockTags);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dirtwire');
    });

    it('should handle multiple tags from same hierarchy without duplicates', () => {
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const productionTag = mockTags.find(t => t.name === 'Production')!;
      const result = getTagsWithParents([libraryTag, productionTag], mockTags);

      // Should have: Library, Production, Dirtwire (no duplicates)
      expect(result).toHaveLength(3);
      expect(result.map(t => t.name)).toEqual(['Library', 'Production', 'Dirtwire']);
    });

    it('should handle multiple tags from different hierarchies', () => {
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const socialsTag = mockTags.find(t => t.name === 'Socials')!;
      const result = getTagsWithParents([libraryTag, socialsTag], mockTags);

      // Should have: Library, Production, Dirtwire, Socials, Maple
      expect(result).toHaveLength(5);
      const names = result.map(t => t.name);
      expect(names).toContain('Library');
      expect(names).toContain('Production');
      expect(names).toContain('Dirtwire');
      expect(names).toContain('Socials');
      expect(names).toContain('Maple');
    });

    it('should deduplicate tags when common parent exists', () => {
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const vieuxTag = mockTags.find(t => t.name === 'Vieux')!;
      const result = getTagsWithParents([libraryTag, vieuxTag], mockTags);

      // Both have Production → Dirtwire as parents
      // Should have: Library, Production, Dirtwire, Vieux (Dirtwire and Production not duplicated)
      expect(result).toHaveLength(4);
      const names = result.map(t => t.name);
      expect(names).toContain('Library');
      expect(names).toContain('Vieux');
      expect(names).toContain('Production');
      expect(names).toContain('Dirtwire');

      // Verify no duplicates
      const uniqueIds = new Set(result.map(t => t.id));
      expect(uniqueIds.size).toBe(4);
    });

    it('should return empty array for empty input', () => {
      const result = getTagsWithParents([], mockTags);
      expect(result).toHaveLength(0);
    });

    it('should document expected display order from left to right', () => {
      // This test documents the expected behavior for display
      const libraryTag = mockTags.find(t => t.name === 'Library')!;
      const result = getTagsWithParents([libraryTag], mockTags);

      // When displayed left-to-right as badges, should show:
      // (Library) (Production) (Dirtwire)
      //  ^child    ^parent     ^grandparent/root
      //  left                  right

      expect(result[0].name).toBe('Library'); // Leftmost (most specific)
      expect(result[result.length - 1].name).toBe('Dirtwire'); // Rightmost (least specific/root)
    });

    it('BUG: should maintain correct order when multiple tags from same hierarchy are selected', () => {
      // This reproduces the user-reported bug:
      // User selects Production AND Library from dropdown
      // Expected: [Library, Production, Dirtwire] (most specific to least)
      // Actual bug: [Production, Dirtwire, Library] (wrong order!)

      const productionTag = mockTags.find(t => t.name === 'Production')!;
      const libraryTag = mockTags.find(t => t.name === 'Library')!;

      // Simulating user selecting both tags (Library is more specific than Production)
      const result = getTagsWithParents([productionTag, libraryTag], mockTags);

      // Should be ordered by specificity: Library (deepest) → Production → Dirtwire (root)
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Library'); // Most specific (deepest child)
      expect(result[1].name).toBe('Production'); // Middle
      expect(result[2].name).toBe('Dirtwire'); // Least specific (root)
    });

    it('BUG: should maintain correct order regardless of input tag order', () => {
      // Tags might be selected in any order in the UI
      // But output should ALWAYS be ordered by specificity (deepest first)

      const productionTag = mockTags.find(t => t.name === 'Production')!;
      const libraryTag = mockTags.find(t => t.name === 'Library')!;

      // Try both orderings - result should be the same
      const result1 = getTagsWithParents([productionTag, libraryTag], mockTags);
      const result2 = getTagsWithParents([libraryTag, productionTag], mockTags);

      // Both should produce same order: Library → Production → Dirtwire
      expect(result1.map(t => t.name)).toEqual(['Library', 'Production', 'Dirtwire']);
      expect(result2.map(t => t.name)).toEqual(['Library', 'Production', 'Dirtwire']);
    });
  });
});
