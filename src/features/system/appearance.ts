import store, {useStoreSelector} from '~/src/features/store';
import slice, {initialState} from './slice';

export const setDarkMode = (value: typeof initialState.darkMode) =>
  store.dispatch(slice.actions.setDarkMode(value));
export const useDarkMode = (): typeof initialState.darkMode =>
  useStoreSelector(state => state.system.darkMode);
