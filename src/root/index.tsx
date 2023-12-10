import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {env} from '~/src/constants';

export default function App(): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <Text>{env.appName}</Text>
      <Text>{env.appId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
