import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import persistConfig from './persistConfig';

import {reducer as system} from '~/src/features/system/slice';
import {reducer as notifications} from '~/src/features/notifications/slice';

const reducers = {
  system,
  notifications,
};

const reducer = combineReducers(reducers);

export default persistReducer(
  {...persistConfig, blacklist: Object.keys(reducers)},
  reducer,
);
