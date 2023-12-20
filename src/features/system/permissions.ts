import {useEffect} from 'react';
import {AppState} from 'react-native';
import slice from './slice';
import store, {useStoreSelector} from '~/src/features/store';

export type PermissionTypes = 'camera' | 'location' | 'notifications';

const checkPermissions = () => {
  if (AppState.currentState !== 'active') {
    return;
  }
};

export const setPermission = (type: PermissionTypes, permission: string) =>
  store.dispatch(
    slice.actions.setPermission({
      permission,
      type,
    }),
  );

export const usePermission = (type: any) =>
  useStoreSelector(state => state.system.permissions[type]);

export const usePermissionsCheck = () => {
  useEffect(() => {
    const listener = AppState.addEventListener('change', checkPermissions);
    return () => {
      listener.remove();
    };
  }, []);
};
