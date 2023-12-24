import {TextStyle} from 'react-native';
import {rem, isDesktop} from '~/src/utils/helpers.ts';
import fonts from '~/src/constants/fonts.ts';

export type Typography = Pick<TextStyle, 'fontSize' | 'fontFamily'>;
export type TypographyTypes =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'body'
  | 'button'
  | 'caption';

const typography: {
  [key in TypographyTypes]: Typography;
} = {
  h1: {
    fontSize: isDesktop ? 31 : rem(31),
    fontFamily: fonts.secondary,
  },
  h2: {
    fontSize: isDesktop ? 25 : rem(25),
    fontFamily: fonts.primary,
  },
  h3: {
    fontSize: isDesktop ? 19 : rem(19),
    fontFamily: fonts.primary,
  },
  h4: {
    fontSize: isDesktop ? 17 : rem(17),
    fontFamily: fonts.primary,
  },
  h5: {
    fontSize: isDesktop ? 14 : rem(14),
    fontFamily: fonts.primary,
  },
  body: {
    fontSize: isDesktop ? 14 : rem(14),
    fontFamily: fonts.primary,
  },
  button: {
    fontSize: isDesktop ? 14 : rem(14),
    fontFamily: fonts.primary,
  },
  caption: {
    fontSize: isDesktop ? 11 : rem(11),
    fontFamily: fonts.primary,
  },
};

export default typography;
