import { ImageManipulator } from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {
  IMAGE_JPEG_COMPRESSION,
  getMediaTypeFromUri,
  getThumbnailUri,
  isAnimatableImageUri,
  isHeicUri,
  normalizeImageToJpeg,
  normalizeImagesToJpeg,
} from '@lib';
import { getMockLogger } from './core-test.utils';

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}));

const mockLogger = getMockLogger();

const mockManipulateSuccess = (resultUri = 'file:///out.jpg') => {
  const saveAsync = jest.fn().mockResolvedValue({ uri: resultUri });
  const renderAsync = jest.fn().mockResolvedValue({ saveAsync });
  jest.mocked(ImageManipulator.manipulate).mockReturnValue({ renderAsync } as never);
  return { saveAsync, renderAsync };
};

describe('media utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMediaTypeFromUri', () => {
    it.each`
      uri                            | expected
      ${undefined}                   | ${undefined}
      ${null}                        | ${undefined}
      ${''}                          | ${undefined}
      ${'   '}                       | ${undefined}
      ${'/a/photo.JPG'}              | ${'image'}
      ${'/a/photo.heic?x=1#frag'}    | ${'image'}
      ${'https://h/v.mp4?token=a.b'} | ${'video'}
      ${'/a/movie.MOV#t=1'}          | ${'video'}
      ${'/a/sound.m4a'}              | ${'audio'}
      ${'/a/doc.pdf'}                | ${undefined}
      ${'/a/noext'}                  | ${undefined}
      ${'/a/trailing.'}              | ${undefined}
    `('returns $expected for "$uri"', ({ uri, expected }) => {
      expect(getMediaTypeFromUri(uri)).toBe(expected);
    });
  });

  describe('getThumbnailUri', () => {
    it.each`
      uri          | mediaType
      ${undefined} | ${'image'}
      ${null}      | ${'video'}
      ${''}        | ${'image'}
    `('returns "" for uri $uri ($mediaType)', async ({ uri, mediaType }) => {
      // act
      const result = await getThumbnailUri(uri, mediaType);

      // assert
      expect(result).toBe('');
      expect(VideoThumbnails.getThumbnailAsync).not.toHaveBeenCalled();
    });

    it('returns "" for a whitespace-only image uri', async () => {
      expect(await getThumbnailUri('   ', 'image')).toBe('');
    });

    it('returns the image uri itself and "" for audio', async () => {
      expect(await getThumbnailUri('/a.png', 'image')).toBe('/a.png');
      expect(await getThumbnailUri('/a.mp3', 'audio')).toBe('');
    });

    it('generates a video thumbnail at 500ms first', async () => {
      // arrange
      jest.mocked(VideoThumbnails.getThumbnailAsync).mockResolvedValue({ uri: '/thumb.jpg' } as never);

      // act
      const result = await getThumbnailUri('/v.mp4', 'video');

      // assert
      expect(result).toBe('/thumb.jpg');
      expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledTimes(1);
      expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledWith('/v.mp4', { time: 500, quality: 0.7 });
    });

    it('retries at 1000ms then 0ms, logs each failed attempt as debug and returns "" when all attempts fail', async () => {
      // arrange
      const error = new Error('no frame');
      jest.mocked(VideoThumbnails.getThumbnailAsync).mockRejectedValue(error);

      // act
      const result = await getThumbnailUri('/v.mp4', 'video');

      // assert
      expect(result).toBe('');
      expect(jest.mocked(VideoThumbnails.getThumbnailAsync).mock.calls.map(([, opts]) => opts?.time)).toEqual([
        500, 1000, 0,
      ]);
      expect(mockLogger.debug.mock.calls).toEqual([
        ['[getVideoThumbnail] No thumbnail at 500ms for [/v.mp4]', error],
        ['[getVideoThumbnail] No thumbnail at 1000ms for [/v.mp4]', error],
        ['[getVideoThumbnail] No thumbnail at 0ms for [/v.mp4]', error],
      ]);
    });

    it('returns the first successful retry', async () => {
      // arrange
      jest
        .mocked(VideoThumbnails.getThumbnailAsync)
        .mockRejectedValueOnce(new Error('no frame'))
        .mockResolvedValueOnce({ uri: '/t1000.jpg' } as never);

      // act
      const result = await getThumbnailUri('/v.mp4', 'video');

      // assert
      expect(result).toBe('/t1000.jpg');
      expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('isHeicUri', () => {
    it.each`
      uri              | expected
      ${undefined}     | ${false}
      ${null}          | ${false}
      ${''}            | ${false}
      ${'   '}         | ${false}
      ${'/a.HEIC'}     | ${true}
      ${'/a.heif?x=1'} | ${true}
      ${'/a.heic#f'}   | ${true}
      ${'/a.jpg'}      | ${false}
      ${'/heic'}       | ${false}
    `('returns $expected for "$uri"', ({ uri, expected }) => {
      expect(isHeicUri(uri)).toBe(expected);
    });
  });

  describe('isAnimatableImageUri', () => {
    it.each`
      uri            | expected
      ${undefined}   | ${false}
      ${''}          | ${false}
      ${'   '}       | ${false}
      ${'/a.GIF'}    | ${true}
      ${'/a.webp?x'} | ${true}
      ${'/a.png'}    | ${false}
    `('returns $expected for "$uri"', ({ uri, expected }) => {
      expect(isAnimatableImageUri(uri)).toBe(expected);
    });
  });

  describe('normalizeImageToJpeg', () => {
    it('exposes the default compression constant', () => {
      expect(IMAGE_JPEG_COMPRESSION).toBe(0.8);
    });

    it('re-encodes to JPEG with the default compression', async () => {
      // arrange
      const { saveAsync } = mockManipulateSuccess('file:///out.jpg');

      // act
      const result = await normalizeImageToJpeg('file:///in.heic');

      // assert
      expect(result).toBe('file:///out.jpg');
      expect(ImageManipulator.manipulate).toHaveBeenCalledWith('file:///in.heic');
      expect(saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.8 });
    });

    it('passes a custom compression', async () => {
      // arrange
      const { saveAsync } = mockManipulateSuccess();

      // act
      await normalizeImageToJpeg('file:///in.jpg', 0.5);

      // assert
      expect(saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.5 });
    });

    it('returns an empty uri untouched', async () => {
      // act
      const result = await normalizeImageToJpeg('');

      // assert
      expect(result).toBe('');
      expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
    });

    it('returns a whitespace-only uri untouched without converting it', async () => {
      // arrange
      mockManipulateSuccess('file:///out.jpg');

      // act
      const result = await normalizeImageToJpeg('   ');

      // assert
      expect(result).toBe('   ');
      expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
    });

    it.each(['file:///a.gif', 'file:///a.webp'])('returns animatable %s untouched', async (uri) => {
      // act
      const result = await normalizeImageToJpeg(uri);

      // assert
      expect(result).toBe(uri);
      expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
    });

    it('logs and keeps the original when conversion fails', async () => {
      // arrange
      jest.mocked(ImageManipulator.manipulate).mockReturnValue({
        renderAsync: jest.fn().mockRejectedValue(new Error('decode')),
      } as never);

      // act
      const result = await normalizeImageToJpeg('file:///in.png');

      // assert
      expect(result).toBe('file:///in.png');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to normalize image to JPEG, keeping original:',
        expect.any(Error)
      );
    });

    it('normalizeImagesToJpeg maps every uri preserving order', async () => {
      // arrange
      const { saveAsync } = mockManipulateSuccess('file:///out.jpg');

      // act
      const result = await normalizeImagesToJpeg(['file:///a.png', 'file:///b.gif', ''], 0.3);

      // assert
      expect(result).toEqual(['file:///out.jpg', 'file:///b.gif', '']);
      expect(saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.3 });
      expect(saveAsync).toHaveBeenCalledTimes(1);
    });
  });
});
