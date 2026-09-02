import { useRef, useState, type ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as ExpoImagePicker from "expo-image-picker";

import Button from "@/components/button";
import Modal from "@/components/modal";
import Text from "@/components/text";
import { controlA11yProps } from "@/features/accessibility";
import logger from "@/features/logger";
import { permissions } from "@/features/permissions";

type PickerOptions = Omit<
  ExpoImagePicker.ImagePickerOptions,
  | "allowsMultipleSelection"
  | "mediaTypes"
  | "orderedSelection"
  | "selectionLimit"
>;

export type ImagePickerProps = Omit<
  PressableProps,
  "children" | "onPress" | "style"
> & {
  /** Identifies this picker for ImagePicker.show(id)/ImagePicker.hide(id). */
  id: string;
  children: ReactNode;
  onChange: (image: ExpoImagePicker.ImagePickerAsset) => void | Promise<void>;
  options?: PickerOptions;
  style?: StyleProp<ViewStyle>;
};

type PickerSource = "camera" | "gallery";

const SHEET_ID_PREFIX = "image-picker:";

function sheetId(id: string): string {
  return `${SHEET_ID_PREFIX}${id}`;
}

function ImagePickerComponent({
  id,
  children,
  onChange,
  options,
  style,
  disabled,
  accessibilityLabel,
  ...pressableProps
}: ImagePickerProps) {
  const picking = useRef(false);
  const [open, setOpen] = useState(false);

  const launch = (source: PickerSource) => {
    const pickerOptions: ExpoImagePicker.ImagePickerOptions = {
      ...options,
      allowsMultipleSelection: false,
      mediaTypes: ["images"],
    };

    return source === "camera"
      ? ExpoImagePicker.launchCameraAsync(pickerOptions)
      : ExpoImagePicker.launchImageLibraryAsync(pickerOptions);
  };

  const pick = async (source: PickerSource) => {
    if (picking.current) return;
    picking.current = true;

    try {
      let result: ExpoImagePicker.ImagePickerResult;

      if (process.env.EXPO_OS === "web") {
        // Browsers only allow the file input to open from the original user
        // gesture. Start closing first, launch synchronously, then wait for
        // both without inserting a timer between the press and picker call.
        const closing = ImagePicker.hide(id);
        [result] = await Promise.all([launch(source), closing]);
      } else {
        // A native picker is itself a modal activity/controller. Waiting for
        // our sheet's exit prevents the OS from dismissing both together.
        await ImagePicker.hide(id);

        if (source === "camera") {
          const currentPermission = permissions.camera.get();
          const cameraPermission = currentPermission?.granted
            ? currentPermission
            : await permissions.camera.request();
          if (!cameraPermission?.granted) return;
        }

        result = await launch(source);
      }

      const image = result.canceled ? undefined : result.assets[0];
      if (image) await onChange?.(image);
    } catch (error) {
      logger.failed(`Unable to pick image from ${source}`, error);
    } finally {
      // A canceled native picker resolves normally; failures land here too.
      // Either way, the next press must be able to launch another picker.
      picking.current = false;
    }
  };

  return (
    <>
      <Pressable
        {...controlA11yProps({
          label: accessibilityLabel,
          disabled: disabled ?? false,
          expanded: open,
        })}
        {...pressableProps}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        style={style}
        onPress={() => void ImagePicker.show(id)}
      >
        {children}
      </Pressable>

      <Modal
        id={sheetId(id)}
        type="bottomSheet"
        onShow={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Text value="Choose image" type="title3" />
        <Button value="Gallery" onPress={() => void pick("gallery")} />
        <Button value="Camera" onPress={() => void pick("camera")} />
      </Modal>
    </>
  );
}

type ImagePickerStatic = {
  show: (id: string) => Promise<void>;
  hide: (id: string) => Promise<void>;
};

const ImagePicker = ImagePickerComponent as typeof ImagePickerComponent &
  ImagePickerStatic;

ImagePicker.show = (id: string) => Modal.show(sheetId(id));
ImagePicker.hide = (id: string) => Modal.hide(sheetId(id));

export default ImagePicker;
