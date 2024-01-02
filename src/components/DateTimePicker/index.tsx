import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import BottomSheet, {hideBottomSheet, showBottomSheet} from '../BottomSheet';
import RNUIDatepicker from 'react-native-ui-datepicker';

export type DateTimePickerProps = {
  children?: React.ReactNode;
  id?: string;
};

export default function DateTimePicker({
  children,
  id = 'date_time_picker',
}: DateTimePickerProps) {
  const renderCalendar = () => <RNUIDatepicker />;
  const showPicker = () => showBottomSheet(id);
  const hidePicker = () => hideBottomSheet(id);

  if (children) {
    return (
      <>
        <Pressable style={styles.wrapper} onPress={showPicker}>
          {children}
        </Pressable>
        <BottomSheet height={300} id={id}>
          {renderCalendar()}
        </BottomSheet>
      </>
    );
  }

  return renderCalendar();
}

const styles = StyleSheet.create({
  wrapper: {
    pointerEvents: 'box-only',
  },
});
