import {FirebaseRemoteConfigTypes} from '@react-native-firebase/remote-config';

type Crud<T> = {
  value: T;
  create: () => any;
  read: () => any;
  update: () => any;
  delete: () => any;
};

export interface Firebase {
  fetchRemoteConfig(
    defaultConfig: any,
  ): Promise<FirebaseRemoteConfigTypes.ConfigValues>;
  logEvent(eventName: string, data?: any): Promise<any>;
  useFirestoreCollection(
    path: string,
    callback?: (data: any) => any,
  ): Crud<any>;
  useFirestoreDocument(path: string, callback?: (data: any) => any): Crud<any>;
  useDatabase(path: string, callback?: (data: any) => any): Crud<any>;
}
