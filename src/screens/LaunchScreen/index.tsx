import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import animation from '~/assets/lottie/launchAnimation.json';
import {LottieAnimation} from '~/src/components';
import {rem, useEventBus, eventBus} from '~/src/utils';
import {colors} from '~/src/constants';
import {system} from '~/src/features';

const event = 'SET_LAUNCH_SCREEN_HIDDEN';

export const showSplashScreen = () => eventBus.dispatch(event, false);

export const hideSplashScreen = () => eventBus.dispatch(event, true);

export default function LaunchScreen(): React.ReactNode {
  const [hidden, setHidden] = useState(false);
  useEventBus(event, setHidden);

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
