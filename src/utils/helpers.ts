import {Platform, Dimensions} from 'react-native';

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const isWeb = Platform.OS === 'web';

export const isWindows = Platform.OS === 'windows';

export const isMacos = Platform.OS === 'macos';

export const {width: screenWidth, height: screenHeight} =
  Dimensions.get('screen');

export const isLandscape = screenWidth > screenHeight;

export const isPortrait = !isLandscape;

const base = isLandscape ? screenHeight : screenWidth;

const magicNumber = 375;

export const vw = (size = 0): number => Math.floor((screenWidth / 100) * size);

export const vh = (size = 0): number => Math.floor((screenHeight / 100) * size);

export const rem = (size = 0): number =>
  Math.floor((base / magicNumber) * size);
