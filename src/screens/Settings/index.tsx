import React from 'react';
import {Screen, Header, Button} from '~/src/components';
import {navigation} from '~/src/features';

export default function Settings(): React.JSX.Element {
  return (
    <Screen header={<Header title="settings.title" />}>
      <Button text="general.back" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
