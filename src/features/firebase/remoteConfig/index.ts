import RemoteConfig from '@react-native-firebase/remote-config';
export const fetchRemoteConfig = (defaultConfig: any) =>
  RemoteConfig?.()
    .setDefaults(defaultConfig)
    .then(() => RemoteConfig().fetch(0))
    .then(() => RemoteConfig().activate())
    .then(() => RemoteConfig().getAll());
