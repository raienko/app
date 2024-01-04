import React from 'react';
import {Screen, Header, Button, Icon} from '~/src/components';
import {navigation} from '~/src/features';

export default function Settings(): React.JSX.Element {
  return (
    <Screen
      header={
        <Header
          left={
            <Button
              size="round"
              type="secondary"
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          }
          title="settings.title"
        />
      }
    />
  );
}
