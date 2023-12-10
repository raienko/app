import React from 'react';
import {env, typography} from '~/src/constants';
import {Screen, Text} from '~/src/components';
import {navigation, system} from '~/src/features';

export default function Home(): React.JSX.Element {
  const darkMode = system.useDarkMode();
  return (
    <Screen>
      <Text
        style={typography.h1}
        value={env.appName}
        onPress={() => system.setDarkMode(!darkMode)}
      />
      <Text
        style={typography.body}
        value={env.appId}
        onPress={() => navigation.navigate('Settings')}
      />
    </Screen>
  );
}
