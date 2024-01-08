import React from 'react';
import {Platform, Dimensions} from 'react-native';

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const isWeb = Platform.OS === 'web';

export const isWindows = Platform.OS === 'windows';

export const isMacos = Platform.OS === 'macos';

// @ts-ignore
export const isJest = !!process.env.JEST_WORKER_ID;

export const viewport = Dimensions.get(isWeb ? 'window' : 'screen');

export const isDesktop = viewport.width > 768;

export const isLandscape = viewport.width > viewport.height;

export const isPortrait = !isLandscape;

const base = isLandscape ? viewport.height : viewport.width;

const magicNumber = 375;

export const vw = (size = 0): number =>
  Math.floor((viewport.width / 100) * size);

export const vh = (size = 0): number =>
  Math.floor((viewport.height / 100) * size);

export const rem = (size = 0): number =>
  Math.floor((base / magicNumber) * size);

export const wait = (timeout = 0): Promise<boolean> => {
  return new Promise(resolve => setTimeout(() => resolve(true), timeout));
};

export const img = (source: any) =>
  typeof source === 'string' ? {uri: source} : source;

export const extendChildrenWith = (children: any, props: any) => {
  if (!!children && !children?.length) {
    return React.cloneElement(children, props);
  }

  return React.Children.map(children, child =>
    React.cloneElement(child, props),
  );
};
