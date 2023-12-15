import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {persistSlice} from '~/src/features/store/persistConfig';

export const initialState: {
  darkMode: boolean;
  offline: boolean;
  currentLanguage?: string;
  lastUsedLanguage?: string;
  keyboardHeight: number;
  remoteConfig: object;
} = {
  darkMode: false,
  offline: false,
  currentLanguage: undefined,
  lastUsedLanguage: undefined,
  keyboardHeight: 0,
  remoteConfig: {},
};

const slice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setDarkMode(state, action: PayloadAction<typeof initialState.darkMode>) {
      state.darkMode = action.payload;
    },
    setCurrentLanguage(
      state,
      action: PayloadAction<typeof initialState.currentLanguage>,
    ) {
      state.lastUsedLanguage = action.payload;
      state.currentLanguage = action.payload;
    },
    setKeyboardHeight: (
      state,
      action: PayloadAction<typeof initialState.keyboardHeight>,
    ) => {
      state.keyboardHeight = action.payload;
    },
    setRemoteConfig: (
      state,
      action: PayloadAction<typeof initialState.remoteConfig>,
    ) => {
      state.remoteConfig = action.payload;
    },
  },
});

export default slice;

export const reducer = persistSlice(slice, {
  blacklist: ['offline', 'currentLanguage'],
});
