import {useEffect, useState} from 'react';
import Firestore from '@react-native-firebase/firestore';
import {parseCollectionSnapshot} from './tools';

export const useFirestore = (
  path: string,
  callback?: (value?: any) => void,
) => {
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
    create: async (document: any) => !!document,
    read,
    update: async (id: string, changes: any) => !!changes,
    delete: async (id: string) => !!id,
  };
};
