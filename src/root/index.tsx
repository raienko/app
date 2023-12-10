import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {env, typography} from '~/src/constants';

export default function App(): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <Text style={typography.h1}>{env.appName}</Text>
      <Text style={typography.body}>{env.appId}</Text>
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
