import { NO_OP } from '@lichens-innovation/ts-common';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useRef } from 'react';
import { View, type ViewProps } from 'react-native';

/**
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

interface FormWrapperProps extends ViewProps {
  onSubmit?: SubmitHandler;
}

/** Wraps RJSF form content in a View and provides submit handler via context for Paper SubmitButton. */
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
