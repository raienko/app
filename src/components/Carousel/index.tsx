import React from 'react';
import RNCarousel from 'react-native-reanimated-carousel';
import {rem} from '~/src/utils';
import Text from '~/src/components/Text';

type CarouselProps = any;

export default function Carousel(props: CarouselProps) {
  const data = [...new Array(6).keys()];
  return (
    <RNCarousel
      loop
      autoPlay
      data={data}
      width={rem(200)}
      height={rem(200)}
      scrollAnimationDuration={1000}
      renderItem={({index}) => (
        <Text style={{textAlign: 'center'}} value={`SLIDE_${index}`} />
      )}
      {...props}
    />
  );
}
