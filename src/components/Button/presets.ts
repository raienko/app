import {rem, isDesktop} from '~/src/utils';
import {colors, sizes} from '~/src/constants';
import {TextStyle, ViewStyle} from 'react-native';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'primary' | 'secondary' | 'tertiary';
export type ButtonPreset = {
  wrapper: any;
  text: any;
};

const proportionsSchema: {[key in ButtonSize]: any} = {
  large: {
    width: rem(isDesktop ? 280 : 343),
    height: rem(48),
    borderRadius: sizes.uiRadius,
  },
  medium: {
    width: rem(160),
    height: rem(isDesktop ? 30 : 40),
    borderRadius: sizes.uiRadius,
    paddingHorizontal: sizes.offsetS,
  },
  small: {
    width: rem(isDesktop ? 70 : 90),
    height: rem(isDesktop ? 15 : 32),
    borderRadius: sizes.uiRadius,
    paddingHorizontal: sizes.offsetS,
  },
};

const appearanceSchema: {
  [key in ButtonType]: {wrapper: ViewStyle; text: TextStyle};
} = {
  primary: {
    wrapper: {
      backgroundColor: colors.accentA,
    },
    text: {
      color: colors.textDark,
    },
  },
  secondary: {
    wrapper: {
      borderWidth: 1,
      borderColor: colors.accentA,
    },
    text: {
      color: colors.accentA,
    },
  },
  tertiary: {
    wrapper: {
      borderWidth: 1,
      borderColor: colors.accentC,
    },
    text: {
      color: colors.accentD,
    },
  },
};

export const getButtonPreset = (
  size: ButtonSize,
  type: ButtonType,
): ButtonPreset => {
  const proportions = proportionsSchema[size];
  const appearance = appearanceSchema[type];
  return {
    wrapper: {
      ...proportions,
      ...appearance.wrapper,
    },
    text: {
      ...appearance.text,
    },
  };
};
