import React, { FunctionComponent } from 'react';
import { router } from 'expo-router';
import { HeaderButton } from './header-button';

export const HeaderBackButton: FunctionComponent = () => (
  <HeaderButton iconName="arrow-left" onPress={() => router.back()} />
);
