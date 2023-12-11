import {TransitionPresets} from '@react-navigation/stack';

export const defaultStackOptions: any = {
  headerShown: false,
  gestureEnabled: false,
  presentation: 'transparentModal',
  ...TransitionPresets.SlideFromRightIOS,
};

if (defaultStackOptions?.transitionSpec?.open) {
  const transitionSpeed = 500;
  defaultStackOptions.transitionSpec.open.config.stiffness = transitionSpeed;
  defaultStackOptions.transitionSpec.close.config.stiffness = transitionSpeed;
}

export const modalFromBottom: any = {
  ...defaultStackOptions,
  ...TransitionPresets.ModalSlideFromBottomIOS,
};

export const modalFade: any = {
  ...defaultStackOptions,
  ...TransitionPresets.ModalFadeTransition,
};
