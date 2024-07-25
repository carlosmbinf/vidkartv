//crear elemento react native Main.js
import React from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {VideoPlayer} from '../video/VideoPlayer';
import {
  Appbar,
  Button,
  Drawer,
  PaperProvider,
  useTheme,
  Text,
  IconButton,
  Icon,
} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainPelis from './MainPelis';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';
import MainSeries from './MainSeries';
import SeriesDetails from '../series/SeriesDetails';

const Stack = createNativeStackNavigator();

const Main = () => {
  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState('first');

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

  const userName = Meteor.user()
    ? Meteor.user().profile &&
      Meteor.user().profile.firstName + ' ' + Meteor.user().profile.lastName
    : '';

  const handleLogout = () => {
    // Implementa la lógica de cierre de sesión aquí
    console.log('Cierre de sesión');
    Meteor.logout();
  };

  const theme = useTheme({
    ...useTheme(),
    dark: true,
    roundness: 5,
    animation: {
      scale: 1.0,
    },
    colors: {
      ...useTheme().colors,
      primary: '#BB86FC',
      primaryContainer: '#3700B3',
      background: '#121212',
      backgroundColor: '#121212',
      secondary: '#0000d0',
      secondaryContainer: '#3535ff',
      accent: '#FF4081',
      surface: '#1E1E1E',
      surfaceVariant: '#121212',
      onPrimary: '#FFFFFF',
      onSecondary: '#000000',
      onBackground: '#FFFFFF',
      onSurface: '#FFFFFF',
      text: '#E1E1E1',
      outlineVariant: '#BB86FC',
      error: '#CF6679',
      onError: '#000000',
      card: '#1E1E1E',
      notification: '#FF4081',
    },
  });

  return (
    <PaperProvider theme={theme}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Details"
          options={{
            title: 'Detalles',
            // headerStyle: {
            //   backgroundColor: '#3f51b5',
            //   height: 90,
            // },
            // headerTitleAlign: 'center',
            // headerTintColor: '#fff',
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
              <Appbar.Header
                elevated={12}
                style={{backgroundColor: 'rgba(20, 20, 20, 0.73)'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}>
                  <Button
                    icon={'account-off'}
                    mode="outlined"
                    onPress={handleLogout}>
                    Cerrar Sesión
                  </Button>
                  {/* <Icon source={'home'} isTVSelectable={false} size={25} /> */}
                  <View style={{flexDirection: 'row'}}>
                    {/* <Appbar.Action icon={'home'} disabled isTVSelectable={false} /> */}
                    <Text
                      style={{fontSize: 20}}>{`Bienvenido, ${userName}`}</Text>
                  </View>
                </View>
              </Appbar.Header>
              <View style={styles.menuLateral}>
                <View
                  style={{
                    flex: 0.2,
                    backgroundColor: 'rgba(20, 20, 20, 0.73)',
                  }}>
                  <Drawer.Section
                    title="Que desea ver:"
                    showDivider={false}
                    style={{
                      height: '100%',
                    }}>
                    <Drawer.Item
                      // background={'white'}
                      onfocus={() => console.log('focus')}
                      label="Series"
                      active={active === 'first'}
                      onPress={() => setActive('first')}
                    />
                    <Drawer.Item
                      onfocus={() => console.log('focus')}
                      label="Peliculas"
                      active={active === 'second'}
                      onPress={() => setActive('second')}
                    />
                  </Drawer.Section>
                </View>
                <View style={{flex: 0.8}}>
                  <ScrollView visible={visible} setVisible={setVisible}>
                    {active === 'first'
                      ? categorias.map((categoria, index) => (
                          <MainSeries
                            {...props}
                            key={index}
                            clasificacion={categoria}
                          />
                        ))
                      : categorias.map((categoria, index) => (
                          <MainPelis
                            {...props}
                            key={index}
                            clasificacion={categoria}
                          />
                        ))}
                  </ScrollView>
                </View>
              </View>
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
        <Stack.Screen
          name="SerieDetail"
          options={{
            statusBarHidden: true,
            navigationBarHidden: true,
            headerShown: false,
          }}>
          {props => <SeriesDetails {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </PaperProvider>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
  },
  menuLateral: {
    backgroundColor: 'rgba(20, 20, 20, 1)',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    // padding: 20,
    paddingBottom: 65,
  },
  logoutButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#6200ea', // Puedes cambiar el color según tus necesidades
    borderRadius: 5,
  },
});
