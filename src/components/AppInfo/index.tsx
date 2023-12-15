import React from 'react';
import {getAppVersion} from '~/src/utils';
import Text from '../Text';

type Props = {style?: any};
export default function AppInfo({style}: Props) {
  const appVersion = getAppVersion();
  return <Text style={style} value={`${appVersion}`} />;
}
