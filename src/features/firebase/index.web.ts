// @ts-ignore
import * as RemoteConfig from '@firebase/remote-config';
import {app} from './config.web.ts';
import {Firebase} from './types.ts';

const remoteConfig = RemoteConfig.getRemoteConfig(app);

export const firebase: Firebase = {
  fetchRemoteConfig: async () => {
    await RemoteConfig.fetchAndActivate(remoteConfig);
    return RemoteConfig.getAll(remoteConfig);
  },
};
