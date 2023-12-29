import {FirebaseRemoteConfigTypes} from '@react-native-firebase/remote-config';

type Crud<T> = {
  value: T;
  create: (doc: any) => Promise<any>;
  read: (id?: string) => Promise<any>;
  update: (id: string, changes?: object) => Promise<any>;
  delete: (id: string) => any;
};

export interface Firebase {
  fetchRemoteConfig(
    defaultConfig: any,
  ): Promise<FirebaseRemoteConfigTypes.ConfigValues>;
  logEvent(eventName: string, data?: any): Promise<any>;
  useFirestore(path: string, callback?: (data: any) => any): Crud<any>;
  useDatabase(path: string, callback?: (data: any) => any): Crud<any>;
}
