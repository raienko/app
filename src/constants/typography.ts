import {TextStyle} from 'react-native';
import {rem, isWeb} from '~/src/utils/helpers.ts';

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
    fontSize: isWeb ? 31 : rem(31),
  },
  h2: {
    fontSize: isWeb ? 25 : rem(25),
  },
  h3: {
    fontSize: isWeb ? 19 : rem(19),
  },
  h4: {
    fontSize: isWeb ? 17 : rem(17),
  },
  h5: {
    fontSize: isWeb ? 14 : rem(14),
  },
  body: {
    fontSize: isWeb ? 14 : rem(14),
  },
  button: {
    fontSize: isWeb ? 14 : rem(14),
  },
  caption: {
    fontSize: isWeb ? 11 : rem(11),
  },
};

export default typography;
