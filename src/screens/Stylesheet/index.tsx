import React, {useRef} from 'react';
import {
  Text,
  Icon,
  Input,
  Header,
  Button,
  Screen,
  Section,
  WebView,
  Calendar,
  Carousel,
  BottomSheet,
  DateTimePicker,
  LottieAnimation,
  DarkModeSwitcher,
  LanguageSwitcher,
} from '~/src/components';
import * as Animatable from 'react-native-animatable';
import {navigation} from '~/src/features';
import animation from '~/assets/lottie/launchAnimation.json';
import {StyleSheet} from 'react-native';
import {sizes} from '~/src/constants';
import {copyToClipboard, rem, share} from '~/src/utils';
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
      <Section
        title="stylesheet.typography_title"
        description="stylesheet.typography_description">
        <Text value="H1 text example" type="h1" />
        <Text value="H2 text example" type="h2" />
        <Text value="H3 text example" type="h3" />
        <Text value="H4 text example" type="h4" />
        <Text value="H5 text example" type="h5" />
        <Text value="body text example" type="body" />
        <Text value="button text example" type="button" />
        <Text value="caption text example" type="caption" />
      </Section>
      <Section
        title="stylesheet.calendar_title"
        description="stylesheet.calendar_description">
        <Calendar />
      </Section>
      <Section
        title="stylesheet.button_title"
        description="stylesheet.button_description">
        <Button value="Primary" type="primary" />
        <Button value="Secondary" type="secondary" />
        <Button value="Tertiary" type="tertiary" />
        <Button value="Large" size="large" />
        <Button value="Medium" size="medium" />
        <Button value="Small" size="small" />
      </Section>
      <Section
        title="stylesheet.animations_title"
        description="stylesheet.animations_description">
        <LottieAnimation
          style={styles.lottie}
          source={animation}
          autoPlay
          loop
        />
        <Animatable.View ref={animatable}>
          <Button
            value="Press for demo"
            onPress={() => animatable.current?.bounce?.(3000)}
          />
        </Animatable.View>
      </Section>
      <Section
        title="stylesheet.inputs_title"
        description="stylesheet.inputs_description">
        <Input value="some input text" label="stylesheet.input" />
        <Input
          label="stylesheet.input"
          error="stylesheet.error"
          placeholder="stylesheet.input"
        />
      </Section>
      <Section
        title="stylesheet.icons_title"
        description="stylesheet.icons_description">
        <Icon name="home" type="FontAwesome" size={sizes.iconLarge} />
        <Icon name="home" type="Feather" size={sizes.iconMedium} />
        <Icon name="home" type="Ionicons" size={sizes.iconSmall} />
      </Section>
      <Section
        title="stylesheet.webview_title"
        description="stylesheet.webview_description">
        <WebView uri={'https://www.wikipedia.org/'} style={styles.webview} />
      </Section>
      <Section
        title="stylesheet.share_title"
        description="stylesheet.share_description">
        <Button
          text="general.share"
          onPress={() => share({title: 'Hello', message: 'World'})}
        />
        <Button
          text="general.copy"
          onPress={() => copyToClipboard('Hello World!')}
        />
      </Section>
      <Section
        title="stylesheet.carousel_title"
        description="stylesheet.carousel_description">
        <Carousel />
      </Section>
      <Section
        title="stylesheet.bottom_sheet_title"
        description="stylesheet.bottom_sheet_description">
        <Button
          value="Show bottom sheet"
          onPress={() => showBottomSheet('test_bottom_sheet')}
        />
      </Section>
      <Section
        title="stylesheet.datetime_picker_title"
        description="stylesheet.datetime_picker_description">
        <DateTimePicker />
        <DateTimePicker id="date_time_picker">
          <Button value="modal" />
        </DateTimePicker>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    rowGap: sizes.offsetS,
  },
  lottie: {
    width: rem(150),
    height: rem(150),
  },
  webview: {
    minHeight: rem(150),
  },
});
