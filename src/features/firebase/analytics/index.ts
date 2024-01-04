import Analytics from '@react-native-firebase/analytics';

export const logEvent = (eventName: string, data?: any) =>
  Analytics().logEvent(eventName, data);
