import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {colors} from '~/src/constants';
import {system} from '~/src/features';
import {viewport, isDesktop} from '~/src/utils';

export type ScreenProps = {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: any;
};

export default function Screen({
  children,
  header,
  footer,
  style,
}: ScreenProps): React.JSX.Element {
  const darkMode = system.useDarkMode();
  const backgroundColor = darkMode ? colors.primaryDark : colors.primaryLight;
  return (
    <View
      style={[
        isDesktop ? styles.wrapperFixed : styles.wrapper,
        {backgroundColor},
      ]}>
      {header}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, style]}>
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
  wrapperFixed: {
    height: viewport.height,
    width: viewport.width,
  },
  container: {},
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
