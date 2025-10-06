import { type FunctionComponent } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useAppTheme } from '../../theme';

const OnOffState = {
  on: 'on',
  off: 'off',
} as const;

interface OnOffToggleProps {
  isOn: boolean;
  onValueChange: (isOn: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export const OnOffToggle: FunctionComponent<OnOffToggleProps> = ({ isOn, onValueChange, style }) => {
  const theme = useAppTheme();
  const checkedColor = theme.colors.primary;
  const uncheckedColor = theme.colors.tertiary;

  return (
    <SegmentedButtons
      value={isOn ? OnOffState.on : OnOffState.off}
      onValueChange={(value) => onValueChange(value === OnOffState.on)}
      buttons={[
        {
          value: OnOffState.on,
          icon: 'play',
          checkedColor,
          uncheckedColor,
        },
        {
          value: OnOffState.off,
          icon: 'stop',
          checkedColor,
          uncheckedColor,
        },
      ]}
      style={style}
    />
  );
};
