import React from 'react';
import {
  Text,
  Icon,
  Header,
  Button,
  Screen,
  Calendar,
  LottieAnimation,
  DarkModeSwitcher,
  LanguageSwitcher,
} from '~/src/components';
import {navigation} from '~/src/features';
import animation from '~/assets/lottie/launchAnimation.json';
import {StyleSheet} from 'react-native';
import {sizes} from '~/src/constants';

export default function Stylesheet(): React.JSX.Element {
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
      <Icon name="home" type="FontAwesome" size={sizes.iconLarge} />
      <Icon name="home" type="Feather" size={sizes.iconMedium} />
      <Icon name="home" type="Ionicons" size={sizes.iconSmall} />
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
});
