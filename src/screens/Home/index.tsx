import React from 'react';
import {env} from '~/src/constants';
import {AppInfo, Header, Button, Screen, Icon, Text} from '~/src/components';
import {navigation, firebase, system} from '~/src/features';

export default function Home(): React.JSX.Element {
  const updateRequired = system.useUpdateRequired();
  return (
    <Screen
      header={
        <Header
          title={['raw', {text: env.appName}]}
          subtitle={['raw', {text: env.appId}]}
          right={
            <Button
              type="secondary"
              size="round"
              onPress={() => {
                navigation.navigate('Settings');
                return firebase.logEvent('button_pressed');
              }}>
              <Icon name="cog" />
            </Button>
          }
        />
      }>
      <Button
        text="home.stylesheet"
        onPress={() => navigation.navigate('Stylesheet')}
      />
      <Text value={`Update required: ${updateRequired}`} />
      <AppInfo />
    </Screen>
  );
}
