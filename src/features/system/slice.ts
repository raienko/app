import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {persistSlice} from '~/src/features/store/persistConfig';

export const initialState: {
  darkMode: boolean;
  offline: boolean;
  currentLanguage?: string;
  lastUsedLanguage?: string;
} = {
  darkMode: false,
  offline: false,
  currentLanguage: undefined,
  lastUsedLanguage: undefined,
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
  },
});

export default slice;

export const reducer = persistSlice(slice, {
  blacklist: ['offline', 'currentLanguage'],
});
