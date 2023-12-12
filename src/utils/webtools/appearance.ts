import {useEffect} from 'react';
import {Dimensions} from 'react-native';

export const useReloadOnWindowChange = () => {
  useEffect(() => {
    const listener = Dimensions.addEventListener('change', () => {
      // @ts-ignore
      location.reload(true);
    });
    return () => {
      listener.remove();
    };
  }, []);
};
