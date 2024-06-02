//crear elemento react native Main.js
import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {VideoPlayer} from '../video/VideoPlayer';
import {Button} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainPelis from './MainPelis';

const Stack = createNativeStackNavigator();

const Main = () => {
  const categorias = [
    'Sci-Fi',
    'Action',
    'Adventure',
    'Thriller',
    'Crime',
    'Mystery',
    'Horror',
    'Comedy',
    'Romance',
    'Drama',
  ];
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Details"
        options={{
          title: 'Detalles',
          headerStyle: {
            backgroundColor: '#3f51b5',
            height: 90,
          },
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          // headerTitleStyle: {
          //   fontWeight: 'bold',
          // },
          // headerShown: true,
          // headerRight
          // headerTransparent:false
          // statusBarHidden: true,
          // navigationBarHidden: true,
          headerShown: false,
        }}>
        {props => (
          <>
            <ScrollView style={{backgroundColor:'rgb(20, 20, 20)'}}>
              {categorias.map((categoria, index) => (
                <MainPelis {...props} key={index} clasificacion={categoria} />
              ))}
            </ScrollView>
          </>
        )}
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

export default Main;
