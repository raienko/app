import RemoteConfig from '@react-native-firebase/remote-config';
import {Firebase} from './types.ts';

export const firebase: Firebase = {
  fetchRemoteConfig: (defaultConfig: any) =>
    RemoteConfig()
      .setDefaults(defaultConfig)
      .then(() => RemoteConfig().fetch(0))
      .then(() => RemoteConfig().activate())
      .then(() => RemoteConfig().getAll()),
};
