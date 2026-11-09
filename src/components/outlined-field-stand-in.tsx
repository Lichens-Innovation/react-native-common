import type { FunctionComponent, ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '../theme';

export interface OutlinedFieldStandInProps {
  label?: string;
  /** The resting label's colour; defaults to the theme's. A template's label colour arrives here. */
  labelColor?: string;
  outlineColor?: string;
  error?: boolean;
  /** Several lines tall: the field's own `minHeight` (from `style`) sets the height, the label rests on the first line. */
  multiline?: boolean;
  /** Not pressable, as a read-only field. */
  readonly?: boolean;
  /** Shown on the right inside the outline, like Paper's `TextInput.Affix` (a number field's unit). */
  rightText?: string;
  style?: StyleProp<ViewStyle>;
  /** Swaps the real input in. Not called on a read-only field. */
  onActivate: () => void;
}

/**
 * An empty Paper outlined text field drawn from plain views (rec 24.C): the outline 6 dp below the top
 * of a 56 dp box, the label resting inside 16 dp from the left. Paper's input measures its label and
 * draws three times on mount, about 17 ms per field on a recent Android; a form of dozens of empty
 * fields drew them all for fields most users never touch. The field swaps the real input in when
 * pressed.
 */
export const OutlinedFieldStandIn: FunctionComponent<OutlinedFieldStandInProps> = ({
  label,
  labelColor,
  outlineColor,
  error,
  multiline,
  readonly,
  rightText,
  style,
  onActivate,
}) => {
  const theme = useAppTheme();
  const styles = useStandInStyles();
  const restingColor = error ? theme.colors.error : (labelColor ?? theme.colors.onSurfaceVariant);
  const borderColor = error ? theme.colors.error : (outlineColor ?? theme.colors.outline);

  return (
    <Pressable
      onPress={readonly ? undefined : onActivate}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[multiline ? styles.multiline : styles.singleLine, style]}
      testID="text-field-stand-in"
    >
      <View style={[styles.outline, { borderColor, borderRadius: theme.roundness }]} />
      <View style={styles.firstLine}>
        {label ? (
          <Text variant="bodyLarge" numberOfLines={1} style={[styles.label, { color: restingColor }]}>
            {label}
          </Text>
        ) : null}
        {rightText ? (
          <Text variant="bodyLarge" style={[styles.rightText, { color: theme.colors.onSurfaceVariant }]}>
            {rightText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

/** The microphone beside a stand-in: the 44 dp contained Paper IconButton, from plain views. */
export const MicStandIn: FunctionComponent<{ disabled?: boolean; onDictate: () => void }> = ({
  disabled,
  onDictate,
}) => {
  const theme = useAppTheme();
  const styles = useStandInStyles();

  return (
    <Pressable
      onPress={disabled ? undefined : onDictate}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={12}
      style={[styles.mic, { backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.surfaceVariant }]}
      testID="dictation-mic"
    >
      <Icon
        source="microphone-outline"
        size={28}
        color={disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary}
      />
    </Pressable>
  );
};

const useStandInStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        singleLine: {
          height: 56,
        },
        multiline: {
          minHeight: 56,
        },
        outline: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 6,
          bottom: 0,
          borderWidth: 1,
        },
        // The band the label rests in: the first 50 dp of the outline, which starts 6 dp down.
        firstLine: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 6,
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        },
        label: {
          flex: 1,
        },
        rightText: {
          marginLeft: 8,
        },
        // Same box as VoiceRecognitionTextInput's microphone: 28 dp icon, 8 dp padding, 6 dp vertical
        // margin, and its micButton margins on the sides.
        mic: {
          width: 44,
          height: 44,
          borderRadius: 22,
          marginVertical: 6,
          marginLeft: 4,
          marginRight: -4,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    []
  );
