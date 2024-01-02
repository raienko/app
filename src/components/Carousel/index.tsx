import React from 'react';
import RNCarousel from 'react-native-reanimated-carousel';
import {rem} from '~/src/utils';
import Text from '~/src/components/Text';
import {StyleSheet, View} from 'react-native';
import Button from '~/src/components/Button';
import {sizes} from '~/src/constants';

type CarouselProps = {
  width?: number;
  height?: number;
};

export default function Carousel({
  width = rem(350),
  height = rem(100),
  ...rest
}: CarouselProps) {
  const data = [...new Array(6).keys()];
  const ref = React.useRef<{prev: () => void; next: () => void}>(null);

  const renderSlide = ({index}: any) => (
    <View style={styles.slide}>
      <Text style={{textAlign: 'center'}} value={`SLIDE_${index}`} />
    </View>
  );

  return (
    <>
      <View style={styles.controls}>
        <Button value="⬅️" onPress={() => ref.current?.prev?.()} size="small" />
        <Button value="➡️" onPress={() => ref.current?.next?.()} size="small" />
      </View>
      <RNCarousel
        //@ts-ignore
        ref={ref}
        loop
        autoPlay
        data={data}
        width={width}
        height={height}
        style={styles.wrapper}
        renderItem={renderSlide}
        scrollAnimationDuration={1000}
        {...rest}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: sizes.uiRadius,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
