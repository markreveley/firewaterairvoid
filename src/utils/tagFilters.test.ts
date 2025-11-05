import { describe, it, expect } from 'vitest';
import { getTagsForItemType, getAllTagsForItemType } from './tagFilters';
import type { Tag, ItemType } from '@/types';

describe('tagFilters utilities', () => {
  const mockTags: Tag[] = [
    // Fire tags
    { id: '1', name: 'Tourlab', type: 'fire' },
    { id: '2', name: 'Dirtwire', type: 'fire' },
    { id: '3', name: 'Dev', type: 'fire', parent_id: '1' }, // Child of Tourlab
    
    // Earth tags
    { id: '4', name: 'Marketing', type: 'earth' },
    { id: '5', name: 'Content', type: 'earth' },
    { id: '6', name: 'Blog', type: 'earth', parent_id: '5' }, // Child of Content
    
    // Air tags
    { id: '7', name: 'Research', type: 'air' },
    { id: '8', name: 'Analysis', type: 'air', parent_id: '7' }, // Child of Research
    
    // Void tags
    { id: '9', name: 'Archive', type: 'void' },
    { id: '10', name: 'Old Projects', type: 'void', parent_id: '9' }, // Child of Archive
  ];

  describe('getTagsForItemType', () => {
    it('should return only root fire tags for fire type', () => {
      const result = getTagsForItemType(mockTags, 'fire');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.name)).toEqual(['Tourlab', 'Dirtwire']);
    });

    it('should return only root earth tags for earth type', () => {
      const result = getTagsForItemType(mockTags, 'earth');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.name)).toContain('Marketing');
      expect(result.map(t => t.name)).toContain('Content');
    });

    it('should return only root air tags for air type', () => {
      const result = getTagsForItemType(mockTags, 'air');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Research');
    });

    it('should return only root void tags for void type', () => {
      const result = getTagsForItemType(mockTags, 'void');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Archive');
    });

    it('should return empty array for water type', () => {
      const result = getTagsForItemType(mockTags, 'water');
      expect(result).toHaveLength(0);
    });

    it('should not include child tags', () => {
      const fireResult = getTagsForItemType(mockTags, 'fire');
      expect(fireResult.some(t => t.name === 'Dev')).toBe(false);

      const earthResult = getTagsForItemType(mockTags, 'earth');
      expect(earthResult.some(t => t.name === 'Blog')).toBe(false);
    });
  });

  describe('getAllTagsForItemType', () => {
    it('should return all fire tags including children', () => {
      const result = getAllTagsForItemType(mockTags, 'fire');
      expect(result).toHaveLength(3);
      expect(result.map(t => t.name)).toContain('Tourlab');
      expect(result.map(t => t.name)).toContain('Dirtwire');
      expect(result.map(t => t.name)).toContain('Dev');
    });

    it('should return all earth tags including children', () => {
      const result = getAllTagsForItemType(mockTags, 'earth');
      expect(result).toHaveLength(3);
      expect(result.map(t => t.name)).toContain('Marketing');
      expect(result.map(t => t.name)).toContain('Content');
      expect(result.map(t => t.name)).toContain('Blog');
    });

    it('should return empty array for water type', () => {
      const result = getAllTagsForItemType(mockTags, 'water');
      expect(result).toHaveLength(0);
    });

    it('should not mix tags from different types', () => {
      const fireResult = getAllTagsForItemType(mockTags, 'fire');
      expect(fireResult.every(t => t.type === 'fire')).toBe(true);

      const earthResult = getAllTagsForItemType(mockTags, 'earth');
      expect(earthResult.every(t => t.type === 'earth')).toBe(true);
    });
  });
});
