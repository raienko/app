import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {persistSlice} from '~/src/features/store/persistConfig';

export const initialState: {
  remote: any[];
  local: any[];
  read: string[];
} = {
  remote: [],
  local: [],
  read: [],
};

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setRemoteNotifications(
      state,
      action: PayloadAction<typeof initialState.remote>,
    ) {
      state.remote = action.payload;
    },
    setLocalNotifications(
      state,
      action: PayloadAction<typeof initialState.local>,
    ) {
      state.local = action.payload;
    },
    setReadNotifications(
      state,
      action: PayloadAction<typeof initialState.read>,
    ) {
      state.read = action.payload;
    },
  },
});

export default slice;

export const reducer = persistSlice(slice, {
  blacklist: [],
});
