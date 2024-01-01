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

  const create = async (data: any) => {
    if (data?.id) {
      const doc = Firestore.doc(firestore, path, data.id);
      return Firestore.setDoc(doc, data).then(() => data.id);
    }

    const doc = await Firestore.addDoc(collection, data);
    return doc.id;
  };

  const write = async (id: string, changes: object) => {
    const doc = await Firestore.doc(collection, id);
    return Firestore.updateDoc(doc, changes);
  };

  const remove = async (id: string) => {
    const doc = Firestore.doc(collection, id);
    return Firestore.deleteDoc(doc);
  };

  return {
    value,
    create,
    read,
    write,
    remove,
  };
};
