import { describe, it, expect } from 'vitest';
import { getTagsForItemType, filterTagsForItemType } from './tagFilters';
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
    it('should return only fire tags for fire type', () => {
      const result = getTagsForItemType(mockTags, 'fire');
      expect(result.primaryTags).toHaveLength(3);
      expect(result.secondaryTags).toHaveLength(0);
      expect(result.primaryTags.map(t => t.name)).toEqual(['Tourlab', 'Dirtwire', 'Dev']);
    });

    it('should return both primary and secondary tags for water type', () => {
      const result = getTagsForItemType(mockTags, 'water');
      expect(result.primaryTags).toHaveLength(3); // Fire tags
      expect(result.secondaryTags).toHaveLength(3); // Non-fire tags
    });

    it('should return only secondary tags for air type', () => {
      const result = getTagsForItemType(mockTags, 'air');
      expect(result.primaryTags).toHaveLength(0);
      expect(result.secondaryTags).toHaveLength(3);
      expect(result.secondaryTags.map(t => t.name)).toContain('Marketing');
      expect(result.secondaryTags.map(t => t.name)).toContain('Research');
    });

    it('should return only secondary tags for earth type', () => {
      const result = getTagsForItemType(mockTags, 'earth');
      expect(result.primaryTags).toHaveLength(0);
      expect(result.secondaryTags).toHaveLength(3);
    });

    it('should return only secondary tags for void type', () => {
      const result = getTagsForItemType(mockTags, 'void');
      expect(result.primaryTags).toHaveLength(0);
      expect(result.secondaryTags).toHaveLength(3);
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
});
