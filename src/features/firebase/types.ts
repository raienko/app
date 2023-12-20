import {FirebaseRemoteConfigTypes} from '@react-native-firebase/remote-config';

export interface Firebase {
  fetchRemoteConfig(
    defaultConfig: any,
  ): Promise<FirebaseRemoteConfigTypes.ConfigValues>;
  logEvent(eventName: string, data?: any): Promise<any>;
}
