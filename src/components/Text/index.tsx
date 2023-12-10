import React from 'react';
import {
  TextStyle,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';
import {colors, typography} from '~/src/constants';
import {system} from '~/src/features';
import {TranslationKey} from '~/src/features/system/localisation';

export interface TextProps extends RNTextProps {
  text?: TranslationKey;
  value?: string | number;
  style?: any;
  textAlign?: TextStyle['textAlign'];
}

export default function Text({
  text,
  value,
  style,
  children,
  ...rest
}: TextProps) {
  const darkMode = system.useDarkMode();
  const color = darkMode ? colors.textDark : colors.textLight;
  const appearance = [{color, ...typography.body}].concat(style);
  const currentLanguage = system.useCurrentLanguage();
  return (
    // @ts-ignore
    <RNText
      style={appearance}
      allowFontScaling={false}
      accessibilityRole="text"
      selectable={false}
      {...rest}>
      {!!text && system.translate(text)}
      {value}
      {children}
    </RNText>
  );
}
