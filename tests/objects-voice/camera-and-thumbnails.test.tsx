import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { CameraAndThumbnails } from '@lib';
import { camera, lastCameraProps, resetCameraMocks } from './camera-mocks';
import { resetMediaMocks } from './media-mocks';
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
jest.mock('expo-audio', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoAudioMock);
jest.mock('expo-video', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoVideoMock);
jest.mock('expo-image', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoImageMock);

type Props = Parameters<typeof CameraAndThumbnails>[0];

const renderWidget = async (props: Partial<Props> = {}) => {
  const handleObjectRemove = jest.fn();
  const handleObjectsTaken = jest.fn();
  const utils = await renderWithProviders(
    <CameraAndThumbnails
      uris={['file:///a.jpg']}
      handleObjectRemove={handleObjectRemove}
      handleObjectsTaken={handleObjectsTaken}
      {...props}
    />
  );
  return { handleObjectRemove, handleObjectsTaken, ...utils };
};

// the widget's own camera / video buttons come first, before the ones inside the camera modal habit-hooks-disable non-essential-comment
const actionButton = (icon: 'camera' | 'video') => screen.getAllByRole('button', { name: `icon-${icon}` })[0];

const lastLabelled = (label: string) => {
  const matches = screen.getAllByLabelText(label);
  return matches[matches.length - 1];
};

beforeEach(() => {
  resetCameraMocks();
  resetMediaMocks();
});

describe('CameraAndThumbnails', () => {
  it('renders the thumbnails and a camera button, without a video button by default', async () => {
    // act
    await renderWidget();

    // assert
    expect(screen.getByLabelText('expo-image:file:///a.jpg')).toBeOnTheScreen();
    expect(screen.getByLabelText('icon-camera')).toBeOnTheScreen();
    expect(screen.queryByLabelText('icon-video')).toBeNull();
    expect(screen.queryByLabelText('camera-view')).toBeNull();
  });

  it('shows the video button when enableVideo is set', async () => {
    // act
    await renderWidget({ enableVideo: true });

    // assert
    expect(screen.getByLabelText('icon-video')).toBeOnTheScreen();
  });

  it.each`
    button      | enableVideo | cameraMode
    ${'camera'} | ${false}    | ${'picture'}
    ${'video'}  | ${true}     | ${'video'}
  `('opens the camera in $cameraMode mode from the $button button', async ({ button, enableVideo, cameraMode }) => {
    // arrange
    await renderWidget({ enableVideo });

    // act
    await fireEvent.press(actionButton(button));

    // assert
    expect(screen.getByLabelText('camera-view')).toBeOnTheScreen();
    expect(lastCameraProps().mode).toBe(cameraMode);
  });

  it('forwards captured uris and closes the camera with its back button', async () => {
    // arrange
    camera.takePictureAsync.mockResolvedValue({ uri: 'file:///new.png' });
    const { handleObjectsTaken } = await renderWidget();
    await fireEvent.press(actionButton('camera'));

    // act
    await fireEvent.press(lastLabelled('icon-camera'));
    await fireEvent.press(screen.getByLabelText('icon-arrow-left'));

    // assert
    expect(handleObjectsTaken).toHaveBeenCalledWith(['file:///new.png.jpeg-normalized.jpg']);
    await waitFor(() => expect(screen.queryByLabelText('camera-view')).toBeNull());
  });

  it('closes the camera after one capture when allowMultipleSelection is false', async () => {
    // arrange
    camera.takePictureAsync.mockResolvedValue({ uri: 'file:///new.jpg' });
    await renderWidget({ allowMultipleSelection: false });
    await fireEvent.press(actionButton('camera'));

    // act
    await fireEvent.press(lastLabelled('icon-camera'));

    // assert
    await waitFor(() => expect(screen.queryByLabelText('camera-view')).toBeNull());
  });

  it('reopening after a video session starts in photo mode', async () => {
    // arrange
    await renderWidget({ enableVideo: true });
    await fireEvent.press(actionButton('video'));
    await fireEvent.press(screen.getByLabelText('icon-arrow-left'));
    await waitFor(() => expect(screen.queryByLabelText('camera-view')).toBeNull());

    // act
    await fireEvent.press(actionButton('camera'));

    // assert
    expect(lastCameraProps().mode).toBe('picture');
  });

  it('removes a thumbnail through handleObjectRemove', async () => {
    // arrange
    const { handleObjectRemove } = await renderWidget({ uris: ['file:///a.jpg', 'file:///b.jpg'] });

    // act
    await fireEvent.press(screen.getAllByLabelText('icon-close')[0]);

    // assert
    expect(handleObjectRemove).toHaveBeenCalledWith('file:///a.jpg');
  });

  it.each`
    readonly     | disabled
    ${true}      | ${undefined}
    ${undefined} | ${true}
    ${true}      | ${true}
  `(
    'locks the widget when readonly=$readonly disabled=$disabled (buttons disabled, no delete)',
    async ({ readonly, disabled }) => {
      // arrange
      await renderWidget({ readonly, disabled, enableVideo: true });

      // act
      await fireEvent.press(actionButton('camera'));
      await fireEvent.press(actionButton('video'));

      // assert
      expect(actionButton('camera')).toBeDisabled();
      expect(actionButton('video')).toBeDisabled();
      expect(screen.queryByLabelText('icon-close')).toBeNull();
      expect(screen.queryByLabelText('camera-view')).toBeNull();
    }
  );

  it.each`
    readonly     | disabled
    ${false}     | ${false}
    ${undefined} | ${undefined}
  `('is unlocked when readonly=$readonly disabled=$disabled', async ({ readonly, disabled }) => {
    // act
    await renderWidget({ readonly, disabled, enableVideo: true });

    // assert
    expect(actionButton('camera')).toBeEnabled();
    expect(actionButton('video')).toBeEnabled();
    expect(screen.getByLabelText('icon-close')).toBeOnTheScreen();
  });

  it('forwards getFabAction to the fullscreen viewer', async () => {
    // arrange
    const onPress = jest.fn();
    await renderWidget({ getFabAction: () => ({ icon: 'share', label: 'Share', onPress }) });
    await fireEvent.press(screen.getByLabelText('expo-image:file:///a.jpg'));

    // act
    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));

    // assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
