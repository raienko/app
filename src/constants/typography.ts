import {TextStyle} from 'react-native';
import {rem} from '~/src/utils/helpers.ts';

type Typography = Pick<TextStyle, 'fontSize'>;

const typography: {
  [key in
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'body'
    | 'button'
    | 'caption']: Typography;
} = {
  h1: {
    fontSize: rem(31),
  },
  h2: {
    fontSize: rem(25),
  },
  h3: {
    fontSize: rem(19),
  },
  h4: {
    fontSize: rem(17),
  },
  h5: {
    fontSize: rem(14),
    // bold
  },
  body: {
    fontSize: rem(14),
  },
  button: {
    fontSize: rem(14),
  },
  caption: {
    fontSize: rem(11),
  },
};

export default typography;
