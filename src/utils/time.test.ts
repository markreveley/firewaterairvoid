import { describe, it, expect } from 'vitest';
import { generateTimeOptions } from './time';

describe('time utilities', () => {
  describe('generateTimeOptions', () => {
    it('should generate 96 time slots (15-minute intervals for 24 hours)', () => {
      const options = generateTimeOptions();
      expect(options).toHaveLength(96);
    });

    it('should start with 00:00', () => {
      const options = generateTimeOptions();
      expect(options[0]).toBe('00:00');
    });

    it('should end with 23:45', () => {
      const options = generateTimeOptions();
      expect(options[95]).toBe('23:45');
    });

    it('should include common times with correct format', () => {
      const options = generateTimeOptions();
      expect(options).toContain('09:00');
      expect(options).toContain('12:00');
      expect(options).toContain('18:30');
    });

    it('should have 15-minute intervals', () => {
      const options = generateTimeOptions();
      expect(options[0]).toBe('00:00');
      expect(options[1]).toBe('00:15');
      expect(options[2]).toBe('00:30');
      expect(options[3]).toBe('00:45');
      expect(options[4]).toBe('01:00');
    });

    it('should format single-digit hours with leading zeros', () => {
      const options = generateTimeOptions();
      const morningTimes = options.slice(0, 40); // 00:00 to 09:45
      morningTimes.forEach(time => {
        expect(time).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });
});
