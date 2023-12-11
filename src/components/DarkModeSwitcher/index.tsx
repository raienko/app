import React from 'react';
import {StyleSheet} from 'react-native';
import Text from '~/src/components/Text';
import {system} from '~/src/features';
import {sizes} from '~/src/constants';

export interface DarkModeSwitcherProps {
  style?: any;
}

export default function DarkModeSwitcher({style}: DarkModeSwitcherProps) {
  const darkMode = system.useDarkMode();
  const appearance = [styles.wrapper].concat(style);
  return (
    <Text
      style={appearance}
      value={darkMode ? '☀️' : '🌚'}
      onPress={() => system.setDarkMode(!darkMode)}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    fontSize: sizes.iconMedium,
  },
});
