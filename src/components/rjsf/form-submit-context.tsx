import { NO_OP } from '@lichens-innovation/ts-common';
import { createContext, useCallback, useRef, type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

/** habit-hooks-disable non-essential-comment
 * Form submit context for RJSF on React Native.
 *
 * On the web, a form submit is handled by the DOM: a <form> wraps inputs and a button with
 * type="submit" triggers the form's onSubmit. RJSF does not need to pass the submit handler
 * to the theme's submit button because the browser wires it automatically.
 *
 * On React Native there is no native form element or submit semantics. The theme's SubmitButton
 * is just a Pressable; it has no way to receive the Form's onSubmit from RJSF (the theme API
 * does not pass it). This context bridges that gap: the wrapper that receives onSubmit from
 * RJSF provides it via context, and the SubmitButton consumes it to trigger submission on press.
 */

export type SubmitHandler = (event?: unknown) => void;

export const FormSubmitContext = createContext<SubmitHandler>(NO_OP);

export interface SubmitButtonOptions {
  submitButtonAbsolutePosition: boolean;
  submitButtonOverrideLabel: string | null;
}

export const SubmitButtonOptionsContext = createContext<SubmitButtonOptions>({
  submitButtonAbsolutePosition: false,
  submitButtonOverrideLabel: null,
});

interface FormWrapperProps extends ViewProps {
  onSubmit?: SubmitHandler;
}

export const RjsfPaperFormWrapper: React.ComponentType<PropsWithChildren<FormWrapperProps>> = ({
  onSubmit,
  children,
  ...viewProps
}) => {
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const handleSubmit = useCallback<SubmitHandler>((event) => {
    submitRef.current?.(event);
  }, []);

  return (
    <FormSubmitContext.Provider value={handleSubmit}>
      <View {...viewProps}>{children}</View>
    </FormSubmitContext.Provider>
  );
};
