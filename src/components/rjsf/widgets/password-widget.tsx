import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { PasswordInput } from '../../../components/password-input/password-input';
import { useTextEntryProps } from './shared/use-text-entry-props';

export const PasswordWidget: FunctionComponent<WidgetProps> = (props) => {
  const { inputProps, changeText } = useTextEntryProps(props);

  return <PasswordInput {...inputProps} onChangeText={changeText} />;
};
