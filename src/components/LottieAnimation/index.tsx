import React from 'react';
import LottieView, {LottieViewProps} from 'lottie-react-native';

interface LottieAnimationProps extends LottieViewProps {}

export default function LottieAnimation(props: LottieAnimationProps) {
  return <LottieView style={{width: 100, height: 100}} {...props} />;
}
