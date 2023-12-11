import React from 'react';
import {env} from '~/src/constants';
import {
  Text,
  Screen,
  Header,
  DarkModeSwitcher,
  LanguageSwitcher,
  Calendar,
  Button,
} from '~/src/components';
import {navigation} from '~/src/features';

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
      <Text text="home.welcome" type="h1" />
      <Calendar />
      <Button
        text="home.settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </Screen>
  );
}
