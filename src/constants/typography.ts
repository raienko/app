import {TextStyle} from 'react-native';
import {rem, isDesktop} from '~/src/utils/helpers.ts';

export type Typography = Pick<TextStyle, 'fontSize'>;
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
  },
  h2: {
    fontSize: isDesktop ? 25 : rem(25),
  },
  h3: {
    fontSize: isDesktop ? 19 : rem(19),
  },
  h4: {
    fontSize: isDesktop ? 17 : rem(17),
  },
  h5: {
    fontSize: isDesktop ? 14 : rem(14),
  },
  body: {
    fontSize: isDesktop ? 14 : rem(14),
  },
  button: {
    fontSize: isDesktop ? 14 : rem(14),
  },
  caption: {
    fontSize: isDesktop ? 11 : rem(11),
  },
};

export default typography;
