import {useEffect, useState} from 'react';
import {app} from '../config.web.ts';
// @ts-ignore
import * as Firestore from '@firebase/firestore';
import {parseCollectionSnapshot} from './tools';
const firestore = Firestore.getFirestore(app);

export const useFirestore = (path: string, callback?: (data: any) => any) => {
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
    create: async (doc: any) => !!doc,
    read,
    update: async (id: string, changes: object) => !!changes,
    delete: async (id: string) => !!id,
  };
};
