import React from 'react';
import {View, StyleSheet} from 'react-native';
import {LinearGradient, RadialGradient} from 'react-native-gradients';
import {Color} from 'react-native-gradients/dist/typescript/types';

export type GradientProps = {
  radial?: boolean;
  colorList: Color[];
  angle?: number;
};

export default function Gradient({
  radial,
  colorList = [],
  angle = 0,
  ...rest
}: GradientProps) {
  const Background = radial ? RadialGradient : LinearGradient;
  return (
    <View style={styles.wrapper}>
      <Background colorList={colorList} angle={angle} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});
