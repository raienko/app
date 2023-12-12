import {NativeModules, DevSettings} from 'react-native';
import storage from '@react-native-async-storage/async-storage';
import {isJest, isWeb} from './helpers';

const storageKey = '@RNDS/isDebuggingRemotely';
const enableRemoteDebugger = async () => {
  if (isJest) {
    return;
  }

  const message = {
    stop: 'Stop Remote Debugger',
    debug: 'Debug JS Remotely',
  };

  const isDebuggingRemotelyString = await storage.getItem?.(storageKey);
  let isDebuggingRemotely = isDebuggingRemotelyString === 'true';
  DevSettings?.addMenuItem?.(
    isDebuggingRemotely ? message.stop : message.debug,
    async () => {
      isDebuggingRemotely = !isDebuggingRemotely;

      await storage.setItem(storageKey, JSON.stringify(isDebuggingRemotely));
      NativeModules.DevSettings.setIsDebuggingRemotely(isDebuggingRemotely);
    },
  );
};

if (__DEV__ && !isWeb) {
  setTimeout(enableRemoteDebugger, 100);
}
