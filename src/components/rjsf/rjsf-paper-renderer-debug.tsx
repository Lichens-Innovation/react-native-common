import { IChangeEvent } from '@rjsf/core';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SyntaxColoring } from '~/components/syntax/syntax-coloring';
import { useAppTheme } from '~/theme/theme';
import { RjsfPaperRenderer, RjsfPaperRendererProps } from './rjsf-paper-renderer';

export type RjsfPaperRendererDebugProps = RjsfPaperRendererProps;

export const RjsfPaperRendererDebug: FunctionComponent<RjsfPaperRendererDebugProps> = ({
  formData: initialFormData,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialFormData ?? {});

  const initialFormDataJson = JSON.stringify(initialFormData ?? {});

  // Reset local form state when initial form data (by value) changes, e.g. when parent resets the form.
  useEffect(() => {
    setFormData(initialFormData ?? {});
  }, [initialFormDataJson]);

  const handleChange = (event: IChangeEvent, id?: string) => {
    setFormData(event.formData ?? {});
    onChange?.(event, id);
  };

  return (
    <View style={styles.container}>
      <RjsfPaperRenderer {...rest} formData={formData ?? initialFormData} onChange={handleChange} />

      <View style={styles.debugSection}>
        <Text>{t('app:formDemo.formDataLabel')}</Text>

        <View style={styles.codeBlock}>
          <SyntaxColoring code={JSON.stringify(formData, null, 2)} language="json" />
        </View>
      </View>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    container: {
      gap: theme.spacing(2),
    },
    debugSection: {
      gap: theme.spacing(1),
    },
    codeBlock: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors?.outline,
      borderRadius: theme.roundness,
    },
  });
};
