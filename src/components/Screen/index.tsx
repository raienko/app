import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '~/src/constants';
import {system} from '~/src/features';

export default function Screen({children}: any): React.JSX.Element {
  const darkMode = system.useDarkMode();
  const backgroundColor = darkMode ? colors.primaryDark : colors.primaryLight;
  return <View style={[styles.wrapper, {backgroundColor}]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
