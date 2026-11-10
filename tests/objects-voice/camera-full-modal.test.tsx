import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, Linking, Platform, type AlertButton } from 'react-native';
import { CameraFullModal, logger } from '@lib';
import {
  blocked,
  camera,
  cameraState,
  lastCameraProps,
  deferred,
  expoImagePickerMock,
  expoMediaLibraryMock,
  granted,
  manipulate,
  promptable,
  removeVolumeListener,
  requestCameraPermission,
  requestMediaPermission,
  requestMicrophonePermission,
  resetCameraMocks,
  volumeManagerMock,
  volumeState,
} from './camera-mocks';
import { renderWithProviders } from './render-with-providers';

jest.mock(
  'react-native-paper/lib/commonjs/components/MaterialCommunityIcon',
  () => jest.requireActual<typeof import('./paper-icon-mock')>('./paper-icon-mock').paperIconMock
);
jest.mock('expo-camera', () => jest.requireActual<typeof import('./camera-mocks')>('./camera-mocks').expoCameraMock);
jest.mock(
  'expo-media-library',
  () => jest.requireActual<typeof import('./camera-mocks')>('./camera-mocks').expoMediaLibraryMock
);
jest.mock(
  'expo-image-picker',
  () => jest.requireActual<typeof import('./camera-mocks')>('./camera-mocks').expoImagePickerMock
);
jest.mock(
  'expo-image-manipulator',
  () => jest.requireActual<typeof import('./camera-mocks')>('./camera-mocks').expoImageManipulatorMock
);
jest.mock(
  'react-native-volume-manager',
  () => jest.requireActual<typeof import('./camera-mocks')>('./camera-mocks').volumeManagerMock
);
jest.mock(
  '@react-native-community/slider',
  () => jest.requireActual<typeof import('./camera-mocks')>('./camera-mocks').sliderMock
);

type ModalProps = Parameters<typeof CameraFullModal>[0];

interface RecordedVideo {
  uri: string;
}

const renderCamera = async (props: Partial<ModalProps> = {}) => {
  const onClose = jest.fn();
  const handleObjectsTaken = jest.fn();
  const utils = await renderWithProviders(
    <CameraFullModal mode="image" onClose={onClose} handleObjectsTaken={handleObjectsTaken} {...props} />
  );
  // let the volume clamp effect settle habit-hooks-disable non-essential-comment
  await act(async () => {});
  return { onClose, handleObjectsTaken, ...utils };
};

const setPlatform = (os: 'ios' | 'android') => {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
};

let alertSpy: jest.SpyInstance;
let openSettingsSpy: jest.SpyInstance;

beforeEach(() => {
  resetCameraMocks();
  setPlatform('ios');
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
  alertSpy.mockRestore();
  openSettingsSpy.mockRestore();
  jest.restoreAllMocks();
});

// auto-stopped recordings show a snackbar whose hide timer outlives the test: run it out (fake timers only) habit-hooks-disable non-essential-comment
const flushSnackbar = () =>
  act(async () => {
    jest.advanceTimersByTime(5_000);
  });

const lastAlertButtons = (): AlertButton[] => alertSpy.mock.calls.at(-1)?.[2] ?? [];

