import {configureStore} from '@reduxjs/toolkit';
import {createLogger} from 'redux-logger';
import reducer from './reducer';
import {TypedUseSelectorHook, useSelector} from 'react-redux';

const devMode = true;
const isEmulator = true;

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({serializableCheck: false});
    if (devMode || isEmulator) {
      const logger = createLogger({collapsed: true});
      // @ts-ignore
      middlewares.push(logger);
    }
    return middlewares;
  },
  devTools: devMode,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;

export const resetStores = () => store.dispatch({type: 'RESET_STORES'});

export const useStoreSelector: TypedUseSelectorHook<RootState> = useSelector;
