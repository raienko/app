import {} from './local';
import {} from './remote';
import {Notification} from './types';

export const service = {
  show: (notification: Notification) => {
    const id = notification.id || Date.now();
    return id;
  },
  hide: (id: string) => {
    return !!id;
  },
};
