import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {colors} from '~/src/constants';
import {system} from '~/src/features';

export type ScreenProps = {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Screen({
  children,
  header,
  footer,
}: ScreenProps): React.JSX.Element {
  const darkMode = system.useDarkMode();
  const backgroundColor = darkMode ? colors.primaryDark : colors.primaryLight;
  return (
    <View style={[styles.wrapper, {backgroundColor}]}>
      {header}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
