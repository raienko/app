import React from 'react';
import Router from '~/src/features/navigation/Router';
import StoreProvider from '~/src/features/store/StoreProvider';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {StyleSheet} from 'react-native';
import {LaunchScreen} from '~/src/screens';

export default function App(): React.JSX.Element {
  return (
    <>
      <GestureHandlerRootView style={styles.wrapper}>
        <StoreProvider>
          <BottomSheetModalProvider>
            <Router />
          </BottomSheetModalProvider>
        </StoreProvider>
      </GestureHandlerRootView>
      {/* @ts-ignore */}
      <LaunchScreen />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
