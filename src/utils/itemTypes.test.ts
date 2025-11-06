import { describe, it, expect } from 'vitest';
import { supportsUrl, supportsStatus, supportsDeadline } from './itemTypes';
import type { ItemType } from '@/types';

describe('itemTypes utilities', () => {
  describe('supportsUrl', () => {
    it('should return true for air, void, and earth types', () => {
      expect(supportsUrl('air')).toBe(true);
      expect(supportsUrl('void')).toBe(true);
      expect(supportsUrl('earth')).toBe(true);
    });

    it('should return false for fire and water types', () => {
      expect(supportsUrl('fire')).toBe(false);
      expect(supportsUrl('water')).toBe(false);
    });
  });

  describe('supportsStatus', () => {
    it('should return true only for fire type', () => {
      expect(supportsStatus('fire')).toBe(true);
    });

    it('should return false for all other types', () => {
      expect(supportsStatus('water')).toBe(false);
      expect(supportsStatus('air')).toBe(false);
      expect(supportsStatus('earth')).toBe(false);
      expect(supportsStatus('void')).toBe(false);
    });
  });

  describe('supportsDeadline', () => {
    it('should return true for fire and water types', () => {
      expect(supportsDeadline('fire')).toBe(true);
      expect(supportsDeadline('water')).toBe(true);
    });

    it('should return false for air, earth, and void types', () => {
      expect(supportsDeadline('air')).toBe(false);
      expect(supportsDeadline('earth')).toBe(false);
      expect(supportsDeadline('void')).toBe(false);
    });
  });
});
