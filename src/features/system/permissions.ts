import {useEffect} from 'react';
import {AppState, Linking} from 'react-native';
import slice from './slice';
import store, {useStoreSelector} from '~/src/features/store';
import Permissions from 'react-native-permissions';
import {isIOS, isWeb} from '~/src/utils';

export type PermissionTypes = 'camera' | 'notifications' | 'gallery';
export type PermissionStatus = 'granted' | 'blocked' | 'not_requested';

const cameraPermission = isIOS
  ? Permissions?.PERMISSIONS.IOS.CAMERA
  : Permissions?.PERMISSIONS.ANDROID.CAMERA;

const checkPermissions = () => {
  if (AppState.currentState !== 'active') {
    return;
  }

  checkCameraPermission();
  checkGalleryPermission();
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

export const usePermissions = () =>
  useStoreSelector(state => state.system.permissions);

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

  if (permission === 'granted') {
    return true;
  }

  if (isWeb) {
    // @ts-ignore
    return navigator.mediaDevices
      .getUserMedia({video: true})
      .then(checkCameraPermission);
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

  if (permission === 'granted') {
    return true;
  }

  if (isWeb) {
    // @ts-ignore
    return Notification.requestPermission().then(checkNotificationsPermission);
  }

  return Permissions.requestNotifications(['alert', 'badge', 'sound']);
};

const formatPermissionStatus = (status: any): PermissionStatus => {
  const text = `${status}`.toLowerCase();

  if (!status || status === 'prompt') {
    return 'not_requested';
  }

  if (text === 'granted' || 'limited') {
    return 'granted';
  }

  return 'blocked';
};

export const openAppSettings = () => Linking.openSettings();

const galleryPermissions = isIOS
  ? [Permissions?.PERMISSIONS?.IOS?.PHOTO_LIBRARY]
  : [
      Permissions?.PERMISSIONS?.ANDROID?.READ_MEDIA_IMAGES,
      Permissions?.PERMISSIONS?.ANDROID?.WRITE_EXTERNAL_STORAGE,
      Permissions?.PERMISSIONS?.ANDROID?.READ_EXTERNAL_STORAGE,
    ];

export const checkGalleryPermission = async () => {
  let permission: PermissionStatus;

  if (isWeb) {
    permission = 'granted';
  } else {
    permission = await Permissions.checkMultiple(galleryPermissions).then(
      formatPermissionStatus,
    );
  }

  setPermission('gallery', permission);
  return permission;
};

export const requestGalleryPermission = async () => {
  const permission = await checkGalleryPermission();
  if (permission === 'blocked') {
    return openAppSettings();
  }

  if (permission === 'granted') {
    return true;
  }

  return Permissions.requestMultiple(galleryPermissions);
};
