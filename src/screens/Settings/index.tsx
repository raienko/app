import React from 'react';
import {typography} from '~/src/constants';
import {Screen, Text} from '~/src/components';
import {navigation} from '~/src/features';

export default function Settings(): React.JSX.Element {
  return (
    <Screen>
      <Text style={typography.h1} value="Settings" />
      <Text
        style={typography.body}
        value="Back"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}
