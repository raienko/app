import React from 'react';
import LottieView, {LottieViewProps} from 'lottie-react-native';

interface LottieAnimationProps extends LottieViewProps {}

export default function LottieAnimation(props: LottieAnimationProps) {
  const defaultSize = {width: 100, height: 100};
  return <LottieView style={defaultSize} {...props} />;
}
