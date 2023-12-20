import React from 'react';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';
import {translate, TranslationKey} from '~/src/features/system/localisation';
import {colors, typography} from '~/src/constants';
import {system} from '~/src/features';
import Text from '../Text';
import If from '../If';
import sizes from '~/src/constants/sizes';

// @ts-ignore
export interface InputProps extends TextInputProps {
  label?: TranslationKey;
  error?: TranslationKey;
  placeholder?: TranslationKey;
  style?: any;
}

export default function Input({label, error, style, ...rest}: InputProps) {
  const darkMode = system.useDarkMode();
  const color = darkMode ? colors.textDark : colors.textLight;
  const appearance = [styles.input, {color}].concat(style);
  const placeholder = rest.placeholder
    ? translate(rest.placeholder)
    : undefined;
  system.useCurrentLanguage();

  return (
    <View style={[styles.wrapper, {borderColor: color}]}>
      <If condition={!!label}>
        <Text text={label} />
      </If>
      <TextInput
        style={appearance}
        allowFontScaling={false}
        {...rest}
        placeholder={placeholder}
      />
      <If condition={!!error}>
        <Text text={error} />
      </If>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 2,
    padding: sizes.offsetXS,
    borderRadius: sizes.uiRadius,
  },
  input: {
    ...typography.h5,
  },
});
