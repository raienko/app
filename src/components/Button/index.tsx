import React from 'react';
import {Pressable, PressableProps, StyleSheet} from 'react-native';
import Text from '../Text';
import {ButtonSize, ButtonType, getButtonPreset} from './presets';
import typography from '~/src/constants/typography';
import {TranslationKey} from '~/src/features/system/localisation';
import {extendChildrenWith} from '~/src/utils';

export interface ButtonProps extends PressableProps {
  text?: TranslationKey;
  value?: string | number;
  style?: any;
  size?: ButtonSize;
  type?: ButtonType;
  children?: React.ReactNode;
}

export default function Button({
  text,
  value,
  style,
  size = 'medium',
  type = 'primary',
  ...rest
}: ButtonProps) {
  const preset = getButtonPreset(size, type);

  const wrapperStyle = [styles.wrapper, preset.wrapper].concat(style);
  const textStyle = [styles.text, preset.text];

  const elements = extendChildrenWith(rest?.children, {
    color: preset.text?.color,
  });

  return (
    <Pressable style={wrapperStyle} {...rest}>
      <Text
        text={text}
        value={value}
        type="button"
        style={textStyle}
        selectable={false}
        textAlign="center"
      />
      {elements}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
  },
});
