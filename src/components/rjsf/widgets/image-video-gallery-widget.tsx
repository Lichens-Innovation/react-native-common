import type { WidgetProps } from '@rjsf/utils';
import { useCallback, useMemo, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.index';
import { RjsfDisplayLabel } from './display-label';
import { getWidgetTitle } from './shared/widget-title.utils';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';
import { isWidgetDisplayOnly } from './shared/widget-state.utils';
import { CameraAndThumbnails } from '../../objects/camera-and-thumbnails';

interface ImageVideoGalleryWidgetOptions {
  allowMultipleSelection?: boolean;
  enableVideo?: boolean;
}

// Value contract: an array of media uris used for rendering; the persisted formData should carry object_uuids instead. habit-hooks-disable non-essential-comment
export const ImageVideoGalleryWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, disabled, readonly, options } = props;
  const styles = useStyles();
  const commitValue = useCommitWidgetValue(props);
  const isDisplayOnly = isWidgetDisplayOnly(props);
  const widgetTitle = getWidgetTitle(props);
  const widgetOptions = (options ?? {}) as ImageVideoGalleryWidgetOptions;
  const allowMultipleSelection = widgetOptions.allowMultipleSelection ?? true;
  const enableVideo = widgetOptions.enableVideo ?? true;
  const uris = useMemo<string[]>(() => (Array.isArray(value) ? value : []), [value]);

  const handleObjectsTaken = useCallback(
    (newUris: string[]) => {
      if (isDisplayOnly) return;
      commitValue(allowMultipleSelection ? [...uris, ...newUris] : newUris);
    },
    [isDisplayOnly, allowMultipleSelection, uris, commitValue]
  );

  const handleObjectRemove = useCallback(
    (uriToRemove: string) => {
      if (isDisplayOnly) return;
      commitValue(uris.filter((uri) => uri !== uriToRemove));
    },
    [isDisplayOnly, uris, commitValue]
  );

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel {...widgetTitle} style={styles.title} />
      <CameraAndThumbnails
        uris={uris}
        disabled={disabled}
        readonly={readonly}
        handleObjectRemove={handleObjectRemove}
        handleObjectsTaken={handleObjectsTaken}
        allowMultipleSelection={allowMultipleSelection}
        enableVideo={enableVideo}
      />
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        widgetBlock: {
          marginVertical: theme.spacing(0.5),
        },
        title: {
          marginBottom: theme.spacing(1),
        },
      }),
    [theme]
  );
};
