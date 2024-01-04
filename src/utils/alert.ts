import {Alert} from 'react-native';
import {translate, TranslationKey} from '~/src/features/system/localisation';
import {isWeb} from './helpers';
export default {
  show: (title: TranslationKey, message: TranslationKey) => {
    const titleText = translate(title);
    const messageText = translate(message);

    if (isWeb) {
      const bothAvailable = !!(title && message);
      const text = bothAvailable ? `${titleText}\n${messageText}` : messageText;
      // @ts-ignore
      // eslint-disable-next-line no-alert
      return window.alert(text);
    }

    return Alert.alert(titleText, messageText);
  },
};
