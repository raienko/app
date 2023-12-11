import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {colors, sizes} from '~/src/constants';
import {system} from '~/src/features';
import {TranslationKey} from '~/src/features/system';
import Text from '../Text';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {rem} from '~/src/utils';

export type HeaderProps = {
  left?: React.ReactNode;
  title?: TranslationKey;
  subtitle?: TranslationKey;
  right?: React.ReactNode;
  avoidNotch?: boolean;
};

export default function Header({
  left,
  right,
  title,
  subtitle,
  avoidNotch = true,
}: HeaderProps): React.JSX.Element {
  const darkMode = system.useDarkMode();
  const backgroundColor = darkMode ? colors.primaryDark : colors.primaryLight;
  const safeAreaOffset =
    useSafeAreaInsets().top || StatusBar.currentHeight || 0;
  const paddingTop = (avoidNotch ? safeAreaOffset : 0) + sizes.offsetXS;
  return (
    <View
      style={[styles.wrapper, {backgroundColor}, avoidNotch && {paddingTop}]}>
      <View style={[styles.container]}>
        <View style={[styles.cell, styles.left]}>{left}</View>
        <View style={styles.center}>
          <Text text={title} />
          <Text text={subtitle} />
        </View>
        <View style={[styles.cell, styles.right]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizes.offsetS,
    height: rem(40),
  },
  cell: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '23%',
    height: '100%',
  },
  left: {
    justifyContent: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    justifyContent: 'flex-end',
  },
});
