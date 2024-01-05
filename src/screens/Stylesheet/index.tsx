import React, {useRef} from 'react';
import {
  Map,
  Text,
  Icon,
  Input,
  Popup,
  Header,
  Button,
  Screen,
  Section,
  WebView,
  Calendar,
  Carousel,
  ProgressBar,
  BottomSheet,
  DateTimePicker,
  LottieAnimation,
  DarkModeSwitcher,
  LanguageSwitcher,
} from '~/src/components';
import * as Animatable from 'react-native-animatable';
import {navigation, system} from '~/src/features';
import animation from '~/assets/lottie/launchAnimation.json';
import {StyleSheet} from 'react-native';
import {sizes} from '~/src/constants';
import {copyToClipboard, share} from '~/src/utils';
import {hideBottomSheet, showBottomSheet} from '~/src/components/BottomSheet';
import {hidePopup, showPopup} from '~/src/components/Popup';

export default function Stylesheet(): React.JSX.Element {
  const animatable = useRef<Animatable.View>(null);
  const permissions = system.usePermissions();
  return (
    <Screen
      style={styles.wrapper}
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
        <LottieAnimation source={animation} autoPlay loop />
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
        <WebView uri={'https://www.wikipedia.org/'} />
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
        <BottomSheet id="test_bottom_sheet">
          <Button
            value="Hide bottom sheet"
            onPress={() => hideBottomSheet('test_bottom_sheet')}
          />
        </BottomSheet>
      </Section>
      <Section
        title="stylesheet.popup_title"
        description="stylesheet.popup_description">
        <Button value="Show popup" onPress={() => showPopup('test_popup')} />
        <Popup
          id="test_popup"
          title="stylesheet.popup_title"
          subtitle="stylesheet.popup_description"
          onSubmit={() => hidePopup('test_popup')}
          onCancel={() => hidePopup('test_popup')}
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
      <ProgressBar progress={10} />
      <Map />
      <Button
        value={`Camera permission:${permissions.camera}`}
        onPress={() => system.requestCameraPermission()}
      />
      <Button
        value={`Notifications permission:${permissions.notifications}`}
        onPress={() => system.requestNotificationsPermission()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    rowGap: sizes.offsetS,
  },
});
