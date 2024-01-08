import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {colors} from '~/src/constants';
import * as system from '~/src/features/system';
import {viewport, isWeb} from '~/src/utils';
import {SpaceForKeyboard} from '~/src/components';

export type ScreenProps = {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  overlay?: React.ReactNode;
  style?: any;
};

export default function Screen({
  children,
  overlay,
  header,
  footer,
  style,
}: ScreenProps): React.JSX.Element {
  const darkMode = system.useDarkMode();
  const backgroundColor = darkMode ? colors.primaryDark : colors.primaryLight;
  const route = useRoute();
  return (
    <View
      testID={route.name}
      style={[isWeb ? styles.wrapperFixed : styles.wrapper, {backgroundColor}]}>
      {header}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, style]}>
        {children}
      </ScrollView>
      <SpaceForKeyboard />
      {footer}
      <View style={styles.overlay}>{overlay}</View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
    zIndex: 1,
  },
});
