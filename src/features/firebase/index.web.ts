// @ts-ignore
import * as RemoteConfig from '@firebase/remote-config';
// @ts-ignore
import * as Analytics from '@firebase/analytics';
// @ts-ignore
import * as Firestore from '@firebase/firestore';
// @ts-ignore
import * as Database from '@firebase/database';

import {app} from './config.web.ts';
import {Firebase} from './types.ts';
import {useEffect, useState} from 'react';
import {parseCollectionSnapshot} from '~/src/features/firebase/tools.ts';

const remoteConfig = RemoteConfig.getRemoteConfig(app);
const analytics = Analytics.getAnalytics(app);
const firestore = Firestore.getFirestore(app);
const database = Database.getDatabase(app);

const fetchRemoteConfig = async () => {
  await RemoteConfig.fetchAndActivate(remoteConfig);
  return RemoteConfig.getAll(remoteConfig);
};

const logEvent = (eventName: string, data: any) =>
  Analytics.logEvent(analytics, eventName, data);

const useFirestore = (path: string, callback?: (data: any) => any) => {
  const collection = Firestore.collection(firestore, path);
  const [value, setValue] = useState<any>();

  const read = async (id?: string) => {
    return Firestore.getDocs(collection).then(
      (snapshot: Firestore.QuerySnapshot) => {
        const docs = parseCollectionSnapshot(snapshot);
        setValue(docs);
        if (id) {
          return docs.find(i => i.id === id);
        }

        return docs;
      },
    );
  };

  useEffect(() => {
    let listener: any;
    read();

    if (callback) {
      listener = Firestore.onSnapshot(
        collection,
        (snapshot: Firestore.QuerySnapshot) => {
          const docs = parseCollectionSnapshot(snapshot);
          callback(docs);
        },
      );
    }

    return () => {
      listener && listener();
    };
  }, []);

  return {
    value,
    create: (doc: any) => {},
    read,
    update: (id: string, changes: object) => {},
    delete: (id: string) => {},
  };
};

const useDatabase = (path: string) => Database.ref(database, path);

export const firebase: Firebase = {
  fetchRemoteConfig,
  useFirestore,
  useDatabase,
  logEvent,
};
