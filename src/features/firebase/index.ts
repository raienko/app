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

const useFirestoreCollection = (
  path: string,
  callback?: (value?: any) => false,
) => {
  const ref = Firestore?.().collection(path);
  const [value, setValue] = useState<any>(undefined);

  const read = async () => {
    return ref?.get().then(snapshot => {
      const docs = parseCollectionSnapshot(snapshot);
      setValue(docs);
      return docs;
    });
  };

  useEffect(() => {
    let listener: any;
    read();

    if (callback) {
      listener = ref?.onSnapshot(snapshot => {
        const docs = parseCollectionSnapshot(snapshot);
        callback(docs);
      });
    }

    return () => {
      listener && listener();
    };
  }, []);

  return {
    value,
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  };
};

const useFirestoreDocument = () => {
  const value = 10;
  return {
    value,
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  };
};

const useDatabase = (path: string, callback?: (d: any) => false) => {
  const value = Database?.().ref(path);
  return {
    value,
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  };
};

export const firebase: Firebase = {
  useFirestoreCollection,
  useFirestoreDocument,
  fetchRemoteConfig,
  useDatabase,
  logEvent,
};
