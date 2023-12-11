import React from 'react';
import {View, StyleSheet} from 'react-native';
import Text from '../Text';
import {system} from '~/src/features';
import {sizes} from '~/src/constants';
import {rem} from '~/src/utils';

export interface LanguageSwitcherProps {
  style?: any;
}

const flags: any = {
  uk: '🇺🇦',
  en: '🇺🇸',
};

export default function LanguageSwitcher({style}: LanguageSwitcherProps) {
  const currentLanguage = system.useCurrentLanguage();
  const renderLocale = (locale: string) => {
    const active = currentLanguage === locale;
    return (
      <Text
        key={locale}
        value={flags?.[locale]}
        style={[styles.flag, active && styles.flagActive]}
        onPress={() => system.setCurrentLanguage(locale)}
      />
    );
  };

  const appearance = [styles.wrapper].concat(style);
  return (
    <View style={appearance}>{system.availableLocales.map(renderLocale)}</View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: sizes.iconSmall,
    marginHorizontal: rem(5),
  },
  flagActive: {
    fontSize: sizes.iconMedium,
  },
});
