import React from 'react';
import MapView from 'react-native-maps';

export type MapProps = {
  style?: any;
};

export default function Map({
  style = {width: 200, height: 200},
  ...rest
}: MapProps) {
  return (
    <MapView
      style={style}
      provider="google"
      region={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}
      {...rest}
    />
  );
}
