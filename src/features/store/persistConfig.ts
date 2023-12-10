import storage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';
import {Slice} from '@reduxjs/toolkit';
import stateReconciler from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {PersistConfig} from 'redux-persist/es/types';

const persistConfig: PersistConfig<any> = {
  storage,
  key: 'root',
  stateReconciler,
};

export default persistConfig;

export const persistSlice = (
  slice: Slice,
  config?: Partial<PersistConfig<any>>,
) =>
  persistReducer(
    {
      ...persistConfig,
      key: slice.name,
      ...config,
    },
    slice.reducer,
  );
