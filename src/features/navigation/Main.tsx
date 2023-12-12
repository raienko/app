import React from 'react';
import {defaultStackOptions} from './presets';
import {createStackNavigator} from '@react-navigation/stack';
import {Home, Settings, Stylesheet} from '~/src/screens';

export type MainStackParamList = {
  Home: {};
  Settings: {};
  Stylesheet: {};
};

const Stack = createStackNavigator<MainStackParamList>();

export default function Main() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Home" component={Home} />
      {/* Modals listed below */}
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Stylesheet" component={Stylesheet} />
    </Stack.Navigator>
  );
}
