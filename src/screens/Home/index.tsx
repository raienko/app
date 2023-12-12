import React from 'react';
import {env} from '~/src/constants';
import {
  Text,
  Header,
  Button,
  Screen,
  Calendar,
  DarkModeSwitcher,
  LanguageSwitcher,
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
      <Button
        text="home.settings"
        onPress={() => navigation.navigate('Settings')}
      />
      <Button
        text="home.stylesheet"
        onPress={() => navigation.navigate('Stylesheet')}
      />
    </Screen>
  );
}
