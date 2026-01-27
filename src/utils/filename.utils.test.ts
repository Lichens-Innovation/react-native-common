import { describe, expect, it } from 'vitest';
import {
  getDirectoryOnly,
  getFileExtensionOnly,
  getFilenameOnly,
  getFilenameWithoutExtension,
  hasExtension,
  hasFileSeparator,
} from './filename.utils';

describe('Tests suite for filename utilities', () => {
  describe('hasFileSeparator', () => {
    it.each`
      fileUri                              | expected
      ${'/path/to/file.txt'}               | ${true}
      ${'/very/long/path/to/document.pdf'} | ${true}
      ${'/'}                               | ${true}
      ${''}                                | ${false}
      ${undefined}                         | ${false}
      ${null}                              | ${false}
      ${'/path/to/file'}                   | ${true}
      ${'file:///path/to/file.txt'}        | ${true}
      ${'file.txt'}                        | ${false}
      ${'file'}                            | ${false}
      ${'relative/path/file.txt'}          | ${true}
    `('should return $expected for $fileUri', ({ fileUri, expected }) => {
      expect(hasFileSeparator(fileUri)).toBe(expected);
    });
  });

  describe('getFilenameOnly', () => {
    it.each`
      fileUri                              | expected
      ${'/path/to/file.txt'}               | ${'file.txt'}
      ${'/very/long/path/to/document.pdf'} | ${'document.pdf'}
      ${'/'}                               | ${''}
      ${''}                                | ${''}
      ${'/path/to/file'}                   | ${'file'}
      ${'file:///path/to/file.txt'}        | ${'file.txt'}
      ${'file.txt'}                        | ${'file.txt'}
      ${'file'}                            | ${'file'}
      ${'relative/path/file.txt'}          | ${'file.txt'}
    `('should return $expected for $fileUri', ({ fileUri, expected }) => {
      expect(getFilenameOnly(fileUri)).toBe(expected);
    });
  });

  describe('hasExtension', () => {
    it.each`
      fileUri                          | expected
      ${'/path/to/file.txt'}           | ${true}
      ${'/path/to/document.pdf'}       | ${true}
      ${'/path/to/image.JPG'}          | ${true}
      ${'/path/to/video.mp4'}          | ${true}
      ${'/path/to/file.backup.tar.gz'} | ${true}
      ${'/path/to/.hidden'}            | ${true}
      ${'/path/to/file'}               | ${false}
      ${'/'}                           | ${false}
      ${''}                            | ${false}
      ${'file.txt'}                    | ${true}
      ${'file'}                        | ${false}
      ${'/path.with.dots/file'}        | ${false}
      ${'/some.dir/another.dir/file'}  | ${false}
      ${'file.'}                       | ${true}
    `('should return $expected for $fileUri', ({ fileUri, expected }) => {
      expect(hasExtension(fileUri)).toBe(expected);
    });
  });

  describe('getFileExtensionOnly', () => {
    it.each`
      fileUri                          | expected
      ${'/path/to/file.TXT'}           | ${'txt'}
      ${'/path/to/document.pdf'}       | ${'pdf'}
      ${'/path/to/image.JPG'}          | ${'jpg'}
      ${'/path/to/video.mp4'}          | ${'mp4'}
      ${'/path/to/file.backup.tar.gz'} | ${'gz'}
      ${'/path/to/.hidden'}            | ${'hidden'}
      ${'/path/to/file'}               | ${''}
      ${'/'}                           | ${''}
      ${''}                            | ${''}
      ${'file.txt'}                    | ${'txt'}
      ${'file'}                        | ${''}
      ${'file.'}                       | ${''}
    `('should return $expected for $fileUri', ({ fileUri, expected }) => {
      expect(getFileExtensionOnly(fileUri)).toBe(expected);
    });
  });

  describe('getFilenameWithoutExtension', () => {
    it.each`
      fileUri                          | expected
      ${'/path/to/file.txt'}           | ${'file'}
      ${'/path/to/document.pdf'}       | ${'document'}
      ${'/path/to/image.JPG'}          | ${'image'}
      ${'/path/to/video.mp4'}          | ${'video'}
      ${'/path/to/file.backup.tar.gz'} | ${'file.backup.tar'}
      ${'/path/to/.hidden'}            | ${''}
      ${'/path/to/file'}               | ${'file'}
      ${'/'}                           | ${''}
      ${''}                            | ${''}
      ${'file.txt'}                    | ${'file'}
      ${'file'}                        | ${'file'}
      ${'my.file.txt'}                 | ${'my.file'}
      ${'file.'}                       | ${'file'}
    `('should return $expected for $fileUri', ({ fileUri, expected }) => {
      expect(getFilenameWithoutExtension(fileUri)).toBe(expected);
    });
  });

  describe('getDirectoryOnly', () => {
    it.each`
      fileUri                              | expected
      ${'/path/to/file.txt'}               | ${'/path/to'}
      ${'/very/long/path/to/document.pdf'} | ${'/very/long/path/to'}
      ${'/'}                               | ${''}
      ${''}                                | ${''}
      ${'file.txt'}                        | ${''}
      ${'file:///path/to/file.txt'}        | ${'file:///path/to'}
    `('should return $expected for $fileUri', ({ fileUri, expected }) => {
      expect(getDirectoryOnly(fileUri)).toBe(expected);
    });
  });
});
