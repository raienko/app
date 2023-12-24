import React, {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import {system} from '~/src/features';

export type SpaceForKeyboardProps = {
  duration?: number;
  extraSpace?: number;
  enabled?: boolean;
};

export default function SpaceForKeyboard({
  duration = 200,
  extraSpace = 0,
  enabled = true,
}: SpaceForKeyboardProps) {
  const keyboardHeight = system.useKeyboardHeight() || 0;
  const height = useRef(new Animated.Value(keyboardHeight));
  const animation = useRef<any>();
  const animate = (nextHeight: number) => {
    if (animation.current) {
      animation.current?.stop();
    }

    const toValue = nextHeight ? nextHeight + extraSpace : nextHeight;
    animation.current = Animated.timing(height.current, {
      toValue,
      duration,
      useNativeDriver: false,
      easing: Easing.linear,
    });

    animation.current.start();
  };

  useEffect(() => {
    if (enabled) {
      animate(keyboardHeight);
    }
  }, [keyboardHeight]);

  return <Animated.View style={{height: height.current}} />;
}
