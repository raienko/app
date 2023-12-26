import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import {isWeb} from './helpers';
import alert from './alert';

interface Data {
  url?: string;
  message?: string;
  title?: string;
}

export function share(data: Data) {
  if (isWeb) {
    // @ts-ignore
    const sharable = window.navigator.canShare?.(data);
    if (!sharable) {
      return alert.show('share.web_error_title', 'share.web_error_message');
    }
    // @ts-ignore
    return window.navigator.share?.({
      url: data?.url,
      text: data?.message,
      title: data?.title,
    });
  }

  return Share.open(data);
}

export function copyToClipboard(data: string) {
  if (isWeb) {
    // @ts-ignore
    return navigator.clipboard.writeText(data);
  }
  return Clipboard.setString(data);
}
