import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import BottomSheet, {hideBottomSheet, showBottomSheet} from '../BottomSheet';
import RNUIDatepicker from 'react-native-ui-datepicker';
import {system} from '~/src/features';
import {colors, typography} from '~/src/constants';
import {rem, isWeb} from '~/src/utils';

export type DateTimePickerProps = {
  children?: React.ReactNode;
  id?: string;
};

const height = rem(isWeb ? 200 : 350);

export default function DateTimePicker({
  children,
  id = 'date_time_picker',
}: DateTimePickerProps) {
  const darkMode = system.useDarkMode();
  const color = darkMode ? colors.textDark : colors.textLight;
  const backgroundColor = darkMode
    ? colors.secondaryDark
    : colors.secondaryLight;
  const theme = {
    calendarTextStyle: {
      ...typography.button,
      color,
    },
    todayTextStyle: {color},
    weekDaysTextStyle: {color},
    timePickerTextStyle: {color},
    headerTextStyle: {color},
    selectedTextStyle: {color: colors.textDark},
    selectedItemColor: colors.accentA,
    headerButtonColor: colors.accentA,
    yearContainerStyle: {backgroundColor},
    monthContainerStyle: {backgroundColor},
    weekDaysContainerStyle: {backgroundColor},
    timePickerContainerStyle: {backgroundColor},
    todayContainerStyle: {backgroundColor},
  };

  const renderCalendar = () => <RNUIDatepicker {...theme} />;
  const showPicker = () => showBottomSheet(id);
  const hidePicker = () => hideBottomSheet(id);

  if (children) {
    return (
      <>
        <Pressable style={styles.wrapper} onPress={showPicker}>
          {children}
        </Pressable>
        <BottomSheet height={height} id={id}>
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
