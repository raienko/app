import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {colors} from '~/src/constants';
import {system} from '~/src/features';
import {screenHeight, screenWidth, isWeb} from '~/src/utils';

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
    <View
      style={[isWeb ? styles.wrapperFixed : styles.wrapper, {backgroundColor}]}>
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
  wrapperFixed: {
    height: screenHeight,
    width: screenWidth,
  },
  container: {},
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
