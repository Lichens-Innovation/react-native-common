import { isNotBlank } from '@lichens-innovation/ts-common';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { logger } from '../../logger/logger';

interface BuildFinalValueArgs {
  query: string;
  recordingValue: string;
}
export const buildFinalValue = ({ query, recordingValue }: BuildFinalValueArgs): string => {
  return [query, recordingValue].filter(isNotBlank).join(' ');
};

export const ensureVoiceRecognitionPermissions = async (): Promise<boolean> => {
  const permissions = await ExpoSpeechRecognitionModule.getPermissionsAsync();
  if (!permissions.granted) {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      logger.warn('[ensureVoiceRecognitionPermissions] Permissions not granted', result);
      return false;
    }
  }

  return true;
};
