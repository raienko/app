import store, {useStoreSelector} from '../store';
import slice, {initialState} from './slice';

export const setRemoteNotifications = (
  notifications: typeof initialState.remote,
) => store.dispatch(slice.actions.setRemoteNotifications(notifications));

export const useRemoteNotifications = () =>
  useStoreSelector(state => state.notifications.remote);
