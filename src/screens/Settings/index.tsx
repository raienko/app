import React from 'react';
import {typography} from '~/src/constants';
import {Screen, Text} from '~/src/components';
import {navigation} from '~/src/features';

export default function Settings(): React.JSX.Element {
  return (
    <Screen>
      <Text style={typography.h1} text="settings.title" />
      <Text
        style={typography.body}
        text="general.back"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}
