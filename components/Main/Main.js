//crear elemento react native Main.js
import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {VideoPlayer} from '../video/VideoPlayer';
import {Button} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeServices} from './HomeServices';

const Stack = createNativeStackNavigator();

export const Main = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Details"
        options={{
          statusBarHidden: true,
          navigationBarHidden: true,
          headerShown: false,
        }}>
        {props => <HomeServices {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="Peli"
        options={{
          statusBarHidden: true,
          navigationBarHidden: true,
          headerShown: false,
        }}>
        {props => <VideoPlayer {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
