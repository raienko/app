import {rem, isDesktop} from '~/src/utils/helpers';

export default {
  iconSmall: rem(16),
  iconMedium: rem(24),
  iconLarge: rem(32),
  offsetXS: rem(4),
  offsetS: rem(8),
  offsetM: rem(16),
  offsetL: rem(32),
  uiRadius: isDesktop ? 8 : rem(8),
};
