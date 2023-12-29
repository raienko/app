// @ts-ignore
import * as Database from '@firebase/database';
import {app} from '../config.web.ts';
import {useEffect, useState} from 'react';
import {parseDatabaseSnapshot} from './tools';
import {DataSnapshot} from '@firebase/database-types';
const database = Database.getDatabase(app);

export const useDatabase = (path: string, callback?: (value?: any) => any) => {
  const ref = Database.ref(database, path);
  const [value, setValue] = useState();

  useEffect(() => {
    let listener: any;

    if (callback) {
      listener = Database.onValue(ref, (snapshot: DataSnapshot) => {
        const data = parseDatabaseSnapshot(snapshot);
        callback(data);
        setValue(data);
      });
    }

    return () => {
      listener && listener();
    };
  }, []);

  return {
    value,
    create: async () => false,
    read: async () => false,
    update: async () => false,
    delete: async () => false,
  };
};
