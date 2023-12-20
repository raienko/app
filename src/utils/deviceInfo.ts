import DeviceInfo from 'react-native-device-info';
import env from '~/src/constants/env.ts';
import {version} from '~/package.json';
import {isWeb} from './helpers';
export const getAppName = () =>
  isWeb ? env.appName : DeviceInfo.getApplicationName?.();
export const getAppId = () => (isWeb ? env.appId : DeviceInfo.getBundleId?.());
export const getAppVersion = () => {
  if (isWeb) {
    return `${version}(${1})`;
  }

  return `${DeviceInfo.getVersion?.()}(${DeviceInfo.getBuildNumber?.()})`;
};
