import { describe, it, expect } from 'vitest';
import { getTagsForItemType, filterTagsForItemType, getProjectAndCategoryTags } from './tagFilters';
import type { Tag, ItemType } from '@/types';

describe('tagFilters utilities', () => {
  const mockTags: Tag[] = [
    { id: '1', name: 'Tourlab' }, // Fire tag
    { id: '2', name: 'Dirtwire' }, // Fire tag
    { id: '3', name: 'Dev' }, // Fire tag
    { id: '4', name: 'Marketing' }, // Non-fire tag
    { id: '5', name: 'Research' }, // Non-fire tag
    { id: '6', name: 'Design', parent_id: '4' }, // Child of Marketing
  ];

  describe('getTagsForItemType', () => {
    it('should return only project tags for fire type', () => {
      const result = getTagsForItemType(mockTags, 'fire');
      expect(result.projectTags).toHaveLength(3);
      expect(result.categoryTags).toHaveLength(0);
      expect(result.projectTags.map(t => t.name)).toEqual(['Tourlab', 'Dirtwire', 'Dev']);
    });

    it('should return both project and category tags for water type', () => {
      const result = getTagsForItemType(mockTags, 'water');
      expect(result.projectTags).toHaveLength(3); // Project tags
      expect(result.categoryTags).toHaveLength(3); // Category tags
    });

    it('should return only category tags for air type', () => {
      const result = getTagsForItemType(mockTags, 'air');
      expect(result.projectTags).toHaveLength(0);
      expect(result.categoryTags).toHaveLength(3);
      expect(result.categoryTags.map(t => t.name)).toContain('Marketing');
      expect(result.categoryTags.map(t => t.name)).toContain('Research');
    });

    it('should return only category tags for earth type', () => {
      const result = getTagsForItemType(mockTags, 'earth');
      expect(result.projectTags).toHaveLength(0);
      expect(result.categoryTags).toHaveLength(3);
    });

    it('should return only category tags for void type', () => {
      const result = getTagsForItemType(mockTags, 'void');
      expect(result.projectTags).toHaveLength(0);
      expect(result.categoryTags).toHaveLength(3);
    });
  });

  describe('filterTagsForItemType', () => {
    it('should return fire tags for fire type', () => {
      const result = filterTagsForItemType(mockTags, 'fire');
      expect(result).toHaveLength(3);
      expect(result.every(t => ['Tourlab', 'Dirtwire', 'Dev'].includes(t.name))).toBe(true);
    });

    it('should return non-fire tags for non-fire types', () => {
      const airResult = filterTagsForItemType(mockTags, 'air');
      expect(airResult).toHaveLength(3);
      expect(airResult.every(t => !['Tourlab', 'Dirtwire', 'Dev'].includes(t.name))).toBe(true);

      const waterResult = filterTagsForItemType(mockTags, 'water');
      expect(waterResult).toHaveLength(3);
    });
  });

  describe('getProjectAndCategoryTags', () => {
    it('should return both project and category tags for water type', () => {
      const result = getProjectAndCategoryTags(mockTags, 'water');
      expect(result.projectTags).toHaveLength(3);
      expect(result.categoryTags).toHaveLength(2); // Excludes child tag
      expect(result.projectTags.map(t => t.name)).toEqual(['Tourlab', 'Dirtwire', 'Dev']);
      expect(result.categoryTags.map(t => t.name)).toContain('Marketing');
      expect(result.categoryTags.map(t => t.name)).toContain('Research');
    });

    it('should return empty arrays for non-water types', () => {
      const fireResult = getProjectAndCategoryTags(mockTags, 'fire');
      expect(fireResult.projectTags).toHaveLength(0);
      expect(fireResult.categoryTags).toHaveLength(0);

      const airResult = getProjectAndCategoryTags(mockTags, 'air');
      expect(airResult.projectTags).toHaveLength(0);
      expect(airResult.categoryTags).toHaveLength(0);
    });

    it('should exclude child tags from both project and category tags', () => {
      const result = getProjectAndCategoryTags(mockTags, 'water');
      expect(result.projectTags.some(t => t.parent_id)).toBe(false);
      expect(result.categoryTags.some(t => t.parent_id)).toBe(false);
    });
  });
});
