import Database from '@react-native-firebase/database';
import {useEffect, useState} from 'react';
import {parseDatabaseSnapshot} from './tools';

export const useDatabase = (path: string, callback?: (data?: any) => void) => {
  const ref = Database().ref(path);
  const [value, setValue] = useState<any>();

  useEffect(() => {
    let listener: any;

    if (callback) {
      listener = ref.on?.('value', snapshot => {
        const data = parseDatabaseSnapshot(snapshot);
        callback(data);
        setValue(data);
      });
    }

    return () => {
      listener && listener();
    };
  }, []);

  const write = async (key: string, data: any) => ref.update({[key]: data});

  const read = async (key?: string) =>
    ref.once('value', snapshot => {
      const data = parseDatabaseSnapshot(snapshot);
      return key ? data?.[key] : data;
    });

  return {
    value,
    read,
    write,
    delete: async (key: string) => write(key, null),
  };
};
