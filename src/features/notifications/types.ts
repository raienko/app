export type NotificationType = 'push' | 'toast' | 'popup';

export type Notification = {
  data?: any;
  id?: string;
  date: string;
  title: string;
  message: string;
  type: NotificationType;
};
