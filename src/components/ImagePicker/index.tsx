import React from 'react';
import {Pressable} from 'react-native';
import BottomSheet, {hideBottomSheet, showBottomSheet} from '../BottomSheet';
import CropPicker, {Image, Options} from 'react-native-image-crop-picker';
import Button from '../Button';
import If from '../If';
import {system} from '~/src/features';

export type Media = {
  uri: string;
  type: string;
  width: number;
  height: number;
  name: string;
};

const getFileName = (file: Image) => {
  const path = file?.path || '';
  const parts = path.split('/');
  const name = parts.pop();
  const timestamp = Date.now();
  const altName = `${timestamp}.${file.mime}`;
  return name || altName;
};

export type ImagePickerProps = {
  children?: React.ReactNode;
  onChange?: (media?: Media) => any;
  id?: string;
  mode?: 'camera' | 'gallery';
  options?: Options;
};

export default function ImagePicker({
  mode,
  options,
  onChange,
  children,
  id = 'image_picker',
}: ImagePickerProps) {
  const permissions = system.usePermissions();
  const close = () => hideBottomSheet(id);

  const handleFilePicked = (file?: Image) => {
    if (!file) {
      return onChange?.();
    }

    return onChange?.({
      uri: file?.path,
      type: file?.mime,
      width: file?.width,
      height: file?.height,
      name: getFileName(file),
    });
  };

  const openPicker = async (type: 'camera' | 'gallery') => {
    close();

    const permissionGranted = permissions[type] === 'granted';
    const picker =
      type === 'camera' ? CropPicker?.openCamera : CropPicker?.openPicker;

    if (!permissionGranted) {
      await system.requestCameraPermission();
    }

    return picker?.({...options}).then(handleFilePicked);
  };

  const handlePickerPress = () => {
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
