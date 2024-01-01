import React from 'react';
import {StyleSheet, View, Button} from 'react-native';
import {system, firebase} from '~/src/features';
import {StatusBar} from '~/src/components';
import {useReloadOnWindowChange, logger} from '~/src/utils';

export default function System(): React.JSX.Element {
  system.useLocalisation();
  system.useKeyboardListener();
  system.useRemoteConfigSetup();
  system.usePermissionsCheck();
  useReloadOnWindowChange();

  const firestore = firebase.useFirestore('test', (data: any) =>
    logger.info('Firestore:', data),
  );

  const database = firebase.useDatabase('test', (data: any) =>
    logger.info('FireDatabase:', data),
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar />
      <Button
        title="Firestore write 1"
        onPress={() => firestore.write('3g3T0XlesUUcp1PRPD0w', {test: 1})}
      />
      <Button
        title="Firestore write 2"
        onPress={() => firestore.write('3g3T0XlesUUcp1PRPD0w', {test: 2})}
      />
      <Button
        title="Firestore create X"
        onPress={() => firestore.create({id: 'x', test: 2})}
      />
      <Button
        title="Firestore remove X"
        onPress={() => firestore.remove('x')}
      />
      <Button
        title="Database write 1"
        onPress={() => database.write('test', 1)}
      />
      <Button
        title="Database write 2"
        onPress={() => database.write('test', 2)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    // pointerEvents: 'box-none',
    backgroundColor: 'white',
    paddingTop: 100,
  },
});
