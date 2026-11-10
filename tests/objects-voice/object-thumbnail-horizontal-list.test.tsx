import { act, fireEvent, screen } from '@testing-library/react-native';
import { getThumbnailAsync } from 'expo-video-thumbnails';
import { Alert } from 'react-native';
import { ObjectThumbnailHorizontalList, type ViewerFabAction } from '@lib';
import { audioPlayer, expoAudioMock, expoVideoMock, mediaState, resetMediaMocks, videoPlayer } from './media-mocks';
import { renderWithProviders } from './render-with-providers';

jest.mock(
  'react-native-paper/lib/commonjs/components/MaterialCommunityIcon',
  () => jest.requireActual<typeof import('./paper-icon-mock')>('./paper-icon-mock').paperIconMock
);
jest.mock('expo-audio', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoAudioMock);
jest.mock('expo-video', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoVideoMock);
jest.mock('expo-image', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoImageMock);

type ListProps = Parameters<typeof ObjectThumbnailHorizontalList>[0];

const renderList = (props: Partial<ListProps> = {}) =>
  renderWithProviders(<ObjectThumbnailHorizontalList uris={['file:///a.jpg']} onRemovePress={jest.fn()} {...props} />);

const openViewerOn = async (uri: string) => {
  await fireEvent.press(screen.getByLabelText(`expo-image:${uri}`));
};

const viewerCloseButton = () => {
  const closeIcons = screen.getAllByLabelText('icon-close');
  return closeIcons[closeIcons.length - 1];
};

beforeEach(() => {
  resetMediaMocks();
  jest.mocked(getThumbnailAsync).mockReset();
  jest.mocked(getThumbnailAsync).mockResolvedValue({ uri: 'file:///thumb.jpg', width: 1, height: 1 });
});

