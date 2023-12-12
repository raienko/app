import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import animation from '~/assets/lottie/launchAnimation.json';
import {LottieAnimation} from '~/src/components';
import {rem} from '~/src/utils';
import {colors} from '~/src/constants';

let ref = React.createRef<(value: boolean) => any>();

const animationDuration = 2000;

export const showSplashScreen = () => ref.current?.(false);

export const hideSplashScreen = () => ref.current?.(true);

export default function LaunchScreen(): React.ReactNode {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // @ts-ignore
    ref.current = (value: boolean) => setHidden(value);
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <View style={[styles.wrapper, hidden && styles.hidden]}>
      <LottieAnimation
        style={styles.animation}
        source={animation}
        loop={false}
        autoPlay
        onAnimationFinish={() => hideSplashScreen()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    pointerEvents: 'none',
  },
  animation: {
    width: rem(300),
    height: rem(300),
  },
});
