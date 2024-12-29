//crear elemento react native Main.js
import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Animated, Touchable, TouchableHighlight } from 'react-native';
import { VideoPlayer } from '../video/VideoPlayer';
import {
  Appbar,
  Button,
  Drawer,
  PaperProvider,
  useTheme,
  Text,
  IconButton,
  Icon,
  Surface,
  Portal,
  Dialog,
  RadioButton,
  Searchbar,
  TextInput,
} from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainPelis from './MainPelis';
import Meteor, { Mongo, withTracker } from '@meteorrn/core';
import MainSeries from './MainSeries';
import SeriesDetails from '../series/SeriesDetails';
import VideoPlayerIOS from '../video/VideoPlayerIOS';

const Stack = createNativeStackNavigator();

const Main = () => {
  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState('first');
  const [clasificacion, setClasificacion] = React.useState([]);
  const [focused, setFocused] = useState('');
  const scaleValue = useRef(new Animated.Value(1)).current;
  const scaleValueSecond = useRef(new Animated.Value(1)).current;
  const scaleValuecerrarSession = useRef(new Animated.Value(1)).current;
  const [visibleModalReproductorSeries, setVisibleModalReproductorSeries] = React.useState(true);
  const [visibleModalReproductorPeliculas, setVisibleModalReproductorPeliculas] = React.useState(true);
  const [checkedSeries, setCheckedSeries] = React.useState();
  const [reproductorSeries, setReproductorSeries] = React.useState();
  const [checkedPeliculas, setCheckedPeliculas] = React.useState();
  const [reproductorPeliculas, setReproductorPeliculas] = React.useState();
  const [focusedOption, setFocusedOption] = useState(null);
  const [focusedAction, setFocusedAction] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = React.useRef();
  const handleSearch = (query) => {
    setSearchQuery(query);

  };

  const hideDialogSeries = () => {
    setVisibleModalReproductorSeries(false);
    setReproductorSeries(checkedSeries);
  };
  const hideDialogPeliculas = () => {
    setVisibleModalReproductorPeliculas(false);
    setReproductorPeliculas(checkedPeliculas);
  };
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
    active == 'first' && Meteor.call('getSeriesClasificacion', (err, res) => {
      if (err) {
        console.log(err);
      } else {
        setClasificacion(res);
      }
    });
  }, [active]);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused == 'first' ? 1 : 0.8, // Escala cuando está enfocado
      friction: 3,
      useNativeDriver: true,
    }).start();
    Animated.spring(scaleValuecerrarSession, {
      toValue: focused == 'cerrarSession' ? 1 : 0.8, // Escala cuando está enfocado
      friction: 3,
      useNativeDriver: true,
    }).start();
    Animated.spring(scaleValueSecond, {
      toValue: focused == 'second' ? 1 : 0.8, // Escala cuando está enfocado
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const theme = useTheme({
    ...useTheme(),
    isV3: true,
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
    <PaperProvider
      theme={theme}
    >
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
            <Surface>
              <Appbar.Header
                elevated={12}
              // style={{backgroundColor: 'rgba(20, 20, 20, 0.73)'}}
              >
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}>
                  <TouchableOpacity
                    activeOpacity={scaleValuecerrarSession}
                    focusable={true}
                    onFocus={() => setFocused('cerrarSession')}
                    onBlur={() => setFocused('')}
                    onPress={handleLogout}
                    style={styles.button}>
                    <Animated.View
                      style={[
                        styles.innerButton,
                        { transform: [{ scale: scaleValuecerrarSession }], backgroundColor: focused == 'cerrarSession' || active === 'cerrarSession' ? theme.colors.onPrimary : theme.colors.onSecondary },
                      ]}>
                      <Button
                        icon={'account-off'}
                        mode="text">
                        Sign Out
                      </Button>
                    </Animated.View>
                  </TouchableOpacity>
                  {/* <Icon source={'home'} isTVSelectable={false} size={25} /> */}
                  <View style={{ flexDirection: 'row' }}>
                    {/* <Appbar.Action icon={'home'} disabled isTVSelectable={false} /> */}
                    <Text
                      style={{ fontSize: 20 }}>{`Welcome, ${userName}`}</Text>
                  </View>
                </View>
              </Appbar.Header>
              <View style={styles.menuLateral}>
                <View
                  style={{
                    flex: 0.2,
                    // backgroundColor: 'rgba(20, 20, 20, 0.73)',
                  }}>
                  <Drawer.Section
                    title="What do you want to see?"
                    showDivider={false}
                    style={{
                      height: '100%',
                    }}>
                    <TouchableOpacity
                      activeOpacity={scaleValue}
                      focusable={true}
                      onFocus={() => setFocused('first')}
                      onBlur={() => setFocused('')}
                      onPress={() => setActive('first')}
                      style={styles.button}>
                      <Animated.View
                        style={[
                          styles.innerButton,
                          { transform: [{ scale: scaleValue }], backgroundColor: focused == 'first' || active === 'first' ? theme.colors.onPrimary : theme.colors.onSecondary },
                        ]}>
                        <Text style={styles.buttonText}>Series</Text>
                      </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={1}
                      focusable={true}
                      onFocus={() => setFocused('second')}
                      onBlur={() => setFocused('')}
                      onPress={() => setActive('second')}
                      style={[styles.button]}>
                      <Animated.View
                        style={[
                          styles.innerButton,
                          { transform: [{ scale: scaleValueSecond }], backgroundColor: focused == 'second' || active === 'second' ? theme.colors.onPrimary : theme.colors.onSecondary },
                        ]}>
                        <Text style={styles.buttonText}>Movies</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </Drawer.Section>
                </View>
                <View style={{ flex: 0.8 }}>

                  <ScrollView visible={visible}
                  // setVisible={setVisible}
                  >
                    <View style={styles.container}>
                      <TouchableOpacity onPress={() => { searchRef.current.focus() }}>

                        <TextInput
                          placeholder="Search movies, series, or more..."
                          ref={searchRef}
                          style={styles.searchBar}
                          onChangeText={handleSearch}
                          value={searchQuery}
                          mode='outlined'
                        />

                        {/* <Searchbar
                      ref={searchRef}
                      placeholder="Search movies, series, or more..."
                      onChangeText={handleSearch}
                      value={searchQuery}
                      style={styles.searchBar}
                      inputStyle={styles.inputText}
                      placeholderTextColor="#b0b0b0"
                      autoFocus={true} // Permite capturar texto de inmediato
                      // loading={true}

                      traileringIcon={undefined}
                      clearButtonMode='never'
                      // traileringIcon={'magnify'}
                      right={undefined}
                      clearIcon={true}
                      icon="magnify"
                      mode = "bar"
                    /> */}
                      </TouchableOpacity>

                    </View>
                    {active == 'first'
                      ? clasificacion.map((clasification, index) => (
                        <MainSeries
                          {...props}
                          key={index}
                          clasificacion={clasification}
                          filtro={searchQuery ? searchQuery : null}
                        />
                      ))
                      : categorias.map((categoria, index) => (
                        <MainPelis
                          {...props}
                          key={index}
                          clasificacion={categoria}
                          filtro={searchQuery ? searchQuery : null}
                        />
                      ))}
                  </ScrollView>
                </View>
              </View>
            </Surface>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Peli"
          options={{
            statusBarHidden: true,
            navigationBarHidden: true,
            headerShown: false,
          }}>
          {props =>
            <Surface style={styles.container}>
              {props.route.params.isSerie ?
                <Dialog
                  visible={visibleModalReproductorSeries || !reproductorSeries}
                  onDismiss={hideDialogSeries}
                >
                  <Dialog.Icon icon="alert" />
                  <Dialog.Title style={styles.title}>
                    Select a Player to Play Series
                  </Dialog.Title>
                  <Dialog.Content>
                    <TouchableOpacity
                      activeOpacity={1}
                      focusable
                      hasTVPreferredFocus
                      onPress={() => setCheckedSeries('android')}
                      onFocus={() => setFocusedOption('android')}
                      onBlur={() => setFocusedOption(null)}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            focusedOption === 'android'
                              ? theme.colors.primaryContainer
                              : checkedSeries === 'android'
                                ? theme.colors.secondaryContainer
                                : undefined,
                        },
                      ]}
                    >
                      <Text style={styles.optionText}>Player Android</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={1}
                      focusable
                      onPress={() => setCheckedSeries('vlc')}
                      onFocus={() => setFocusedOption('vlc')}
                      onBlur={() => setFocusedOption(null)}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            focusedOption === 'vlc'
                              ? theme.colors.primaryContainer
                              : checkedSeries === 'vlc'
                                ? theme.colors.secondaryContainer
                                : undefined,
                        },
                      ]}
                    >
                      <Text style={styles.optionText}>Integrated VLC Player</Text>
                    </TouchableOpacity>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <TouchableOpacity
                      onPress={() => hideDialogSeries()}
                      onFocus={() => setFocusedAction(true)}
                      onBlur={() => setFocusedAction(false)}
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: focusedAction
                            ? theme.colors.primaryContainer
                            : theme.colors.secondaryContainer,
                        },
                      ]}
                      activeOpacity={1}
                    >
                      <Text style={styles.actionText}>OK</Text>
                    </TouchableOpacity>
                  </Dialog.Actions>
                </Dialog>
                :
                <Dialog
                  visible={visibleModalReproductorPeliculas || !reproductorPeliculas}
                  onDismiss={hideDialogPeliculas}
                >
                  <Dialog.Icon icon="alert" />
                  <Dialog.Title style={styles.title}>
                    Select a Player to Play Movies
                  </Dialog.Title>
                  <Dialog.Content>
                    <TouchableOpacity
                      activeOpacity={1}
                      focusable
                      hasTVPreferredFocus
                      onPress={() => setCheckedPeliculas('android')}
                      onFocus={() => setFocusedOption('android')}
                      onBlur={() => setFocusedOption(null)}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            focusedOption === 'android'
                              ? theme.colors.primaryContainer
                              : checkedPeliculas === 'android'
                                ? theme.colors.secondaryContainer
                                : undefined,
                        },
                      ]}
                    >
                      <Text style={styles.optionText}>Player Android</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={1}
                      focusable
                      onPress={() => setCheckedPeliculas('vlc')}
                      onFocus={() => setFocusedOption('vlc')}
                      onBlur={() => setFocusedOption(null)}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            focusedOption === 'vlc'
                              ? theme.colors.primaryContainer
                              : checkedPeliculas === 'vlc'
                                ? theme.colors.secondaryContainer
                                : undefined,
                        },
                      ]}
                    >
                      <Text style={styles.optionText}>Integrated VLC Player</Text>
                    </TouchableOpacity>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <TouchableOpacity
                      onPress={() => hideDialogPeliculas()}
                      onFocus={() => setFocusedAction(true)}
                      onBlur={() => setFocusedAction(false)}
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: focusedAction
                            ? theme.colors.primaryContainer
                            : theme.colors.secondaryContainer,
                        },
                      ]}
                      activeOpacity={1}
                    >
                      <Text style={styles.actionText}>OK</Text>
                    </TouchableOpacity>
                  </Dialog.Actions>
                </Dialog>
              }
              {props.route.params.isSerie
                ? (reproductorSeries != null
                  && (reproductorSeries === 'vlc'
                    ? <VideoPlayerIOS {...props} />
                    : <VideoPlayer {...props} />))
                : (reproductorPeliculas != null
                  && (reproductorPeliculas === 'vlc'
                    ? <VideoPlayerIOS {...props} />
                    : <VideoPlayer {...props} />))}
            </Surface>

          }
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
}

export default Main;

const styles = StyleSheet.create({
  searchBar: {
    minWidth: '70%', // Ajusta según el tamaño de tu pantalla
    borderRadius: 30,
    // backgroundColor: '#1e1e1e',
    elevation: 2,
    borderWidth: 1,
    // borderColor: '#2a2a2a',
  },
  inputText: {
    fontSize: 18,
    color: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  button: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerButton: {
    width: "90%",
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  container: {
    flex: 1,
    // backgroundColor: 'white',
    // padding: 16,
    alignItems: 'center',
    // backgroundColor: '#121212', // Fondo oscuro para TVs
  },
  menuLateral: {
    // backgroundColor: 'rgba(20, 20, 20, 1)',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    // padding: 20,
    paddingBottom: 130,
  },
  logoutButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#6200ea', // Puedes cambiar el color según tus necesidades
    borderRadius: 5,
  },
});
