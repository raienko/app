import React from 'react';
import {system} from '~/src/features';
import {colors, sizes} from '~/src/constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {IconProps as RNIconProps} from 'react-native-vector-icons/Icon';

const sets: any = {
  Feather,
  Ionicons,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
};

interface IconProps extends RNIconProps {
  type?: string;
}

export default function Icon({type = 'FontAwesome', ...rest}: IconProps) {
  const darkMode = system.useDarkMode();
  const Set = sets?.[type] || sets.FontAwesome;

  return (
    <Set
      color={darkMode ? colors.textDark : colors.textLight}
      size={sizes.iconMedium}
      {...rest}
    />
  );
}
