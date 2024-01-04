import React from 'react';
import {StyleSheet, Animated, View} from 'react-native';
import {rem} from '~/src/utils';
import {colors, sizes} from '~/src/constants';

export type ProgressBarProps = {
  style?: any;
  progress?: number;
};

export default function ProgressBar({style, progress = 0}: ProgressBarProps) {
  const appearance = [styles.wrapper].concat(style);
  const barAppearance = [
    styles.progress,
    {width: `${progress}%`, height: '100%'},
  ];

  return (
    <View style={appearance}>
      <Animated.View
        //@ts-ignore
        style={barAppearance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: rem(30),
    width: rem(300),
    borderWidth: 2,
    borderRadius: sizes.uiRadius,
    borderColor: colors.accentA,
    overflow: 'hidden',
  },
  progress: {
    backgroundColor: colors.accentA,
  },
});
