import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TranslationKey} from '~/src/features/system';
import Text from '../Text';
import {colors, sizes} from '~/src/constants';
import {rem} from '~/src/utils';
import {system} from '~/src/features';

type SectionProps = {
  style?: any;
  title?: TranslationKey;
  description?: TranslationKey;
  children?: React.ReactNode;
};
export default function Section({
  style,
  title,
  description,
  children,
}: SectionProps) {
  const darkMode = system.useDarkMode();
  const backgroundColor = darkMode
    ? colors.secondaryDark
    : colors.secondaryLight;
  const appearance = [styles.wrapper, {backgroundColor}].concat(style);
  return (
    <View style={appearance}>
      <Text text={title} style={styles.title} type="h3" />
      <Text text={description} style={styles.description} />
      <View style={styles.divider} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: rem(365),
    borderWidth: 1,
    padding: sizes.offsetS,
    margin: sizes.offsetS,
    rowGap: sizes.offsetS,
    borderRadius: sizes.uiRadius,
    borderColor: colors.accentD,
  },
  title: {},
  description: {},
  divider: {
    height: 1,
    minWidth: '100%',
    alignSelf: 'center',
    backgroundColor: colors.accentA,
    marginVertical: sizes.offsetS,
  },
});
