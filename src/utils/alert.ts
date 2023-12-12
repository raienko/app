import {Alert} from 'react-native';
import {translate, TranslationKey} from '~/src/features/system/localisation';
import {isWeb} from './helpers';
export default {
  show: (title: TranslationKey, message: TranslationKey) => {
    const titleText = translate(title);
    const messageText = translate(message);

    if (isWeb) {
      // @ts-ignore
      return window.alert(messageText);
    }

    return Alert.alert(titleText, messageText);
  },
};
