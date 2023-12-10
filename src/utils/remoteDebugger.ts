import {NativeModules, DevSettings} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isWeb} from './helpers';

const storageKey = '@RNDS/isDebuggingRemotely';
const enableRemoteDebugger = async () => {
  const message = {
    stop: 'Stop Remote Debugger',
    debug: 'Debug JS Remotely',
  };

  const isDebuggingRemotelyString = await AsyncStorage.getItem(storageKey);
  let isDebuggingRemotely = isDebuggingRemotelyString === 'true';
  DevSettings?.addMenuItem?.(
    isDebuggingRemotely ? message.stop : message.debug,
    async () => {
      isDebuggingRemotely = !isDebuggingRemotely;

      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(isDebuggingRemotely),
      );
      NativeModules.DevSettings.setIsDebuggingRemotely(isDebuggingRemotely);
    },
  );
};

if (__DEV__ && !isWeb) {
  setTimeout(enableRemoteDebugger, 100);
}
