import type { WidgetProps } from '@rjsf/utils';
import { useCallback } from 'react';

type CommitWidgetValueArgs = Pick<WidgetProps, 'id' | 'onChange' | 'onBlur'>;

export const useCommitWidgetValue = ({ id, onChange, onBlur }: CommitWidgetValueArgs) =>
  useCallback(
    (nextValue: unknown) => {
      onChange(nextValue);
      onBlur(id, nextValue);
    },
    [id, onChange, onBlur]
  );
