import React from 'react';
import RNCarousel from 'react-native-reanimated-carousel';
import {rem} from '~/src/utils';
import Text from '~/src/components/Text';
import {Button, View} from 'react-native';
import {sizes} from '~/src/constants';

type CarouselProps = any;

export default function Carousel(props: CarouselProps) {
  const data = [...new Array(6).keys()];
  const ref = React.useRef<typeof RNCarousel>(null);

  return (
    <>
      <Button title="NEXT" onPress={() => ref.current?.next?.()} />
      <Button title="PREV" onPress={() => ref.current?.prev?.()} />
      <RNCarousel
        ref={ref}
        loop
        autoPlay={true}
        data={data}
        style={{
          borderWidth: 1,
          borderRadius: sizes.uiRadius,
        }}
        width={rem(100)}
        height={rem(100)}
        scrollAnimationDuration={1000}
        renderItem={({index}) => (
          <View
            style={{
              width: rem(100),
              height: rem(100),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{textAlign: 'center'}} value={`SLIDE_${index}`} />
          </View>
        )}
        {...props}
      />
    </>
  );
}
