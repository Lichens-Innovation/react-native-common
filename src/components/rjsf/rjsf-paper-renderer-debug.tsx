import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SyntaxColoring } from '../../components/syntax/syntax-coloring';
import { useAppTheme } from '../../theme/theme';
import { FormData, RjsfPaperRenderer, RjsfPaperRendererProps } from './rjsf-paper-renderer';

export type RjsfPaperRendererDebugProps = RjsfPaperRendererProps;

export const RjsfPaperRendererDebug: FunctionComponent<RjsfPaperRendererDebugProps> = ({
  formData: initialFormData,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  // Mirrors the data for the JSON dump ONLY. It is deliberately not fed back as the renderer's
  // `formData`: doing that made the underlying rjsf Form controlled, which doubled the whole-schema
  // state derivations per keystroke and reset the live-value cache on every change — so switching
  // this debug view on would have shown the pre-SPOTD-621 lag rather than what ships.
  const [formData, setFormData] = useState<FormData>(initialFormData ?? {});

  const initialFormDataJson = useMemo(() => JSON.stringify(initialFormData ?? {}), [initialFormData]);

  useEffect(() => {
    setFormData(initialFormData ?? {});
  }, [initialFormDataJson]);

  const handleChange = useCallback(
    (event: IChangeEvent<FormData, RJSFSchema>, id?: string) => {
      setFormData(event.formData ?? {});
      onChange?.(event, id);
    },
    [onChange]
  );

  return (
    <View style={styles.container}>
      <RjsfPaperRenderer {...rest} formData={initialFormData} onChange={handleChange} />

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
