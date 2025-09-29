import React, { type FunctionComponent } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { OnOffState } from './on-off-toggle.utils';

interface OnOffToggleProps {
  isOn: boolean;
  toggleState: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const OnOffToggle: FunctionComponent<OnOffToggleProps> = ({ isOn, toggleState, style }) => {
  return (
    <SegmentedButtons
      buttons={[
        { value: OnOffState.on, icon: 'play' },
        { value: OnOffState.off, icon: 'stop' },
      ]}
      style={style}
      value={isOn ? OnOffState.on : OnOffState.off}
      onValueChange={toggleState}
    />
  );
};
