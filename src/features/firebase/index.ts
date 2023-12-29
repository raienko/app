import RemoteConfig from '@react-native-firebase/remote-config';
import Analytics from '@react-native-firebase/analytics';
import Firestore from '@react-native-firebase/firestore';
import Database from '@react-native-firebase/database';

import {Firebase} from './types.ts';
import {useEffect, useState} from 'react';
import {parseCollectionSnapshot} from '~/src/features/firebase/tools';

const fetchRemoteConfig = (defaultConfig: any) =>
  RemoteConfig?.()
    .setDefaults(defaultConfig)
    .then(() => RemoteConfig().fetch(0))
    .then(() => RemoteConfig().activate())
    .then(() => RemoteConfig().getAll());

const logEvent = (eventName: string, data: any) =>
  Analytics().logEvent(eventName, data);

const useFirestore = (path: string, callback?: (value?: any) => void) => {
  const ref = Firestore?.().collection(path);
  const [value, setValue] = useState<any>(undefined);

  const read = async (id?: string) => {
    return ref?.get().then(snapshot => {
      const docs = parseCollectionSnapshot(snapshot);
      setValue(docs);
      if (id) {
        return docs.find(i => i.id === id);
      }
      return docs;
    });
  };

  useEffect(() => {
    let listener: any;
    read();

    if (callback) {
      listener = ref?.onSnapshot(snapshot => {
        const docs = parseCollectionSnapshot(snapshot);
        callback?.(docs);
      });
    }

    return () => {
      listener && listener();
    };
  }, []);

  return {
    value,
    create: (document: any) => false,
    read: (id?: string) => false,
    update: (id: string, changes: any) => false,
    delete: id => false,
  };
};

const useDatabase = (path: string, callback?: (d: any) => false) => {
  const value = Database?.().ref(path);
  return {
    value,
    create: async () => false,
    read: async () => false,
    update: async () => false,
    delete: async () => false,
  };
};

export const firebase: Firebase = {
  fetchRemoteConfig,
  useFirestore,
  useDatabase,
  logEvent,
};
