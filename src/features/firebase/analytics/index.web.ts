import {app} from '../config.web.ts';
// @ts-ignore
import * as Analytics from '@firebase/analytics';
const analytics = Analytics.getAnalytics(app);

export const logEvent = (eventName: string, data: any) =>
  Analytics.logEvent(analytics, eventName, data);
