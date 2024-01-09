import React from 'react';
import {notifications} from '~/src/features';

export type InAppNotificationsProps = {};

export default function InAppNotifications({}: InAppNotificationsProps) {
  const data = notifications.useLocalNotifications();

  if (!data?.length) {
    return null;
  }
  return <>{null}</>;
}
