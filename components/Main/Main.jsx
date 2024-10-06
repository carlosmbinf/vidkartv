//crear elemento react native Main.js
import React, { useEffect } from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {VideoPlayer} from '../video/VideoPlayer';
import {
  Appbar,
  Button,
  PaperProvider,
  useTheme,
  Text,
  IconButton,
  Icon,
} from 'react-native-paper';
import Drawer from 'react-native-drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainPelis from './MainPelis';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';
import MainSeries from './MainSeries';
import SeriesDetails from '../series/SeriesDetails';
import DrawerOptionsAlls from '../drawer/DrawerOptionsAlls';

const {width: screenWidth} = Dimensions.get('window');
const {height: screenHeight} = Dimensions.get('window');

const Stack = createNativeStackNavigator();

const Main = () => {
  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState('first');
  const [clasificacion, setClasificacion] = React.useState([]);
  const [drawer, setDrawer] = React.useState(false);
  const [orientation, setOrientation] = React.useState('Portrait');

  const handleOrientationChange = () => {
    const {height, width} = Dimensions.get('window');
    if (height > width) {
      setOrientation('Portrait'); // Vertical
    } else {
      setOrientation('Landscape'); // Horizontal
    }
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      handleOrientationChange,
    );

    // Establecer la orientación inicial
    handleOrientationChange();

    return () => {
      subscription?.remove();
    };
  }, []);

  const opcionesServicios = [
    {
      label: 'Peliculas',
      url: 'Peliculas',
      icon: 'movie-filter',
    },
    {
      label: 'Series',
      url: 'Series',
      icon: 'movie-filter',
    },
  ];

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

  useEffect(() => {
    Meteor.call('getSeriesClasificacion', (err, res) => {
      if (err) {
        console.log(err);
      } else {
        setClasificacion(res);
      }
    });
  }, [active]);

  const drawerStyles = {
    drawer: {
      shadowColor: 'black',
      shadowOpacity: 0,
      shadowRadius: 3,
      backgroundColor: 'black',
    },
    main: {paddingLeft: 0},
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
      primary: 'rgb(220, 184, 255)',
      onPrimary: 'rgb(71, 12, 122)',
      primaryContainer: 'rgb(95, 43, 146)',
      onPrimaryContainer: 'rgb(240, 219, 255)',
      secondary: 'rgb(208, 193, 218)',
      onSecondary: 'rgb(54, 44, 63)',
      secondaryContainer: 'rgb(77, 67, 87)',
      onSecondaryContainer: 'rgb(237, 221, 246)',
      tertiary: 'rgb(243, 183, 190)',
      onTertiary: 'rgb(75, 37, 43)',
      tertiaryContainer: 'rgb(101, 58, 65)',
      onTertiaryContainer: 'rgb(255, 217, 221)',
      error: 'rgb(255, 180, 171)',
      onError: 'rgb(105, 0, 5)',
      errorContainer: 'rgb(147, 0, 10)',
      onErrorContainer: 'rgb(255, 180, 171)',
      background: 'rgb(29, 27, 30)',
      onBackground: 'rgb(231, 225, 229)',
      surface: 'rgb(29, 27, 30)',
      onSurface: 'rgb(231, 225, 229)',
      surfaceVariant: 'rgb(74, 69, 78)',
      onSurfaceVariant: 'rgb(204, 196, 206)',
      outline: 'rgb(150, 142, 152)',
      outlineVariant: 'rgb(74, 69, 78)',
      shadow: 'rgb(0, 0, 0)',
      scrim: 'rgb(0, 0, 0)',
      inverseSurface: 'rgb(231, 225, 229)',
      inverseOnSurface: 'rgb(50, 47, 51)',
      inversePrimary: 'rgb(120, 69, 172)',
      elevation: {
        level0: 'transparent',
        level1: 'rgb(39, 35, 41)',
        level2: 'rgb(44, 40, 48)',
        level3: 'rgb(50, 44, 55)',
        level4: 'rgb(52, 46, 57)',
        level5: 'rgb(56, 49, 62)',
      },
      surfaceDisabled: 'rgba(231, 225, 229, 0.12)',
      onSurfaceDisabled: 'rgba(231, 225, 229, 0.38)',
      backdrop: 'rgba(51, 47, 55, 0.4)',
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
              <Drawer
                // key={orientation}
                type="overlay"
                open={drawer}
                content={
                  <DrawerOptionsAlls
                    navigation={props.navigation}
                    setActive={setActive}
                    active={active}
                    opcionesServicios={opcionesServicios}
                  />
                }
                tapToClose={true}
                // captureGestures="closed"
                // acceptPanOnDrawer={false}
                // acceptPan={true}
                onClose={() => setDrawer(false)}
                elevation={12}
                side="left"
                openDrawerOffset={orientation == 'Portrait' ? 0.4 : 0.6} // 20% gap on the right side of drawer
                panCloseMask={0.5}
                closedDrawerOffset={0}
                styles={drawerStyles}
                tweenHandler={ratio => ({
                  main: {opacity: (2 - ratio) / 2},
                })}>
                <>
                  <Appbar.Header
                    elevated={12}
                    style={{backgroundColor: 'rgba(20, 20, 20, 0.73)'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        // alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}>
                      <IconButton
                        icon={'format-list-bulleted'}
                        // mode="outlined"
                        onPress={() => setDrawer(true)}
                      />

                      <Button
                        icon={'account-off'}
                        mode="outlined"
                        onPress={handleLogout}>
                        Cerrar Sesión
                      </Button>
                      {/* <Icon source={'home'} isTVSelectable={false} size={25} /> */}

                      {/* <IconButton
                    icon="menu"
                    color="white"
                    size={30}
                    onPress={() => setDrawer(true)}
                    style={{position: 'absolute', left: 10, top: 10}}
                  /> */}
                      {/* <View style={{flexDirection: 'column'}}> */}

                      {/* <Appbar.Action icon={'home'} disabled isTVSelectable={false} />
                    <Text
                      style={{fontSize: 20}}>{`${userName}`}</Text>
                  </View> */}
                    </View>
                  </Appbar.Header>
                  <View style={styles.menuLateral}>
                    <View>
                      <ScrollView visible={visible} setVisible={setVisible}>
                        {active === opcionesServicios[1].url
                          ? clasificacion.map((clasification, index) => (
                              <MainSeries
                                {...props}
                                key={index}
                                clasificacion={clasification}
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
              </Drawer>
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
    // paddingBottom: 65,
  },
  logoutButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#6200ea', // Puedes cambiar el color según tus necesidades
    borderRadius: 5,
  },
});
