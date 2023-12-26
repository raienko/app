import React, {useRef} from 'react';
import {
  Text,
  Icon,
  Input,
  Header,
  Button,
  Screen,
  WebView,
  Calendar,
  Carousel,
  BottomSheet,
  LottieAnimation,
  DarkModeSwitcher,
  LanguageSwitcher,
} from '~/src/components';
import * as Animatable from 'react-native-animatable';
import {navigation} from '~/src/features';
import animation from '~/assets/lottie/launchAnimation.json';
import {StyleSheet} from 'react-native';
import {sizes} from '~/src/constants';
import {copyToClipboard, share} from '~/src/utils';
import {hideBottomSheet, showBottomSheet} from '~/src/components/BottomSheet';

export default function Stylesheet(): React.JSX.Element {
  const animatable = useRef<Animatable.View>(null);
  return (
    <Screen
      style={styles.wrapper}
      overlay={
        <BottomSheet id="test_bottom_sheet">
          <Button
            value="Hide bottom sheet"
            onPress={() => hideBottomSheet('test_bottom_sheet')}
          />
        </BottomSheet>
      }
      header={
        <Header
          left={
            <Button
              text="general.back"
              size="small"
              onPress={() => navigation.goBack()}
            />
          }
          title="stylesheet.title"
          subtitle="stylesheet.subtitle"
          right={
            <>
              <DarkModeSwitcher />
              <LanguageSwitcher />
            </>
          }
        />
      }>
      <Text value="H1 text example" type="h1" />
      <Text value="H2 text example" type="h2" />
      <Text value="H3 text example" type="h3" />
      <Text value="H4 text example" type="h4" />
      <Text value="H5 text example" type="h5" />
      <Text value="body text example" type="body" />
      <Text value="button text example" type="button" />
      <Text value="caption text example" type="caption" />
      <Calendar />
      <Button value="Primary" type="primary" />
      <Button value="Secondary" type="secondary" />
      <Button value="Tertiary" type="tertiary" />
      <Button value="Large" size="large" />
      <Button value="Medium" size="medium" />
      <Button value="Small" size="small" />
      <LottieAnimation style={styles.lottie} source={animation} autoPlay loop />
      <Input value="some input text" label="stylesheet.input" />
      <Input
        label="stylesheet.input"
        error="stylesheet.error"
        placeholder="stylesheet.input"
      />
      <Icon name="home" type="FontAwesome" size={sizes.iconLarge} />
      <Icon name="home" type="Feather" size={sizes.iconMedium} />
      <Icon name="home" type="Ionicons" size={sizes.iconSmall} />
      <WebView uri={'https://www.wikipedia.org/'} style={styles.webview} />
      <Button
        text="general.share"
        onPress={() => share({title: 'Hello', message: 'World'})}
      />
      <Button
        text="general.copy"
        onPress={() => copyToClipboard('Hello World!')}
      />
      <Animatable.View ref={animatable}>
        <Button
          value="Animation example"
          onPress={() => animatable.current?.bounce?.(3000)}
        />
      </Animatable.View>
      <Carousel />
      <Button
        value="Show bottom sheet"
        onPress={() => showBottomSheet('test_bottom_sheet')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    rowGap: sizes.offsetS,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  webview: {
    width: 300,
    height: 300,
    borderWidth: 1,
  },
});
