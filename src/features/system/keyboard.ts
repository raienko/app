import {useEffect} from 'react';
import {Keyboard} from 'react-native';
import {isIOS} from '~/src/utils';
import slice from './slice';
import store, {useStoreSelector} from '../store';

const setKeyboardHeight = (height = 0) =>
  store.dispatch(slice.actions.setKeyboardHeight(height));

export const useKeyboardListener = () => {
  useEffect(() => {
    const showListener = Keyboard.addListener(
      isIOS ? 'keyboardWillShow' : 'keyboardDidShow',
      event => setKeyboardHeight(event.endCoordinates.height),
    );
    const hideListener = Keyboard.addListener(
      isIOS ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);
};

export const useKeyboardHeight = (): number =>
  useStoreSelector(state => state?.system?.keyboardHeight || 0);

export const useKeyboardOpen = (): boolean => {
  const keyboardHeight = useKeyboardHeight();
  return !!keyboardHeight;
};
