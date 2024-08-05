import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  Title,
  Provider as PaperProvider,
  Drawer,
  Appbar,
  useTheme,
  Surface,
} from 'react-native-paper';

import Meteor, {Mongo, withTracker} from '@meteorrn/core';
import {
  CapitulosCollection,
  SeriesCollection,
  TemporadasCollection,
} from '../collections/collections';
import VideoPlayer from '../video/VideoPlayer';

const SeriesDetails = ({navigation, route}) => {
    const {idSerie} = route.params;
//   var idSerie = 'CKsYcmYGqj55LZKtS';
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [active, setActive] = useState(1);
  const [focusEpisodio, setFocusEpisodio] = useState();
  const handleLogout = () => {
    // Implementa la lógica de cierre de sesión aquí
    console.log('Cierre de sesión');
    Meteor.logout();
  };

  useEffect(() => {
    fetchSeasons(idSerie);
  }, []);

  useEffect(() => {
    selectedSeason && fetchEpisodes(selectedSeason._id);
  }, [selectedSeason]);

  const userName = Meteor.user()
    ? Meteor.user().profile &&
      Meteor.user().profile.firstName + ' ' + Meteor.user().profile.lastName
    : '';

  const fetchSeasons = async idSerieSeasons => {
    try {
      console.log('fetchSeasons - idSerieSeasons', idSerieSeasons);
      let temporadas = await TemporadasCollection.find(
        {idSerie: idSerieSeasons},
        {sort: {nombre: 1}},
      ).fetch();
      if (temporadas != null && temporadas.length > 0) {
        await setSeasons(temporadas);
        await handleSeasonSelect(temporadas[0]);
        setActive(temporadas[0].numeroTemporada);
      }
      console.log('temporadas', seasons);
    } catch (error) {
      console.error('Error al cargar las temporadas:', error);
    }
  };

  const fetchEpisodes = async seasonId => {
    try {
      console.log('fetchEpisodes - selectedSeason', seasonId);
      let capitulos = await CapitulosCollection.find(
        {idTemporada: seasonId},
        {fields: {textSubtitle: 0}},
      ).fetch();
      if (capitulos != null && capitulos.length > 0) {
        await setEpisodes(capitulos);
      }
      // console.log('capitulos', capitulos);
    } catch (error) {
      console.error('Error al cargar los capítulos:', error);
    }
  };

  const handleSeasonSelect = season => {
    setSelectedSeason(season);
    // fetchEpisodes(season._id);
  };

  const handleEpisodeClick = episode => {
    console.log('Nombre del capítulo seleccionado:', episode);
    navigation.navigate('Peli', {
      urlVideo: episode.url,
      subtitulo: episode.subtitulo,
    });
  };

  const renderSeason = ({item}) => (
    <Drawer.Item
      onfocus={() => console.log('focus')}
      label={`Temporada ${item.numeroTemporada}`}
      active={active === item.numeroTemporada}
      onPress={() => {
        setActive(item.numeroTemporada);
        handleSeasonSelect(item);
      }}
    />
  );

  const renderEpisode = ({item}) => (
    <TouchableOpacity
      style={{
        borderRadius: 10,
        opacity: focusEpisodio === item.nombre ? 1 : 0.7,
      }}
      onFocus={() => setFocusEpisodio(item.nombre)}
      onBlur={() => setFocusEpisodio(null)}
      onPress={() => handleEpisodeClick(item)}>
      <Surface
        style={{
          padding: 0,
          margin: 10,
          borderRadius: 10,
          backgroundColor: 'rgba(20, 20, 20, 1)',
        }}>
        {/* se le puso false para que no mostrara las imagenes */}
        {item.urlBackground && false ? (
          <ImageBackground
            source={{
              uri: item.urlBackground || 'https://via.placeholder.com/400x200',
            }}
            style={styles.image}
            imageStyle={{borderRadius: 10}}>
            <View style={styles.overlay}>
              <Text style={[styles.title2, {color: theme.colors.onSurface}]}>
                {item.nombre}
              </Text>
              <Text
                style={[styles.description, {color: theme.colors.onSurface}]}>
                {item.descripcion}
              </Text>
              <Text style={[styles.views, {color: theme.colors.onSurface}]}>
                Vistas: {item.vistas}
              </Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.overlay}>
            <Text style={[styles.title2]}>{item.nombre}</Text>
            <Text style={[styles.description]}>{item.descripcion}</Text>
            <Text style={[styles.views]}>Vistas: {item.vistas}</Text>
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  );

  return (
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
          <Button icon={'account-off'} mode="outlined" onPress={handleLogout}>
            Cerrar Sesión
          </Button>
          {/* <Icon source={'home'} isTVSelectable={false} size={25} /> */}
          <View style={{flexDirection: 'row'}}>
            {/* <Appbar.Action icon={'home'} disabled isTVSelectable={false} /> */}
            <Text style={{fontSize: 20}}>{`Bienvenido, ${userName}`}</Text>
          </View>
        </View>
      </Appbar.Header>
      <View style={styles.menuLateral}>
        <View
          style={{
            flex: 0.3,
            backgroundColor: 'rgba(20, 20, 20, 0.73)',
          }}>
          <Drawer.Section
            title="Selecciona una Temporada:"
            showDivider={false}
            style={{
              height: '100%',
            }}>
            <FlatList
              data={seasons}
              renderItem={renderSeason}
              keyExtractor={item => item._id}
              style={styles.list}
            />
            {/* <Drawer.Item
              // background={'white'}
              onfocus={() => console.log('focus')}
              label="Series"
              active={active === 'first'}
              onPress={() => setActive('first')}
            /> */}
          </Drawer.Section>
        </View>
        <View style={{flex: 0.7, paddingBottom: 70, marginBottom:10}}>
          <View style={styles.container}>
            {/* <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <View
                  style={{height: 200, width: 400, backgroundColor: 'black'}}>
                  <VideoPlayer
                    ocultarControles={true}
                    navigation={navigation}
                    route={{
                      params: {
                        urlVideo: focusEpisodio && focusEpisodio.url,
                        subtitulo: focusEpisodio && focusEpisodio.subtitulo,
                      },
                    }}
                    //   urlVideo={focusEpisodio.url}
                    //   subtitulo={focusEpisodio.subtitulo}
                  />
                </View>
              </View> */}

            {selectedSeason && (
              <>
                <Text style={styles.title}>
                  Capítulos de la Temporada {selectedSeason.numeroTemporada}
                </Text>
                <FlatList
                  data={episodes}
                  renderItem={renderEpisode}
                  keyExtractor={item => item._id}
                  style={styles.list}
                  decelerationRate={0.2}
                  bouncesZoom={true}
                  bounces={true}
                  // ListHeaderComponent={<Text>Footer</Text>}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(20, 20, 20)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'rgba(20, 20, 20, 0.73)',
  },
  menuLateral: {
    backgroundColor: 'rgba(20, 20, 20, 1)',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    // padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius:10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginVertical: 5,
  },
  views: {
    fontSize: 14,
  },
});

export default SeriesDetails;
