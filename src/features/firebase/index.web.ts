// @ts-ignore
import * as RemoteConfig from '@firebase/remote-config';
// @ts-ignore
import * as Analytics from '@firebase/analytics';
import {app} from './config.web.ts';
import {Firebase} from './types.ts';

const remoteConfig = RemoteConfig.getRemoteConfig(app);
const analytics = Analytics.getAnalytics(app);

export const firebase: Firebase = {
  fetchRemoteConfig: async () => {
    await RemoteConfig.fetchAndActivate(remoteConfig);
    return RemoteConfig.getAll(remoteConfig);
  },
  logEvent: (eventName: string, data: any) =>
    Analytics.logEvent(analytics, eventName, data),
};
