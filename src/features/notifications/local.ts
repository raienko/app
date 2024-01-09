import store, {useStoreSelector} from '../store';
import slice, {initialState} from './slice';

export const setLocalNotifications = (
  notifications: typeof initialState.local,
) => store.dispatch(slice.actions.setLocalNotifications(notifications));

export const useLocalNotifications = () =>
  useStoreSelector(state => state.notifications.local);
