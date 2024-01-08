import React from 'react';
import {Pressable} from 'react-native';
import BottomSheet, {hideBottomSheet, showBottomSheet} from '../BottomSheet';
import * as Picker from 'expo-image-picker';
import Button from '../Button';
import If from '../If';
import * as system from '~/src/features/system';
import {wait, isWeb} from '~/src/utils';

export type Media = {
  uri: string;
  type: string;
  width: number;
  height: number;
  name: string;
};

const getFileName = (file: Picker.ImagePickerAsset) => {
  const path = file?.uri || '';
  const parts = path.split('/');
  const name = parts.pop();
  const timestamp = Date.now();
  const altName = `${timestamp}.${file.mimeType}`;
  return name || altName;
};

export type ImagePickerProps = {
  children?: React.ReactNode;
  onChange?: (media?: Media) => any;
  id?: string;
  mode?: 'camera' | 'gallery';
  options?: Picker.ImagePickerOptions;
};

export default function ImagePicker({
  mode,
  options,
  onChange,
  children,
  id = 'image_picker',
}: ImagePickerProps) {
  const permissions = system.usePermissions();
  const close = async () => {
    hideBottomSheet(id);
    return wait(300);
  };

  const handleFilePicked = async (file?: Picker.ImagePickerAsset) => {
    if (!file) {
      return onChange?.();
    }

    return onChange?.({
      uri: file?.uri,
      width: file?.width,
      height: file?.height,
      name: getFileName(file),
      type: file?.mimeType || 'png',
    });
  };

  const openPicker = async (type: 'camera' | 'gallery') => {
    await close();

    if (type) {
      const permissionGranted = permissions[type] === 'granted';
      if (!permissionGranted) {
        if (type === 'camera') {
          return system.requestCameraPermission();
        } else {
          return system.requestGalleryPermission();
        }
      }
    }

    const picker =
      type === 'camera'
        ? Picker.launchCameraAsync
        : Picker.launchImageLibraryAsync;

    return picker({...options}).then(res => handleFilePicked(res.assets?.[0]));
  };

  const handlePickerPress = () => {
    if (isWeb) {
      return openPicker('gallery');
    }

    if (mode) {
      return openPicker(mode);
    }

    return showBottomSheet(id);
  };

  return (
    <>
      <Pressable onPress={handlePickerPress}>{children}</Pressable>
      <If condition={!mode}>
        <BottomSheet id={id}>
          <Button
            text="image_picker.camera"
            onPress={() => openPicker('camera')}
          />
          <Button
            text="image_picker.gallery"
            onPress={() => openPicker('gallery')}
          />
          <Button text="image_picker.cancel" type="tertiary" onPress={close} />
        </BottomSheet>
      </If>
    </>
  );
}
