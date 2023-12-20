import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import persistConfig from './persistConfig';

import {reducer as system} from '~/src/features/system/slice';
import {reducer as permissions} from '~/src/features/permissions/slice';

const reducers = {
  system,
  permissions,
};

const reducer = combineReducers(reducers);

export default persistReducer(
  {...persistConfig, blacklist: Object.keys(reducers)},
  reducer,
);
