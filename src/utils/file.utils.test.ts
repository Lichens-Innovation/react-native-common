import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isFileUri, normalizeFileUri, nowAsIsoFilename } from './file.utils';

describe('Tests suite for file utilities', () => {
  describe('nowAsIsoFilename', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T14:30:45.123Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a string with underscores instead of colons', () => {
      const result = nowAsIsoFilename();
      expect(result).not.toContain(':');
      expect(result).toContain('_');
    });

    it('should return a string in ISO format with underscores', () => {
      const result = nowAsIsoFilename();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}_\d{2}_\d{2}\.\d{3}Z$/);
    });

    it('should be usable as a valid filename component', () => {
      const result = nowAsIsoFilename();
      // Filenames should not contain these characters: \ / : * ? " < > |
      expect(result).not.toMatch(/[\\/:*?"<>|]/);
    });

    it('should replace all colons with underscores', () => {
      const result = nowAsIsoFilename();
      const colonCount = (result.match(/:/g) || []).length;
      expect(colonCount).toBe(0);
    });
  });

  describe('isFileUri', () => {
    it.each`
      uri                                       | expected
      ${'file:///path/to/file.txt'}             | ${true}
      ${'file:///C:/path/to/file.txt'}          | ${true}
      ${'file:///path/to/file.txt?query=value'} | ${true}
      ${'/path/to/file.txt'}                    | ${false}
      ${'path/to/file.txt'}                     | ${false}
      ${'http://example.com/file.txt'}          | ${false}
      ${'https://example.com/file.txt'}         | ${false}
      ${'content://path/to/file.txt'}           | ${false}
      ${''}                                     | ${false}
      ${'not a valid uri'}                      | ${false}
    `('should return $expected for $uri', ({ uri, expected }) => {
      expect(isFileUri(uri)).toBe(expected);
    });
  });

  describe('normalizeFileUri', () => {
    it.each`
      uri                               | expected
      ${'file:///path/to/file.txt'}     | ${'file:///path/to/file.txt'}
      ${'/path/to/file.txt'}            | ${'file:///path/to/file.txt'}
      ${'path/to/file.txt'}             | ${'file://path/to/file.txt'}
      ${null}                           | ${''}
      ${undefined}                      | ${''}
      ${''}                             | ${''}
      ${'http://example.com/file.txt'}  | ${''}
      ${'https://example.com/file.txt'} | ${''}
      ${'content://path/to/file.txt'}   | ${''}
    `('should return $expected for $uri', ({ uri, expected }) => {
      expect(normalizeFileUri(uri)).toBe(expected);
    });
  });
});
