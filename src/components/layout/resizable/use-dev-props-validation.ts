import { useEffect } from 'react';
import { isDevelopment } from '../../../utils/utils.index';

export const useDevPropsValidation = <TProps>(props: TProps, validate: (props: TProps) => void) => {
  useEffect(() => {
    if (isDevelopment()) validate(props);
  }, [props, validate]);
};
