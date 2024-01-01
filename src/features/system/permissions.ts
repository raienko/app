import {useEffect} from 'react';
import {AppState} from 'react-native';
import slice from './slice';
import store, {useStoreSelector} from '~/src/features/store';
import Permissions, {Permission} from 'react-native-permissions';
import {isIOS, isWeb} from '~/src/utils';

export type PermissionTypes = 'camera' | 'location' | 'notifications';

const permissions: {[key in PermissionTypes]: Permission} = {
  camera: isIOS
    ? Permissions?.PERMISSIONS.IOS.CAMERA
    : Permissions?.PERMISSIONS.ANDROID.CAMERA,
  location: Permissions?.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  notifications: 'notifications',
};

const checkPermissions = () => {
  if (AppState.currentState !== 'active') {
    return;
  }
  checkCameraPermission();
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
    checkPermissions();
    return () => {
      listener.remove();
    };
  }, []);
};

const checkPermission = (permission: any) => {
  if (isWeb) {
    // @ts-ignore
    return navigator.permissions
      .query({name: permission})
      .then(result => result.state);
  }

  return Permissions.check(permission);
};

export const checkCameraPermission = async () => {
  console.log('Permissions check...');
  if (isWeb) {
    // @ts-ignore
    return navigator.permissions
      .query({name: 'camera'})
      .then((result: any) => result.state)
      .then((perm: any) => console.log('Web Camera: ', perm));
  }
  return Permissions.check(permissions.camera).then(permission =>
    console.log('CAMERA: ', permission),
  );
};
