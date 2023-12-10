import React from 'react';
import {defaultStackOptions} from './presets';
import {createStackNavigator} from '@react-navigation/stack';
import {Home} from '~/src/screens';

export type MainStackParamList = {
  Home: {};
};

const Stack = createStackNavigator<MainStackParamList>();

export default function Main() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Home" component={Home} />
      {/* Modals listed below */}
    </Stack.Navigator>
  );
}
