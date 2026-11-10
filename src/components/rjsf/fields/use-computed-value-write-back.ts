import type { FieldPathList, FieldProps, RJSFSchema } from '@rjsf/utils';
import { useEffect, useLayoutEffect, useRef } from 'react';

interface UseComputedValueWriteBackArgs {
  computed: number | null;
  formData: unknown;
  onChange: FieldProps<unknown, RJSFSchema>['onChange'];
  fieldPath: FieldPathList;
  baseId: string;
}

/** habit-hooks-disable non-essential-comment
 * Writing back on mount marked a form dirty with no user action — the screen diffs rjsf's formData
 * against the baseline it captured at open — and cost a full rjsf change cycle while the form was
 * still appearing. A stored value that is already a finite number therefore stands until a
 * dependency actually changes; only a genuinely absent one is seeded (SPOTD-621).
 */
export const useComputedValueWriteBack = ({
  computed,
  formData,
  onChange,
  fieldPath,
  baseId,
}: UseComputedValueWriteBackArgs): void => {
  const hasSettledFirstPassRef = useRef<boolean>(false);
  // Runs on `computed` only: fieldPath/baseId derive from a stable id, and onChange/formData change every render. habit-hooks-disable non-essential-comment
  const latestRef = useRef({ formData, onChange, fieldPath, baseId });
  useLayoutEffect(() => {
    latestRef.current = { formData, onChange, fieldPath, baseId };
  }, [formData, onChange, fieldPath, baseId]);

  useEffect(() => {
    const { formData, onChange, fieldPath, baseId } = latestRef.current;
    const isFirstPass = !hasSettledFirstPassRef.current;
    hasSettledFirstPassRef.current = true;
    const storedIsUsable = typeof formData === 'number' && Number.isFinite(formData);

    if (computed === null) {
      if (formData === undefined || isFirstPass) return;
      onChange(undefined, fieldPath, undefined, baseId);
      return;
    }
    if (computed === formData) return;
    if (isFirstPass && storedIsUsable) return;
    onChange(computed, fieldPath, undefined, baseId);
  }, [computed]);
};
