import React from 'react';
import {
  Calendar as RNCalendar,
  CalendarProps as RNCalendarProps,
} from 'react-native-calendars';
import {Direction, Theme} from 'react-native-calendars/src/types';
import {colors, fonts, sizes, typography} from '~/src/constants';
import {system} from '~/src/features';
import {StyleSheet} from 'react-native';
import {isDesktop, rem} from '~/src/utils';
import icons from '~/assets/icons';

export interface CalendarProps extends RNCalendarProps {
  style?: any;
}

export const calendarDateFormat = 'YYYY-MM-DD';

export default function Calendar({...rest}: CalendarProps) {
  const darkMode = system.useDarkMode();
  const currentLanguage = system.useCurrentLanguage();
  const color = darkMode ? colors.textDark : colors.textLight;
  const backgroundColor = darkMode ? colors.primaryDark : colors.primaryLight;
  const theme: Theme = {
    calendarBackground: backgroundColor,
    backgroundColor,
    dayTextColor: color,
    monthTextColor: color,
    textDayFontFamily: fonts.primary,
    textDayFontSize: typography.body.fontSize,
    textMonthFontFamily: fonts.primary,
    textMonthFontSize: typography.h4.fontSize,
    textDayHeaderFontFamily: fonts.primary,
    textDayHeaderFontSize: typography.h5.fontSize,
    todayTextColor: colors.accentA,
    selectedDayTextColor: colors.textDark,
  };

  const renderArrow = (d: Direction) => {
    const Icon = d === 'left' ? icons.arrowLeft : icons.arrowRight;
    return <Icon />;
  };

  const appearance = [styles.wrapper].concat(rest.style);
  const snapshot = JSON.stringify(rest.markedDates || {});

  return (
    <RNCalendar
      {...rest}
      theme={theme}
      style={appearance}
      renderArrow={renderArrow}
      key={`calendar-dark-mode-${darkMode}-${currentLanguage}-${snapshot}`}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: rem(isDesktop ? 150 : 343),
    height: rem(isDesktop ? 150 : 360),
    borderWidth: 1,
    borderRadius: sizes.uiRadius,
    borderColor: colors.accentC,
  },
});
