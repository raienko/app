// @ts-ignore
import {DataSnapshot} from '@firebase/database';

export const parseDatabaseSnapshot = (data?: DataSnapshot) => {
  return data?.val();
};
