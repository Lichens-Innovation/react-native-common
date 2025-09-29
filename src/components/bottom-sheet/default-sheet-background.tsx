import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { FunctionComponent } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '../../theme/theme';

export const DefaultSheetBackground: FunctionComponent<BottomSheetBackgroundProps> = ({ style }) => {
  const { colors } = useAppTheme();
  return <View style={[style, { backgroundColor: colors.background }]} />;
};
