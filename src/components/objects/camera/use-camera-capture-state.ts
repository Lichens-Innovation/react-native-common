import { useState } from 'react';
import type { CameraCaptureState } from './camera-capture.types';

export const useCameraCaptureState = (): CameraCaptureState => {
  const [captureCount, setCaptureCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingRecording, setPendingRecording] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [zoom, setZoom] = useState(0);

  return {
    captureCount,
    setCaptureCount,
    isRecording,
    setIsRecording,
    pendingRecording,
    setPendingRecording,
    torchEnabled,
    setTorchEnabled,
    zoom,
    setZoom,
  };
};
