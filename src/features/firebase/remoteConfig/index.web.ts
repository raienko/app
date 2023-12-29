import {app} from '../config.web.ts';
// @ts-ignore
import * as RemoteConfig from '@firebase/remote-config';
const remoteConfig = RemoteConfig.getRemoteConfig(app);
export const fetchRemoteConfig = async () => {
  await RemoteConfig.fetchAndActivate(remoteConfig);
  return RemoteConfig.getAll(remoteConfig);
};