describe('ObjectThumbnailHorizontalList', () => {
  describe('list rendering', () => {
    it('renders nothing for an empty uri list', async () => {
      // act
      await renderList({ uris: [] });

      // assert
      expect(screen.queryByLabelText(/^expo-image:/)).toBeNull();
      expect(screen.queryByLabelText('icon-close')).toBeNull();
    });

    it('renders one thumbnail and one delete button per uri, duplicates included', async () => {
      // act
      await renderList({ uris: ['file:///a.jpg', 'file:///a.jpg', 'file:///b.png'] });

      // assert
      expect(screen.getAllByLabelText('expo-image:file:///a.jpg')).toHaveLength(2);
      expect(screen.getByLabelText('expo-image:file:///b.png')).toBeOnTheScreen();
      expect(screen.getAllByLabelText('icon-close')).toHaveLength(3);
    });

    it('calls onRemovePress with the uri of the pressed delete button', async () => {
      // arrange
      const onRemovePress = jest.fn();
      await renderWithProviders(
        <ObjectThumbnailHorizontalList uris={['file:///a.jpg', 'file:///b.jpg']} onRemovePress={onRemovePress} />
      );

      // act
      await fireEvent.press(screen.getAllByLabelText('icon-close')[1]);

      // assert
      expect(onRemovePress).toHaveBeenCalledTimes(1);
      expect(onRemovePress).toHaveBeenCalledWith('file:///b.jpg');
    });

    it.each`
      readonly
      ${true}
    `('hides delete buttons when readonly=$readonly', async ({ readonly }) => {
      // act
      await renderList({ uris: ['file:///a.jpg'], readonly });

      // assert
      expect(screen.queryByLabelText('icon-close')).toBeNull();
    });

    it.each`
      readonly
      ${false}
      ${undefined}
    `('shows delete buttons when readonly=$readonly', async ({ readonly }) => {
      // act
      await renderList({ uris: ['file:///a.jpg'], readonly });

      // assert
      expect(screen.getByLabelText('icon-close')).toBeOnTheScreen();
    });
  });

  describe('thumbnail (ObjectThumbnail)', () => {
    it.each`
      uri                      | playIcon
      ${'file:///a.mp4'}       | ${'icon-play-circle-outline'}
      ${'file:///a.MOV?x=1#t'} | ${'icon-play-circle-outline'}
      ${'file:///a.m4a'}       | ${'icon-music-note'}
      ${'file:///a.mp3'}       | ${'icon-music-note'}
    `('shows $playIcon over a $uri thumbnail', async ({ uri, playIcon }) => {
      // act
      await renderList({ uris: [uri] });

      // assert
      expect(screen.getByLabelText(playIcon)).toBeOnTheScreen();
    });

    it.each`
      uri
      ${'file:///a.jpg'}
      ${'file:///a.unknown'}
      ${'file:///no-extension'}
    `('shows no play icon for $uri', async ({ uri }) => {
      // act
      await renderList({ uris: [uri] });

      // assert
      expect(screen.queryByLabelText('icon-play-circle-outline')).toBeNull();
      expect(screen.queryByLabelText('icon-music-note')).toBeNull();
      expect(screen.getByLabelText(`expo-image:${uri}`)).toBeOnTheScreen();
    });

    it('shows the image-off placeholder instead of an image for an empty uri', async () => {
      // act
      await renderList({ uris: [''] });

      // assert
      expect(screen.getByLabelText('icon-image-off')).toBeOnTheScreen();
      expect(screen.queryByLabelText(/^expo-image:/)).toBeNull();
    });

    it('treats a whitespace-only uri as a real uri (renders an image, no placeholder)', async () => {
      // act
      await renderList({ uris: ['   '] });

      // assert
      expect(screen.queryByLabelText('icon-image-off')).toBeNull();
      expect(screen.getByLabelText('expo-image:   ')).toBeOnTheScreen();
    });

    it('alerts "not cached" with a single cancel button when the placeholder is pressed', async () => {
      // arrange
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      await renderList({ uris: [''] });

      // act
      await fireEvent.press(screen.getByLabelText('icon-image-off'));

      // assert
      expect(alertSpy).toHaveBeenCalledWith('', 'objects.notCached', [{ text: 'environment.cancel', style: 'cancel' }]);
      expect(screen.queryByLabelText('video-view')).toBeNull();
      alertSpy.mockRestore();
    });

    it('shows the generated video thumbnail once available', async () => {
      // act
      await renderList({ uris: ['file:///clip.mp4'] });

      // assert
      expect(await screen.findByLabelText('expo-image:file:///thumb.jpg')).toBeOnTheScreen();
      expect(getThumbnailAsync).toHaveBeenCalledWith('file:///clip.mp4', { time: 500, quality: 0.7 });
    });

    it('retries thumbnail generation at 1000 ms then 0 ms and falls back to the video uri when all fail', async () => {
      // arrange
      jest.mocked(getThumbnailAsync).mockRejectedValue(new Error('boom'));

      // act
      await renderList({ uris: ['file:///clip.mp4'] });
      await act(async () => {});

      // assert
      expect(jest.mocked(getThumbnailAsync).mock.calls.map(([, opts]) => opts?.time)).toEqual([500, 1000, 0]);
      expect(screen.getByLabelText('expo-image:file:///clip.mp4')).toBeOnTheScreen();
    });

    it('does not generate thumbnails for images or audio', async () => {
      // act
      await renderList({ uris: ['file:///a.jpg', 'file:///a.mp3'] });
      await act(async () => {});

      // assert
      expect(getThumbnailAsync).not.toHaveBeenCalled();
    });
  });

  describe('fullscreen viewer (MediaViewerModal)', () => {
    it('opens an image fullscreen and closes it with the close button', async () => {
      // arrange
      await renderList({ uris: ['file:///a.jpg'] });

      // act
      await openViewerOn('file:///a.jpg');

      // assert
      expect(screen.getAllByLabelText('expo-image:file:///a.jpg')).toHaveLength(2);

      // act
      await fireEvent.press(viewerCloseButton());

      // assert
      expect(screen.getAllByLabelText('expo-image:file:///a.jpg')).toHaveLength(1);
      expect(audioPlayer.pause).toHaveBeenCalled();
      expect(audioPlayer.seekTo).toHaveBeenCalledWith(0);
      expect(videoPlayer.pause).toHaveBeenCalled();
    });

    it('plays a video fullscreen with the video player', async () => {
      // arrange
      await renderList({ uris: ['file:///clip.mp4'] });
      await act(async () => {});

      // act
      await openViewerOn('file:///thumb.jpg');

      // assert
      expect(screen.getByLabelText('video-view')).toBeOnTheScreen();
      expect(expoVideoMock.useVideoPlayer).toHaveBeenLastCalledWith('file:///clip.mp4', expect.any(Function));
      expect(videoPlayer.loop).toBe(false);
      expect(videoPlayer.play).toHaveBeenCalled();
    });

    it('does not load any media source while the viewer is closed', async () => {
      // act
      await renderList({ uris: ['file:///clip.mp4', 'file:///a.mp3'] });

      // assert
      expect(expoVideoMock.useVideoPlayer).toHaveBeenLastCalledWith(null, expect.any(Function));
      expect(expoAudioMock.useAudioPlayer).toHaveBeenLastCalledWith(null, { updateInterval: 500 });
    });

    describe('audio', () => {
      it('shows the audio title, a play button and loads the audio source', async () => {
        // arrange
        await renderList({ uris: ['file:///a.mp3'] });

        // act
        await openViewerOn('file:///a.mp3');

        // assert
        expect(screen.getByText('Enregistrement audio')).toBeOnTheScreen();
        expect(screen.getByLabelText('icon-play')).toBeOnTheScreen();
        expect(expoAudioMock.useAudioPlayer).toHaveBeenLastCalledWith('file:///a.mp3', { updateInterval: 500 });
      });

      it.each`
        duration | currentTime | expected
        ${65}    | ${5.9}      | ${'0:05 / 1:05'}
        ${3600}  | ${600}      | ${'10:00 / 60:00'}
      `('formats position/duration as "$expected"', async ({ duration, currentTime, expected }) => {
        // arrange
        mediaState.audioStatus = { playing: false, duration, currentTime };
        await renderList({ uris: ['file:///a.mp3'] });

        // act
        await openViewerOn('file:///a.mp3');

        // assert
        expect(screen.getByText(expected)).toBeOnTheScreen();
      });

      it.each`
        duration
        ${0}
        ${undefined}
      `('hides the time when duration is $duration', async ({ duration }) => {
        // arrange
        mediaState.audioStatus = { playing: false, duration, currentTime: 0 };
        await renderList({ uris: ['file:///a.mp3'] });

        // act
        await openViewerOn('file:///a.mp3');

        // assert
        expect(screen.queryByText(/ \/ /)).toBeNull();
      });

      it('plays without seeking when not at the end', async () => {
        // arrange
        mediaState.audioStatus = { playing: false, duration: 10, currentTime: 3 };
        await renderList({ uris: ['file:///a.mp3'] });
        await openViewerOn('file:///a.mp3');
        audioPlayer.seekTo.mockClear();

        // act
        await fireEvent.press(screen.getByLabelText('icon-play'));

        // assert
        expect(audioPlayer.play).toHaveBeenCalledTimes(1);
        expect(audioPlayer.seekTo).not.toHaveBeenCalled();
      });

      it('rewinds to 0 before playing when the audio already finished', async () => {
        // arrange
        mediaState.audioStatus = { playing: false, duration: 10, currentTime: 10 };
        await renderList({ uris: ['file:///a.mp3'] });
        await openViewerOn('file:///a.mp3');
        audioPlayer.seekTo.mockClear();

        // act
        await fireEvent.press(screen.getByLabelText('icon-play'));

        // assert
        expect(audioPlayer.seekTo).toHaveBeenCalledWith(0);
        expect(audioPlayer.play).toHaveBeenCalledTimes(1);
      });

      it('pauses when already playing', async () => {
        // arrange
        mediaState.audioStatus = { playing: true, duration: 10, currentTime: 3 };
        await renderList({ uris: ['file:///a.mp3'] });
        await openViewerOn('file:///a.mp3');
        audioPlayer.pause.mockClear();

        // act
        await fireEvent.press(screen.getByLabelText('icon-pause'));

        // assert
        expect(audioPlayer.pause).toHaveBeenCalledTimes(1);
        expect(audioPlayer.play).not.toHaveBeenCalled();
      });

      it('swallows a player error on toggle and logs it', async () => {
        // arrange
        audioPlayer.play.mockImplementation(() => {
          throw new Error('native failure');
        });
        await renderList({ uris: ['file:///a.mp3'] });
        await openViewerOn('file:///a.mp3');

        // act & assert
        await expect(fireEvent.press(screen.getByLabelText('icon-play'))).resolves.not.toThrow();
      });
    });

    describe('fab action', () => {
      const fab = (overrides: Partial<ViewerFabAction> = {}): ViewerFabAction => ({
        icon: 'share',
        label: 'Share',
        onPress: jest.fn(),
        ...overrides,
      });

      it('asks getFabAction for the open uri and runs its onPress', async () => {
        // arrange
        const action = fab();
        const getFabAction = jest.fn(() => action);
        await renderList({ uris: ['file:///a.jpg', 'file:///b.jpg'], getFabAction });

        // act
        await openViewerOn('file:///b.jpg');
        await fireEvent.press(screen.getByRole('button', { name: 'Share' }));

        // assert
        expect(getFabAction).toHaveBeenCalledWith('file:///b.jpg');
        expect(getFabAction).not.toHaveBeenCalledWith('file:///a.jpg');
        expect(screen.getByLabelText('icon-share')).toBeOnTheScreen();
        expect(action.onPress).toHaveBeenCalledTimes(1);
      });

      it('does not call getFabAction while the viewer is closed', async () => {
        // arrange
        const getFabAction = jest.fn(() => fab());

        // act
        await renderList({ uris: ['file:///a.jpg'], getFabAction });

        // assert
        expect(getFabAction).not.toHaveBeenCalled();
      });

      it('renders no fab when getFabAction returns null', async () => {
        // arrange
        await renderList({ uris: ['file:///a.jpg'], getFabAction: () => null });

        // act
        await openViewerOn('file:///a.jpg');

        // assert
        expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
      });

      it('shows a spinner instead of the icon and disables the fab while busy', async () => {
        // arrange
        const action = fab({ busy: true });
        await renderList({ uris: ['file:///a.jpg'], getFabAction: () => action });
        await openViewerOn('file:///a.jpg');

        // act
        await fireEvent.press(screen.getByRole('button', { name: 'Share' }));

        // assert
        expect(screen.queryByLabelText('icon-share')).toBeNull();
        expect(screen.getByRole('button', { name: 'Share' })).toBeDisabled();
        expect(action.onPress).not.toHaveBeenCalled();
      });
    });

    it('follows the index, not the uri: a replaced uri at the open index is shown', async () => {
      // arrange
      const onRemovePress = jest.fn();
      const { rerender } = await renderWithProviders(
        <ObjectThumbnailHorizontalList uris={['file:///a.jpg', 'file:///b.jpg']} onRemovePress={onRemovePress} />
      );
      await openViewerOn('file:///b.jpg');

      // act
      await rerender(
        <ObjectThumbnailHorizontalList uris={['file:///a.jpg', 'file:///b-full.png']} onRemovePress={onRemovePress} />
      );

      // assert
      expect(screen.getAllByLabelText('expo-image:file:///b-full.png')).toHaveLength(2);
    });

    it('closes the viewer when the open index disappears from the list', async () => {
      // arrange
      const onRemovePress = jest.fn();
      const { rerender } = await renderWithProviders(
        <ObjectThumbnailHorizontalList uris={['file:///a.jpg', 'file:///b.jpg']} onRemovePress={onRemovePress} />
      );
      await openViewerOn('file:///b.jpg');

      // act
      await rerender(<ObjectThumbnailHorizontalList uris={['file:///a.jpg']} onRemovePress={onRemovePress} />);

      // assert
      expect(screen.getAllByLabelText('expo-image:file:///a.jpg')).toHaveLength(1);
    });
  });
});
