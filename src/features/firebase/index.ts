import RemoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

export const fetchRemoteConfig = (
  defaultConfig: FirebaseRemoteConfigTypes.ConfigDefaults,
) =>
  RemoteConfig()
    .setDefaults(defaultConfig)
    .then(() => RemoteConfig().fetch(0))
    .then(() => RemoteConfig().activate())
    .then(() => RemoteConfig().getAll());
