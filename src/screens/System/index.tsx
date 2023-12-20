import React from 'react';
import {StyleSheet, View} from 'react-native';
import {system} from '~/src/features';
import {StatusBar} from '~/src/components';
import {useReloadOnWindowChange} from '~/src/utils';

export default function System(): React.JSX.Element {
  system.useLocalisation();
  system.useKeyboardListener();
  system.useRemoteConfigSetup();
  system.usePermissionsCheck();
  useReloadOnWindowChange();

  return (
    <View style={styles.wrapper}>
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
});
