import { dateToISOLikeButLocal, nowToISOLikeButLocal, nowToISOLikeButLocalForFilename } from './date.utils';

const FORBIDDEN_FILENAME_CHARS_REGEXP = /[\\/:*?"<>|]/;

describe('Tests suite for date utilities', () => {
  describe('dateToISOLikeButLocal', () => {
    it('should return a string in ISO-like format without timezone suffix', () => {
      // arrange
      const date = new Date('2024-03-15T14:30:45.123Z');

      // act
      const result = dateToISOLikeButLocal(date);

      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should not include the Z suffix or milliseconds', () => {
      // arrange
      const date = new Date('2024-03-15T14:30:45.123Z');

      // act
      const result = dateToISOLikeButLocal(date);

      // assert
      expect(result).not.toContain('Z');
      expect(result).not.toContain('.');
    });

    it('should return exactly 19 characters (yyyy-MM-ddTHH:mm:ss)', () => {
      // arrange
      const date = new Date('2024-03-15T14:30:45.123Z');

      // act
      const result = dateToISOLikeButLocal(date);

      // assert
      expect(result).toHaveLength(19);
    });

    it('should handle midnight correctly', () => {
      // arrange
      const date = new Date('2024-01-01T00:00:00.000Z');

      // act
      const result = dateToISOLikeButLocal(date);

      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle end of day correctly', () => {
      // arrange
      const date = new Date('2024-12-31T23:59:59.999Z');

      // act
      const result = dateToISOLikeButLocal(date);

      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('nowToISOLikeButLocal', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T14:30:45.123Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return a string in ISO-like format without timezone suffix', () => {
      // act
      const result = nowToISOLikeButLocal();

      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    it('should return exactly 19 characters', () => {
      // act
      const result = nowToISOLikeButLocal();

      // assert
      expect(result).toHaveLength(19);
    });

    it('should not include the Z suffix or milliseconds', () => {
      // act
      const result = nowToISOLikeButLocal();

      // assert
      expect(result).not.toContain('Z');
      expect(result).not.toContain('.');
    });
  });

  describe('nowToISOLikeButLocalForFilename', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T14:30:45.123Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return a string with dashes instead of colons for filename compatibility', () => {
      // act
      const result = nowToISOLikeButLocalForFilename();

      // assert
      expect(result).not.toContain(':');
    });

    it('should return a string in format yyyy-MM-ddTHH-mm-ss', () => {
      // act
      const result = nowToISOLikeButLocalForFilename();

      // assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });

    it('should return exactly 19 characters', () => {
      // act
      const result = nowToISOLikeButLocalForFilename();

      // assert
      expect(result).toHaveLength(19);
    });

    it('should be usable as a valid filename component', () => {
      // act
      const result = nowToISOLikeButLocalForFilename();

      // assert
      expect(result).not.toMatch(FORBIDDEN_FILENAME_CHARS_REGEXP);
    });
  });
});
