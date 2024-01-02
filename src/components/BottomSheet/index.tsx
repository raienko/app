import React, {useState} from 'react';
import {View, StyleSheet, Modal, Pressable} from 'react-native';
import RNBottomSheet from '@gorhom/bottom-sheet';
import {useRef} from 'react';
import {eventBus, useEventBus, vh, wait} from '~/src/utils';
import {system} from '~/src/features';
import {colors, sizes} from '~/src/constants';

type BottomSheetProps = {
  id: string;
  style?: any;
  index?: number;
  children?: React.ReactNode;
  height?: number;
};

const getBottomSheetEventKey = (id: string) => `TOGGLE_BOTTOM_SHEET_${id}`;

const toggleBottomSheet = (id: string, value: boolean) =>
  eventBus.dispatch(getBottomSheetEventKey(id), value);

export const showBottomSheet = (id: string) => toggleBottomSheet(id, true);

export const hideBottomSheet = (id: string) => toggleBottomSheet(id, false);

export default function BottomSheet({
  id,
  style,
  children,
  index = 0,
  height = vh(30),
}: BottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const bottomSheetRef = useRef<RNBottomSheet>(null);
  const darkMode = system.useDarkMode();
  const duration = (height / vh(100)) * 1000;

  const toggle = async (value: boolean) => {
    if (!value) {
      bottomSheetRef.current?.close();
      await wait(duration);
      return setVisible(value);
    }

    setVisible(value);
    await wait(300);
    return bottomSheetRef.current?.snapToIndex(1);
  };

  const eventKey = getBottomSheetEventKey(id);
  useEventBus(eventKey, toggle);

  const backgroundColor = darkMode
    ? colors.secondaryDark
    : colors.secondaryLight;
  const appearance = [styles.container].concat(style);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      style={styles.wrapper}
      onRequestClose={() => hideBottomSheet(id)}>
      <Pressable style={styles.fade} onPress={() => hideBottomSheet(id)} />
      <RNBottomSheet
        index={index}
        ref={bottomSheetRef}
        snapPoints={[1, height]}
        animationConfigs={{
          duration,
        }}
        backgroundStyle={{backgroundColor}}>
        <View style={appearance}>{children}</View>
      </RNBottomSheet>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    zIndex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    padding: sizes.offsetM,
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.fade,
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'box-none',
  },
});