describe('CameraFullModal', () => {
  describe('camera permission', () => {
    it('renders nothing while the camera permission is still loading', async () => {
      // arrange
      cameraState.camera = null;

      // act
      await renderCamera();

      // assert
      expect(screen.queryByLabelText('camera-view')).toBeNull();
      expect(screen.queryByText('camera.permissionRequiredTitle')).toBeNull();
    });

    it('asks for the permission when the OS can still prompt', async () => {
      // arrange
      cameraState.camera = promptable;

      // act
      await renderCamera();

      // assert
      expect(screen.getByText('camera.permissionRequiredTitle')).toBeOnTheScreen();
      expect(screen.getByText('camera.permissionRequiredDescription')).toBeOnTheScreen();
      expect(screen.getByText('ok')).toBeOnTheScreen();
      expect(screen.queryByLabelText('camera-view')).toBeNull();
    });

    it('requests the permission on OK and closes when the user denies', async () => {
      // arrange
      cameraState.camera = promptable;
      requestCameraPermission.mockResolvedValue({ granted: false, canAskAgain: true });
      const { onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByText('ok'));

      // assert
      expect(requestCameraPermission).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stays open when the user grants the permission on OK', async () => {
      // arrange
      cameraState.camera = promptable;
      requestCameraPermission.mockResolvedValue({ granted: true, canAskAgain: true });
      const { onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByText('ok'));

      // assert
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes on cancel without requesting', async () => {
      // arrange
      cameraState.camera = promptable;
      const { onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByText('cancel'));

      // assert
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(requestCameraPermission).not.toHaveBeenCalled();
    });

    it('offers the settings on iOS once the OS no longer prompts, and closes after opening them', async () => {
      // arrange
      cameraState.camera = blocked;
      const { onClose } = await renderCamera();

      // assert
      expect(screen.getByText('camera.permissionDeniedTitle')).toBeOnTheScreen();
      expect(screen.getByText('camera.permissionDeniedDescription')).toBeOnTheScreen();

      // act
      await fireEvent.press(screen.getByText('openSettings'));

      // assert
      expect(requestCameraPermission).not.toHaveBeenCalled();
      expect(openSettingsSpy).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('on Android, still prompts before the first request even when canAskAgain is false', async () => {
      // arrange
      setPlatform('android');
      cameraState.camera = blocked;
      requestCameraPermission.mockResolvedValue({ granted: false, canAskAgain: false });
      const { onClose } = await renderCamera();

      // assert
      expect(screen.getByText('camera.permissionRequiredTitle')).toBeOnTheScreen();

      // act
      await fireEvent.press(screen.getByText('ok'));

      // assert: blocked -> stays and now offers the settings
      expect(requestCameraPermission).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText('camera.permissionDeniedTitle')).toBeOnTheScreen();
      expect(screen.getByText('openSettings')).toBeOnTheScreen();
    });
  });

  describe('camera view', () => {
    it.each`
      mode         | cameraMode   | shutterIcon
      ${'image'}   | ${'picture'} | ${'icon-camera'}
      ${'video'}   | ${'video'}   | ${'icon-video'}
      ${undefined} | ${'picture'} | ${'icon-video'}
    `('mode=$mode -> camera mode $cameraMode with shutter $shutterIcon', async ({ mode, cameraMode, shutterIcon }) => {
      // act
      await renderCamera({ mode });

      // assert
      expect(lastCameraProps().mode).toBe(cameraMode);
      expect(screen.getByLabelText(shutterIcon)).toBeOnTheScreen();
    });

    it('passes the fixed camera settings', async () => {
      // act
      await renderCamera();

      // assert
      expect(lastCameraProps()).toMatchObject({
        facing: 'back',
        videoQuality: '1080p',
        zoom: 0,
        enableTorch: false,
        mute: false,
      });
    });

    it.each`
      microphone    | mute
      ${granted}    | ${false}
      ${promptable} | ${true}
      ${null}       | ${true}
    `('mutes the camera when microphone=$microphone', async ({ microphone, mute }) => {
      // arrange
      cameraState.microphone = microphone;

      // act
      await renderCamera({ mode: 'video' });

      // assert
      expect(lastCameraProps().mute).toBe(mute);
    });

    it('toggles the torch', async () => {
      // arrange
      await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-flashlight'));

      // assert
      expect(lastCameraProps().enableTorch).toBe(true);

      // act
      await fireEvent.press(screen.getByLabelText('icon-flashlight'));

      // assert
      expect(lastCameraProps().enableTorch).toBe(false);
    });

    it('closes (asynchronously) with the back button', async () => {
      // arrange
      const { onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-arrow-left'));

      // assert
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(camera.stopRecording).not.toHaveBeenCalled();
    });
  });

  describe('photo', () => {
    it('takes a picture, backs it up to the gallery, normalizes it to JPEG and reports it', async () => {
      // arrange
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.heic' });
      const { handleObjectsTaken, onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(camera.takePictureAsync).toHaveBeenCalledWith({ base64: false, quality: 0.8 });
      expect(expoMediaLibraryMock.saveToLibraryAsync).toHaveBeenCalledWith('file:///pic.heic');
      expect(manipulate).toHaveBeenCalledWith('file:///pic.heic');
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///pic.heic.jpeg-normalized.jpg']);
      expect(screen.getByText('1')).toBeOnTheScreen();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('counts captures in the badge', async () => {
      // arrange
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.jpg' });
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(handleObjectsTaken).toHaveBeenCalledTimes(2);
      expect(screen.getByText('2')).toBeOnTheScreen();
    });

    it('closes after the first picture when multiple selection is off', async () => {
      // arrange
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.jpg' });
      const { onClose, handleObjectsTaken } = await renderCamera({ allowMultipleSelection: false });

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(handleObjectsTaken).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('requests the gallery permission and skips the backup when refused', async () => {
      // arrange
      cameraState.media = promptable;
      requestMediaPermission.mockResolvedValue({ granted: false, canAskAgain: true });
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.jpg' });
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(requestMediaPermission).toHaveBeenCalledTimes(1);
      expect(expoMediaLibraryMock.saveToLibraryAsync).not.toHaveBeenCalled();
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///pic.jpg.jpeg-normalized.jpg']);
    });

    it('treats a null gallery permission request result as refused', async () => {
      // arrange
      cameraState.media = null;
      requestMediaPermission.mockResolvedValue(null);
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.jpg' });
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(expoMediaLibraryMock.saveToLibraryAsync).not.toHaveBeenCalled();
      expect(handleObjectsTaken).toHaveBeenCalledTimes(1);
    });

    it('logs a warning and still reports the picture when the gallery backup fails', async () => {
      // arrange
      const warnSpy = jest.spyOn(logger, 'warn');
      expoMediaLibraryMock.saveToLibraryAsync.mockRejectedValue(new Error('disk full'));
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.jpg' });
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(warnSpy).toHaveBeenCalledWith('Gallery backup failed:', expect.any(Error));
      expect(handleObjectsTaken).toHaveBeenCalledTimes(1);
    });

    it('keeps an animatable image (gif) as is instead of converting it', async () => {
      // arrange
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.gif' });
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///pic.gif']);
    });

    it('alerts when the camera returns no picture', async () => {
      // arrange
      camera.takePictureAsync.mockResolvedValue(undefined);
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to take picture.');
      expect(handleObjectsTaken).not.toHaveBeenCalled();
    });

    it('alerts with the error message when taking the picture throws', async () => {
      // arrange
      camera.takePictureAsync.mockRejectedValue(new Error('sensor busy'));
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-camera'));

      // assert
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to save picture: sensor busy');
      expect(handleObjectsTaken).not.toHaveBeenCalled();
    });
  });

  /* habit-hooks-disable non-essential-comment
   * A press whose handler stays pending (recording in progress, alert awaiting an answer) keeps the
   * fireEvent promise pending as well: such presses are started, observed, then awaited at the end.
   */
  describe('video', () => {
    it('records with the microphone, switches the shutter to Stop, and reports the video after a manual stop', async () => {
      // arrange
      const recording = deferred<RecordedVideo | undefined>();
      camera.recordAsync.mockReturnValue(recording.promise);
      const infoSpy = jest.spyOn(logger, 'info');
      const { handleObjectsTaken } = await renderCamera({ mode: 'video' });

      // act
      const recordPress = fireEvent.press(screen.getByLabelText('icon-video'));

      // assert
      expect(await screen.findByText('Stop')).toBeOnTheScreen();
      expect(camera.recordAsync).toHaveBeenCalledWith({ maxDuration: 180, codec: 'avc1' });
      expect(screen.getByLabelText('icon-stop')).toBeOnTheScreen();

      // act
      await fireEvent.press(screen.getByLabelText('icon-stop'));
      recording.resolve({ uri: 'file:///clip.mov' });
      await recordPress;

      // assert
      expect(camera.stopRecording).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(handleObjectsTaken).toHaveBeenCalledTimes(1));
      expect(expoMediaLibraryMock.saveToLibraryAsync).toHaveBeenCalledWith('file:///clip.mov');
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///clip.mov']);
      expect(manipulate).not.toHaveBeenCalled();
      expect(await screen.findByText('1')).toBeOnTheScreen();
      expect(screen.getByText('Video')).toBeOnTheScreen();
      expect(infoSpy).not.toHaveBeenCalledWith('Video recording stopped automatically after reaching time limit');
      expect(screen.queryByText('camera.videoLengthLimitReached')).toBeNull();
    });

    it('shows the length-limit snackbar when recording stops on its own, then hides it', async () => {
      // arrange
      jest.useFakeTimers();
      const infoSpy = jest.spyOn(logger, 'info');
      camera.recordAsync.mockResolvedValue({ uri: 'file:///clip.mov' });
      const { handleObjectsTaken } = await renderCamera({ mode: 'video' });

      // act
      await fireEvent.press(screen.getByLabelText('icon-video'));

      // assert
      expect(infoSpy).toHaveBeenCalledWith('Video recording stopped automatically after reaching time limit');
      expect(screen.getByText('camera.videoLengthLimitReached')).toBeOnTheScreen();
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///clip.mov']);

      // act
      await flushSnackbar();

      // assert
      expect(screen.queryByText('camera.videoLengthLimitReached')).toBeNull();
    });

    it('alerts and resets the shutter when no video is returned', async () => {
      // arrange
      camera.recordAsync.mockResolvedValue(undefined);
      const { handleObjectsTaken } = await renderCamera({ mode: 'video' });

      // act
      await fireEvent.press(screen.getByLabelText('icon-video'));

      // assert
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to record video.');
      expect(handleObjectsTaken).not.toHaveBeenCalled();
      expect(screen.getByText('Video')).toBeOnTheScreen();
    });

    it('closes after the first video when multiple selection is off', async () => {
      // arrange
      jest.useFakeTimers();
      camera.recordAsync.mockResolvedValue({ uri: 'file:///clip.mov' });
      const { onClose } = await renderCamera({ mode: 'video', allowMultipleSelection: false });

      // act
      await fireEvent.press(screen.getByLabelText('icon-video'));
      await flushSnackbar();

      // assert
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stops an ongoing recording when the camera is closed with the back button', async () => {
      // arrange
      const recording = deferred<RecordedVideo>();
      camera.recordAsync.mockReturnValue(recording.promise);
      const { onClose } = await renderCamera({ mode: 'video' });
      const recordPress = fireEvent.press(screen.getByLabelText('icon-video'));
      await screen.findByText('Stop');

      // act
      await fireEvent.press(screen.getByLabelText('icon-arrow-left'));
      recording.resolve({ uri: 'file:///clip.mov' });
      await recordPress;

      // assert
      expect(camera.stopRecording).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('prompts for the microphone and starts recording once granted', async () => {
      // arrange
      cameraState.microphone = promptable;
      requestMicrophonePermission.mockResolvedValue({ granted: true, canAskAgain: true });
      camera.recordAsync.mockReturnValue(new Promise(() => {}));
      await renderCamera({ mode: 'video' });

      // act
      await fireEvent.press(screen.getByLabelText('icon-video'));

      // assert
      expect(requestMicrophonePermission).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(camera.recordAsync).toHaveBeenCalledTimes(1));
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it.each`
      microphone    | requestResult
      ${promptable} | ${{ granted: false, canAskAgain: true }}
      ${blocked}    | ${undefined}
    `(
      'asks to record without sound when the microphone is refused (microphone=$microphone)',
      async ({ microphone, requestResult }) => {
        // arrange
        cameraState.microphone = microphone;
        requestMicrophonePermission.mockResolvedValue(requestResult);
        await renderCamera({ mode: 'video' });

        // act
        const recordPress = fireEvent.press(screen.getByLabelText('icon-video'));
        await waitFor(() => expect(alertSpy).toHaveBeenCalled());

        // assert
        expect(alertSpy).toHaveBeenCalledWith(
          'camera.microphoneDeniedTitle',
          'camera.microphoneDeniedDescription',
          [
            { text: 'openSettings', onPress: expect.any(Function) },
            { text: 'camera.recordWithoutSound', onPress: expect.any(Function) },
          ],
          { cancelable: false }
        );
        expect(requestMicrophonePermission).toHaveBeenCalledTimes(microphone === promptable ? 1 : 0);
        expect(camera.recordAsync).not.toHaveBeenCalled();

        // cleanup: answer the alert so the press settles habit-hooks-disable non-essential-comment
        lastAlertButtons()[0].onPress?.();
        await recordPress;
      }
    );

    it('records muted after "record without sound" and does not ask again in the session', async () => {
      // arrange
      cameraState.microphone = blocked;
      const recording = deferred<RecordedVideo>();
      camera.recordAsync.mockReturnValue(recording.promise);
      await renderCamera({ mode: 'video' });
      const recordPress = fireEvent.press(screen.getByLabelText('icon-video'));
      await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));

      // act
      lastAlertButtons()[1].onPress?.();

      // assert
      expect(await screen.findByText('Stop')).toBeOnTheScreen();
      expect(camera.recordAsync).toHaveBeenCalledTimes(1);
      expect(lastCameraProps().mute).toBe(true);

      // act: stop, then record again
      await fireEvent.press(screen.getByLabelText('icon-stop'));
      recording.resolve({ uri: 'file:///clip.mov' });
      await recordPress;
      jest.useFakeTimers();
      camera.recordAsync.mockResolvedValue({ uri: 'file:///clip2.mov' });
      await fireEvent.press(screen.getByLabelText('icon-video'));
      await flushSnackbar();

      // assert
      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(camera.recordAsync).toHaveBeenCalledTimes(2);
    });

    it('opens the settings and closes when "open settings" is chosen for the microphone', async () => {
      // arrange
      cameraState.microphone = blocked;
      const { onClose } = await renderCamera({ mode: 'video' });
      const recordPress = fireEvent.press(screen.getByLabelText('icon-video'));
      await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));

      // act
      lastAlertButtons()[0].onPress?.();
      await recordPress;

      // assert
      expect(openSettingsSpy).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(camera.recordAsync).not.toHaveBeenCalled();
    });
  });

  describe('gallery picker', () => {
    it.each`
      mode       | mediaTypes    | allowMultipleSelection | expectedMultiple
      ${'image'} | ${['images']} | ${undefined}           | ${true}
      ${'video'} | ${['videos']} | ${false}               | ${false}
    `(
      'opens the library for $mediaTypes (allowMultipleSelection=$allowMultipleSelection)',
      async ({ mode, mediaTypes, allowMultipleSelection, expectedMultiple }) => {
        // arrange
        expoImagePickerMock.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });
        await renderCamera({ mode, allowMultipleSelection });

        // act
        await fireEvent.press(screen.getByLabelText('icon-image'));

        // assert
        expect(expoImagePickerMock.launchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes,
          allowsEditing: false,
          quality: 1,
          allowsMultipleSelection: expectedMultiple,
        });
      }
    );

    it('normalizes picked images to JPEG, reports them and closes', async () => {
      // arrange
      expoImagePickerMock.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///a.png' }, { uri: 'file:///b.gif' }],
      });
      const { handleObjectsTaken, onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-image'));

      // assert
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///a.png.jpeg-normalized.jpg', 'file:///b.gif']);
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('reports picked videos untouched', async () => {
      // arrange
      expoImagePickerMock.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///a.mp4' }],
      });
      const { handleObjectsTaken } = await renderCamera({ mode: 'video' });

      // act
      await fireEvent.press(screen.getByLabelText('icon-image'));

      // assert
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///a.mp4']);
      expect(manipulate).not.toHaveBeenCalled();
    });

    it.each`
      result
      ${{ canceled: true, assets: null }}
      ${{ canceled: false, assets: [] }}
    `('does nothing when the picker returns $result', async ({ result }) => {
      // arrange
      expoImagePickerMock.launchImageLibraryAsync.mockResolvedValue(result);
      const { handleObjectsTaken, onClose } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-image'));
      await act(async () => {});

      // assert
      expect(handleObjectsTaken).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('logs and alerts when the picker throws', async () => {
      // arrange
      const warnSpy = jest.spyOn(logger, 'warn');
      expoImagePickerMock.launchImageLibraryAsync.mockRejectedValue(new Error('picker down'));
      const { handleObjectsTaken } = await renderCamera();

      // act
      await fireEvent.press(screen.getByLabelText('icon-image'));

      // assert
      expect(warnSpy).toHaveBeenCalledWith('Media selection failed:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to select media. Please try again.');
      expect(handleObjectsTaken).not.toHaveBeenCalled();
    });
  });

  describe('volume buttons', () => {
    it.each`
      volume  | expected
      ${0.05} | ${0.1}
      ${0.95} | ${0.9}
    `('clamps an initial volume of $volume to $expected without UI', async ({ volume, expected }) => {
      // arrange
      volumeState.volume = volume;

      // act
      await renderCamera();

      // assert
      expect(volumeManagerMock.VolumeManager.setVolume).toHaveBeenCalledWith(expected, { showUI: false });
    });

    it.each`
      volume
      ${0.1}
      ${0.5}
      ${0.9}
    `('leaves an initial volume of $volume untouched', async ({ volume }) => {
      // arrange
      volumeState.volume = volume;

      // act
      await renderCamera();

      // assert
      expect(volumeManagerMock.VolumeManager.setVolume).not.toHaveBeenCalled();
    });

    it('logs a warning when reading the volume fails', async () => {
      // arrange
      const warnSpy = jest.spyOn(logger, 'warn');
      volumeManagerMock.VolumeManager.getVolume.mockRejectedValueOnce(new Error('no audio session'));

      // act
      await renderCamera();

      // assert
      expect(warnSpy).toHaveBeenCalledWith('Failed to clamp volume', expect.any(Error));
    });

    it('takes a picture on a volume press, ignoring presses within 2 s', async () => {
      // arrange
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(10_000);
      camera.takePictureAsync.mockResolvedValue({ uri: 'file:///pic.jpg' });
      const { handleObjectsTaken } = await renderCamera();

      // act
      await act(async () => volumeState.listener?.());
      nowSpy.mockReturnValue(11_999);
      await act(async () => volumeState.listener?.());

      // assert
      expect(camera.takePictureAsync).toHaveBeenCalledTimes(1);
      expect(handleObjectsTaken).toHaveBeenCalledTimes(1);

      // act
      nowSpy.mockReturnValue(12_000);
      await act(async () => volumeState.listener?.());

      // assert
      expect(camera.takePictureAsync).toHaveBeenCalledTimes(2);
    });

    it('starts then stops a recording with volume presses in video mode', async () => {
      // arrange
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(10_000);
      const recording = deferred<RecordedVideo>();
      camera.recordAsync.mockReturnValue(recording.promise);
      const { handleObjectsTaken } = await renderCamera({ mode: 'video' });

      // act: the native listener fires outside of any React event
      const firstPress = volumeState.listener?.();

      // assert
      expect(await screen.findByText('Stop')).toBeOnTheScreen();
      expect(camera.recordAsync).toHaveBeenCalledTimes(1);

      // act
      nowSpy.mockReturnValue(20_000);
      await act(async () => volumeState.listener?.());
      await act(async () => {
        recording.resolve({ uri: 'file:///clip.mov' });
        await firstPress;
      });

      // assert
      expect(camera.stopRecording).toHaveBeenCalledTimes(1);
      expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///clip.mov']);
    });

    it('removes the volume listener on unmount', async () => {
      // arrange
      const { unmount } = await renderCamera();

      // act
      await unmount();

      // assert
      expect(removeVolumeListener).toHaveBeenCalledTimes(1);
    });
  });
});
