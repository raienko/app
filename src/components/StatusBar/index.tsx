import React, {useEffect} from 'react';
import {StatusBar as RNStatusBar, StatusBarProps} from 'react-native';
import {system} from '~/src/features';
import {isAndroid} from '~/src/utils';

export const statusBarConfig: any = {
  barStyle: 'dark-content',
  translucent: true,
  backgroundColor: 'transparent',
};

export const setupStatusBar = () => {
  RNStatusBar.setBarStyle(statusBarConfig.barStyle);
  if (isAndroid) {
    RNStatusBar.setTranslucent(statusBarConfig.translucent);
    RNStatusBar.setBackgroundColor(statusBarConfig.backgroundColor);
  }
};

export default function StatusBar(props: StatusBarProps) {
  const darkMode = system.useDarkMode();

  useEffect(() => {
    setupStatusBar();
  }, []);

  return (
    <RNStatusBar
      translucent
      backgroundColor="transparent"
      barStyle={darkMode ? 'light-content' : 'dark-content'}
      {...props}
    />
  );
}
