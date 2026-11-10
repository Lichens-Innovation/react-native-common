import type { CameraView, PermissionResponse } from 'expo-camera';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { TFunction } from 'i18next';

export type CameraCaptureMode = 'image' | 'video';

export interface CameraFullModalArgs {
  mode?: CameraCaptureMode;
  onClose: () => void;
  handleObjectsTaken: (uris: string[]) => void;
  allowMultipleSelection?: boolean;
}

interface GrantStatus {
  granted: boolean;
}

export interface CameraCaptureRefs {
  camera: RefObject<CameraView | null>;
  manualStop: RefObject<boolean>;
  /** Set once the user chose to record without sound, so they are not asked again for this session. habit-hooks-disable non-essential-comment */
  recordWithoutSound: RefObject<boolean>;
}

export interface CameraCaptureState {
  captureCount: number;
  setCaptureCount: Dispatch<SetStateAction<number>>;
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  pendingRecording: boolean;
  setPendingRecording: Dispatch<SetStateAction<boolean>>;
  torchEnabled: boolean;
  setTorchEnabled: Dispatch<SetStateAction<boolean>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
}

export interface CameraCapturePermissions {
  audioPermission: PermissionResponse | null;
  requestAudioPermission: () => Promise<PermissionResponse>;
  mediaPermission: GrantStatus | null;
  requestMediaPermission: () => Promise<GrantStatus>;
}

export interface CameraCaptureContext extends CameraFullModalArgs, CameraCaptureState, CameraCapturePermissions {
  allowMultipleSelection: boolean;
  refs: CameraCaptureRefs;
  t: TFunction;
  showSnackbar: (message: string) => void;
  triggerCaptureFlash: () => void;
}
