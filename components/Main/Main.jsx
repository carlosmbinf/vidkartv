//crear elemento react native Main.js
import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {VideoPlayer} from '../video/VideoPlayer';
import {Appbar, Button} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainPelis from './MainPelis';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';

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

  const userName = 'Nombre del Usuario';

  const handleLogout = () => {
    // Implementa la lógica de cierre de sesión aquí
    console.log('Cierre de sesión');
    Meteor.logout();
  };

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
            <Appbar.Header elevated={6} style={{backgroundColor:"rgb(20, 20, 20)"}}>
              <Appbar.Content color='white' title={`Bienvenido, ${Meteor.user().profile.firstName} ${Meteor.user().profile.lastName}`} />
              {/* <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}>
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity> */}
              <Button
                icon={'abacus'}
                mode="contained"
                onPress={handleLogout}
                style={styles.button}>
                Cerrar Sesión
              </Button>
            </Appbar.Header>

            <ScrollView style={{backgroundColor: 'rgb(20, 20, 20)'}}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
  },
  logoutButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#6200ea', // Puedes cambiar el color según tus necesidades
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
