import { useIsDarkMode } from '../theme/theme';
import { LOG_LEVELS } from './logger.types';

const LOG_COLORS_DARK_MODE = new Map<number, string>([
  [LOG_LEVELS.debug, '#9e9e9e'],
  [LOG_LEVELS.log, '#e0e0e0'],
  [LOG_LEVELS.info, '#64b5f6'],
  [LOG_LEVELS.warn, '#ffb74d'],
  [LOG_LEVELS.error, '#ef5350'],
]);

const LOG_COLORS_LIGHT_MODE = new Map<number, string>([
  [LOG_LEVELS.debug, '#757575'],
  [LOG_LEVELS.log, '#424242'],
  [LOG_LEVELS.info, '#1976d2'],
  [LOG_LEVELS.warn, '#f57c00'],
  [LOG_LEVELS.error, '#d32f2f'],
]);

export const useLogEntryColor = (severity: number) => {
  const isDarkMode = useIsDarkMode();
  const colors = isDarkMode ? LOG_COLORS_DARK_MODE : LOG_COLORS_LIGHT_MODE;

  return colors.get(severity) ?? 'orange';
};
