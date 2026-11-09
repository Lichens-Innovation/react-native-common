import type { EnumOptionDisplay } from '@lichens-innovation/ts-common/rjsf';
import { getRjsfDisplayLabel, getRjsfLabelColor, mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useMemo, type FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme';
import { RjsfDisplayLabel } from './display-label';

type YesNoWidgetOptions = {
  yesColor?: string;
  noColor?: string;
};

// The colour a selected "yes" takes when the template sets none, the green templates already use.
const DEFAULT_YES_COLOR = 'green';

type ChoiceProps = {
  label: string;
  selected: boolean;
  /** The colour of the selected state: border, text, and a tint of the background. */
  color: string;
  disabled: boolean;
  onPress: () => void;
};

/**
 * One square choice. Plain views and a text: no animation, no ripple, nothing set up on mount, since
 * a checklist can hold a hundred of these (rec 24.C). Selected, it takes its colour on the border and
 * the text, over a light tint of it.
 */
const Choice: FunctionComponent<ChoiceProps> = ({ label, selected, color, disabled, onPress }) => {
  const theme = useAppTheme();
  const styles = useChoiceStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      style={[styles.choice, { borderColor: selected ? color : theme.colors.outlineVariant }]}
    >
      {selected ? <View style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: color }]} /> : null}
      <Text
        variant="labelLarge"
        style={[styles.choiceText, { color: selected ? color : theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const useChoiceStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        choice: {
          minWidth: 44,
          height: 36,
          paddingHorizontal: 10,
          borderRadius: 8,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        tint: {
          opacity: 0.15,
        },
        choiceText: {
          fontWeight: '600',
        },
      }),
    []
  );

// Widget for rendering a "yes/no" value as two choices beside the question. Any value other than the
// two options shows as no selection.
export const RadioYesNoWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  onBlur,
  label,
  hideLabel,
  required,
  options,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();

  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const labelColor = getRjsfLabelColor(options);
  const enumOptions = mapEnumOptions(options);
  const widgetOptions = (options ?? {}) as YesNoWidgetOptions;

  const yesOption = enumOptions.find((opt: EnumOptionDisplay) => opt.value === 'yes') ?? enumOptions[0];
  const noOption = enumOptions.find((opt: EnumOptionDisplay) => opt.value === 'no') ?? enumOptions[1];

  const currentValue = typeof value === 'string' && value.length > 0 ? value : undefined;
  const isDisabled = Boolean(disabled || readonly);

  const handleSelect = (nextValue: string) => {
    if (isDisabled) return;
    onChange(nextValue);
    onBlur(id, nextValue);
  };

  return (
    <View style={styles.row}>
      <RjsfDisplayLabel label={displayLabel} color={labelColor} style={styles.question} />

      <View style={styles.choices}>
        {yesOption ? (
          <Choice
            label={yesOption.label}
            selected={currentValue === yesOption.value}
            color={widgetOptions.yesColor ?? DEFAULT_YES_COLOR}
            disabled={isDisabled}
            onPress={() => handleSelect(yesOption.value)}
          />
        ) : null}

        {noOption ? (
          <Choice
            label={noOption.label}
            selected={currentValue === noOption.value}
            color={widgetOptions.noColor ?? theme.colors.error}
            disabled={isDisabled}
            onPress={() => handleSelect(noOption.value)}
          />
        ) : null}
      </View>
    </View>
  );
};

// Memoized: built once per theme rather than on every render of every Yes/No field.
const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(() => buildStyles(theme), [theme]);
};

const buildStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginVertical: theme.spacing(0.5),
    },
    question: {
      flex: 1,
      flexWrap: 'wrap',
    },
    choices: {
      // Right-aligned even when the question is hidden.
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  });
