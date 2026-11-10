import { useImperativeHandle, type Ref } from 'react';
import { View } from 'react-native';

export interface MockPermission {
  granted: boolean;
  canAskAgain: boolean;
}

interface CameraPermissionsState {
  camera: MockPermission | null;
  microphone: MockPermission | null;
  media: MockPermission | null;
}

interface MockCameraViewProps extends Record<string, unknown> {
  ref?: Ref<unknown>;
}

type VolumeListener = () => Promise<void> | void;

interface VolumeState {
  listener: VolumeListener | null;
  volume: number;
}

export const granted: MockPermission = { granted: true, canAskAgain: true };
export const promptable: MockPermission = { granted: false, canAskAgain: true };
export const blocked: MockPermission = { granted: false, canAskAgain: false };

export const camera = {
  takePictureAsync: jest.fn(),
  recordAsync: jest.fn(),
  stopRecording: jest.fn(),
};

export const cameraState: CameraPermissionsState = { camera: granted, microphone: granted, media: granted };

export const requestCameraPermission = jest.fn();
export const requestMicrophonePermission = jest.fn();
export const requestMediaPermission = jest.fn();

const MockCameraView = jest.fn(({ ref }: MockCameraViewProps) => {
  useImperativeHandle(ref, () => camera);
  return <View accessibilityLabel="camera-view" />;
});

export const lastCameraProps = (): Record<string, unknown> => MockCameraView.mock.calls.at(-1)?.[0] ?? {};

export const expoCameraMock = {
  __esModule: true,
  useCameraPermissions: jest.fn(() => [cameraState.camera, requestCameraPermission]),
  useMicrophonePermissions: jest.fn(() => [cameraState.microphone, requestMicrophonePermission]),
  CameraView: MockCameraView,
};

export const expoMediaLibraryMock = {
  __esModule: true,
  usePermissions: jest.fn(() => [cameraState.media, requestMediaPermission]),
  saveToLibraryAsync: jest.fn(),
};

export const expoImagePickerMock = {
  __esModule: true,
  launchImageLibraryAsync: jest.fn(),
};

// the ".jpeg-normalized.jpg" suffix makes JPEG-normalized outputs recognisable in assertions habit-hooks-disable non-essential-comment
export const manipulate = jest.fn((uri: string) => ({
  renderAsync: async () => ({
    saveAsync: async () => ({ uri: `${uri}.jpeg-normalized.jpg` }),
  }),
}));

export const expoImageManipulatorMock = {
  __esModule: true,
  ImageManipulator: { manipulate },
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
};

export const volumeState: VolumeState = {
  listener: null,
  volume: 0.5,
};
export const removeVolumeListener = jest.fn();

export const volumeManagerMock = {
  __esModule: true,
  VolumeManager: {
    getVolume: jest.fn(async () => ({ volume: volumeState.volume })),
    setVolume: jest.fn(async () => {}),
    addVolumeListener: jest.fn((listener: () => Promise<void>) => {
      volumeState.listener = listener;
      return { remove: removeVolumeListener };
    }),
  },
};

export const sliderMock = {
  __esModule: true,
  default: () => <View accessibilityLabel="zoom-slider" />,
};

export const resetCameraMocks = () => {
  cameraState.camera = granted;
  cameraState.microphone = granted;
  cameraState.media = granted;
  MockCameraView.mockClear();
  camera.takePictureAsync.mockReset();
  camera.recordAsync.mockReset();
  camera.stopRecording.mockReset();
  requestCameraPermission.mockReset();
  requestMicrophonePermission.mockReset();
  requestMediaPermission.mockReset();
  expoMediaLibraryMock.saveToLibraryAsync.mockReset();
  expoImagePickerMock.launchImageLibraryAsync.mockReset();
  manipulate.mockClear();
  volumeState.listener = null;
  volumeState.volume = 0.5;
  removeVolumeListener.mockReset();
  volumeManagerMock.VolumeManager.getVolume.mockClear();
  volumeManagerMock.VolumeManager.setVolume.mockClear();
  volumeManagerMock.VolumeManager.addVolumeListener.mockClear();
};

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

// lets a test hold an async native call (e.g. recordAsync) in flight and settle it later habit-hooks-disable non-essential-comment
export const deferred = <T,>(): Deferred<T> => {
  let resolve: Deferred<T>['resolve'] = () => undefined;
  let reject: Deferred<T>['reject'] = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
