import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import persistConfig from './persistConfig';

import {reducer as system} from '~/src/features/system/slice';

const reducers = {
  system,
};

const reducer = combineReducers(reducers);

export default persistReducer(
  {...persistConfig, blacklist: Object.keys(reducers)},
  reducer,
);
