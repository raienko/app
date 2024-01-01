import React from 'react';
import {View, StyleSheet} from 'react-native';
import {LinearGradient, RadialGradient} from 'react-native-gradients';

export type GradientProps = {
  radial?: boolean;
  colorList: any;
};

export default function Gradient({
  radial,
  colorList = [],
  ...rest
}: GradientProps) {
  const Background = radial ? RadialGradient : LinearGradient;
  return (
    <View style={styles.wrapper}>
      <Background colorList={colorList} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    top: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
