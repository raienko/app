import {useEffect} from 'react';
import {AppState, Linking} from 'react-native';
import slice from './slice';
import store, {useStoreSelector} from '~/src/features/store';
import Permissions from 'react-native-permissions';
import {isIOS, isWeb} from '~/src/utils';

export type PermissionTypes = 'camera' | 'notifications';
export type PermissionStatus = 'granted' | 'blocked' | 'not_requested';

const cameraPermission = isIOS
  ? Permissions?.PERMISSIONS.IOS.CAMERA
  : Permissions?.PERMISSIONS.ANDROID.CAMERA;

const checkPermissions = () => {
  if (AppState.currentState !== 'active') {
    return;
  }

  checkCameraPermission();
  checkNotificationsPermission();
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

export const checkCameraPermission = async (): Promise<PermissionStatus> => {
  let permission: PermissionStatus;

  if (isWeb) {
    // @ts-ignore
    permission = await navigator.permissions
      .query({name: 'camera'})
      .then((result: any) => formatPermissionStatus(result.state));
  } else {
    permission = await Permissions.check(cameraPermission).then(
      formatPermissionStatus,
    );
  }

  setPermission('camera', permission);
  return permission;
};

export const requestCameraPermission = async () => {
  const permission = await checkCameraPermission();

  if (permission === 'blocked') {
    return openAppSettings();
  }

  if (isWeb) {
    // @ts-ignore
    return navigator.permissions
      .request({name: 'camera'})
      .then((result: any) => formatPermissionStatus(result.state));
  }

  return Permissions.request(cameraPermission).then(formatPermissionStatus);
};

export const checkNotificationsPermission =
  async (): Promise<PermissionStatus> => {
    let permission;

    if (isWeb) {
      // @ts-ignore
      permission = await navigator.permissions
        .query({name: 'notifications'})
        .then((result: any) => formatPermissionStatus(result.state));
    } else {
      permission = await Permissions.checkNotifications().then(response =>
        formatPermissionStatus(response.status),
      );
    }

    setPermission('notifications', permission);
    return permission;
  };

export const requestNotificationsPermission = async (): Promise<any> => {
  const permission = await checkNotificationsPermission();
  if (permission === 'blocked') {
    return openAppSettings();
  }

  if (isWeb) {
    // @ts-ignore
    return navigator.permissions
      .request({name: 'notifications'})
      .then((result: any) => formatPermissionStatus(result.state));
  }

  return Permissions.requestNotifications(['alert', 'badge', 'sound']);
};

const formatPermissionStatus = (status: any): PermissionStatus => {
  const text = `${status}`.toLowerCase();

  if (!status) {
    return 'not_requested';
  }

  if (text === 'granted' || 'limited') {
    return 'granted';
  }

  return 'blocked';
};

export const openAppSettings = () => Linking.openSettings();
