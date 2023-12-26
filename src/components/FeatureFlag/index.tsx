import React from 'react';
import {system} from '~/src/features';

type Props = {
  children?: React.ReactNode;
  name?: string;
  condition?: any;
};

export default function FeatureFlag({
  children,
  condition = true,
  name = '',
}: Props) {
  const value = system.useRemoteConfigValue(name);

  if (!name || condition !== value || !children) {
    return null;
  }

  return <>{children}</>;
}
