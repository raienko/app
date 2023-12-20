import React from 'react';
import {env} from '~/src/constants';
import {
  AppInfo,
  Header,
  Button,
  Screen,
  DarkModeSwitcher,
  LanguageSwitcher,
} from '~/src/components';
import {navigation, firebase} from '~/src/features';

export default function Home(): React.JSX.Element {
  return (
    <Screen
      header={
        <Header
          left={<DarkModeSwitcher />}
          title={['raw', {text: env.appName}]}
          subtitle={['raw', {text: env.appId}]}
          right={<LanguageSwitcher />}
        />
      }>
      <Button
        text="home.settings"
        onPress={() => {
          navigation.navigate('Settings');
          return firebase.logEvent('button_pressed');
        }}
      />
      <Button
        text="home.stylesheet"
        onPress={() => navigation.navigate('Stylesheet')}
      />
      <AppInfo />
    </Screen>
  );
}
