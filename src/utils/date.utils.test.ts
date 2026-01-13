import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dateToISOLikeButLocal,
  nowToISOLikeButLocal,
  nowToISOLikeButLocalForFilename,
} from './date.utils';

describe('Tests suite for date utilities', () => {
  describe('dateToISOLikeButLocal', () => {
    it('should return a string in ISO-like format without timezone suffix', () => {
      const date = new Date('2024-03-15T14:30:45.123Z');
      const result = dateToISOLikeButLocal(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should not include the Z suffix or milliseconds', () => {
      const date = new Date('2024-03-15T14:30:45.123Z');
      const result = dateToISOLikeButLocal(date);
      expect(result).not.toContain('Z');
      expect(result).not.toContain('.');
    });

    it('should return exactly 19 characters (yyyy-MM-ddTHH:mm:ss)', () => {
      const date = new Date('2024-03-15T14:30:45.123Z');
      const result = dateToISOLikeButLocal(date);
      expect(result).toHaveLength(19);
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = dateToISOLikeButLocal(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle end of day correctly', () => {
      const date = new Date('2024-12-31T23:59:59.999Z');
      const result = dateToISOLikeButLocal(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('nowToISOLikeButLocal', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T14:30:45.123Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a string in ISO-like format without timezone suffix', () => {
      const result = nowToISOLikeButLocal();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should return exactly 19 characters', () => {
      const result = nowToISOLikeButLocal();
      expect(result).toHaveLength(19);
    });

    it('should not include the Z suffix or milliseconds', () => {
      const result = nowToISOLikeButLocal();
      expect(result).not.toContain('Z');
      expect(result).not.toContain('.');
    });
  });

  describe('nowToISOLikeButLocalForFilename', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T14:30:45.123Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a string with dashes instead of colons for filename compatibility', () => {
      const result = nowToISOLikeButLocalForFilename();
      expect(result).not.toContain(':');
    });

    it('should return a string in format yyyy-MM-ddTHH-mm-ss', () => {
      const result = nowToISOLikeButLocalForFilename();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });

    it('should return exactly 19 characters', () => {
      const result = nowToISOLikeButLocalForFilename();
      expect(result).toHaveLength(19);
    });

    it('should be usable as a valid filename component', () => {
      const result = nowToISOLikeButLocalForFilename();
      // Filenames should not contain these characters: \ / : * ? " < > |
      expect(result).not.toMatch(/[\\/:*?"<>|]/);
    });
  });
});
