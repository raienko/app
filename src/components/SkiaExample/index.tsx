import React from 'react';
import Text from '../Text';
import {Canvas, Circle, Group} from '@shopify/react-native-skia';
import {rem} from '~/src/utils';

export type SkiaExampleProps = {};

export default function SkiaExample({}: SkiaExampleProps) {
  const render = () => {
    const size = rem(256);
    const r = size * 0.33;
    const proportions = {width: size, height: size};
    return (
      <Canvas style={proportions}>
        <Group blendMode="multiply">
          <Circle cx={r} cy={r} r={r} color="cyan" />
          <Circle cx={size - r} cy={r} r={r} color="magenta" />
          <Circle cx={size / 2} cy={size - r} r={r} color="yellow" />
        </Group>
      </Canvas>
    );
  };

  try {
    return render();
  } catch (e) {
    return <Text text="skia_error" />;
  }
}
