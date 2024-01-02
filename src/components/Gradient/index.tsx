import React from 'react';
import {View, StyleSheet} from 'react-native';
import {LinearGradient, RadialGradient} from 'react-native-gradients';
import {Color} from 'react-native-gradients/dist/typescript/types';

export type GradientProps = {
  radial?: boolean;
  colorList: Color[];
  angle?: number;
  style?: any;
};

export default function Gradient({
  radial,
  colorList = [],
  angle = 0,
  style,
  ...rest
}: GradientProps) {
  const Background = radial ? RadialGradient : LinearGradient;
  const appearance = [styles.wrapper].concat(style);
  return (
    <View style={appearance}>
      {/*@ts-ignore */}
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
