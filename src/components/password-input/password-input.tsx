import { useToggle } from '@uidotdev/usehooks';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, TextInputProps } from 'react-native-paper';

export type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry'>;

export const PasswordInput: FunctionComponent<PasswordInputProps> = ({ label, ...rest }) => {
  const { t } = useTranslation();
  const [isPasswordVisible, toggleShowPassword] = useToggle();

  const displayLabel = label ?? t('common:password');
  const icon = isPasswordVisible ? 'eye-off' : 'eye';
  const showA11yLabel = isPasswordVisible
    ? t('common:passwordInput.hidePassword')
    : t('common:passwordInput.showPassword');

  return (
    <TextInput
      label={displayLabel}
      secureTextEntry={!isPasswordVisible}
      right={<TextInput.Icon icon={icon} onPress={() => toggleShowPassword()} accessibilityLabel={showA11yLabel} />}
      {...rest}
    />
  );
};
