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
import CardInfoSerie from './CardInfoSerie';

const App = ({navigation, route, temporadas,ready , readyCapitulos, capitulos}) => {
    const {idSerie} = route.params;
//   var idSerie = 'CKsYcmYGqj55LZKtS';
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [active, setActive] = useState(1);
  const [focusEpisodio, setFocusEpisodio] = useState();
  const [focusTemporada, setFocusTemporada] = useState();
  const handleLogout = () => {
    // Implementa la lógica de cierre de sesión aquí
    console.log('Cierre de sesión');
    Meteor.logout();
  };

  const theme = useTheme();

  useEffect(() => {
    ready && fetchSeasons(idSerie);
  }, [ready]);

  useEffect(() => {
    readyCapitulos && selectedSeason && fetchEpisodes(selectedSeason._id);
  }, [selectedSeason,readyCapitulos]);

  const userName = Meteor.user()
    ? Meteor.user().profile &&
      Meteor.user().profile.firstName + ' ' + Meteor.user().profile.lastName
    : '';

  const fetchSeasons = async idSerieSeasons => {
    try {
      if (temporadas != null && temporadas.length > 0) {
        await setSeasons(temporadas);
        setActive(temporadas[0].numeroTemporada);
        await handleSeasonSelect(temporadas[0]);

      }
      

    } catch (error) {
      console.error('Error al cargar las temporadas:', error);
    }
  };

  const fetchEpisodes = async seasonId => {
    try {

      // let ready = await Meteor.subscribe('capitulos', { idTemporada: seasonId }, { fields: { textSubtitle: 0 }}).ready();
      if (capitulos != null && capitulos.length > 0) {
        await setEpisodes(capitulos.filter((capitulo) => capitulo.idTemporada == seasonId).sort((a, b) => a.numeroCapitulo - b.numeroCapitulo));
      }
    } catch (error) {
      console.error('Error al cargar los capítulos:', error);
    }
  };

  const handleSeasonSelect = season => {
    setSelectedSeason(season);
    // fetchEpisodes(season._id);
  };

  const handleEpisodeClick = episode => {
    navigation.navigate('Peli', {
      urlVideo: episode.urlHTTPS,
      subtitulo: episode.subtitulo,
      isSerie: true,
      _id: episode._id,
    });
  };

  const renderSeason = ({item}) =>
    <TouchableOpacity
      onfocus={() => {setFocusTemporada(item.numeroTemporada)}}
      style={{
        padding: 15,
        margin: 5,
        marginLeft: "5%",
        backgroundColor: active == item._id ? theme.colors.onPrimary : (focusTemporada == item._id ? theme.colors.onPrimary : theme.colors.secondaryContainer),
        borderRadius: 30, 
        width: "80%"
      }}
      activeOpacity={focusTemporada == item.numeroTemporada ? 1 : 0.7}
      onPress={() => {
        setActive(item._id);
        handleSeasonSelect(item);
      }}
    >
      <Text>{`Temporada ${item.numeroTemporada}`}</Text>
    </TouchableOpacity>


  const renderEpisode = ({item}) => {
    return <TouchableOpacity
      style={{
        // width: "30%",
        borderRadius: 10,
        opacity: (focusEpisodio && focusEpisodio._id) === item._id ? 1 : 0.5,
      }}
      onFocus={() => setFocusEpisodio(item)}
      // onBlur={() => setFocusEpisodio(null)}
      onPress={() => handleEpisodeClick(item)}>
      <Surface
        style={{
          width: 200,
          // height: 150,
          padding: 0,
          margin: 10,
          borderRadius: 10,
          // backgroundColor: 'rgba(20, 20, 20, 1)',
        }}>
        {/* se le puso false para que no mostrara las imagenes */}
        {
          
        true ? (
          <ImageBackground
            source={{
              uri: item.urlBackgroundHTTPS || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
            }}
            style={styles.image}
            imageStyle={{borderRadius: 10}}>
            <View style={styles.overlay}>
              <Text style={[styles.title2, {color: theme.colors.onSurface}]}>
                Capitulo {item.capitulo}
              </Text>
              {/* <Text
                style={[styles.description, {color: theme.colors.onSurface}]}>
                Description: {item.descripcion}
              </Text> */}
              {/* <Text style={[styles.views, {color: theme.colors.onSurface}]}>
                Vistas: {item.vistas} Extension: {item.extension}
              </Text> */}
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.overlay}>
            <Text style={[styles.title2]}>{item.nombre}</Text>
            <Text style={[styles.description]}>Description: {item.descripcion}</Text>
            <Text style={[styles.views]}>Vistas: {item.vistas}</Text>
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  };
    

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
          {/* <Text>
            Sign Out
          </Text> */}
          {/* <Icon source={'home'} isTVSelectable={false} size={25} /> */}
          <View style={{flexDirection: 'row'}}>
            {/* <Appbar.Action icon={'home'} disabled isTVSelectable={false} /> */}
            <Text style={{fontSize: 20}}>{`Welcome, ${userName}`}</Text>
          </View>
        </View>
      </Appbar.Header>
      <Surface style={styles.menuLateral}>
        <View
          style={{
            flex: 0.3,
            // backgroundColor: 'rgba(20, 20, 20, 0.73)',
          }}>
          <Drawer.Section
            title="Select 1 Season:"
            showDivider={false}
            style={{
              height: '100%',
              width: 200,
            }}>

            <FlatList
              key={item => item._id}
              data={seasons}
              renderItem={renderSeason}
              // keyExtractor={item => item._id}
              
              style={styles.list}
              decelerationRate={0.9}
                  bouncesZoom={true}
                  bounces={true}
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
            <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <View>
                  <CardInfoSerie item={focusEpisodio} />
                  {/* {focusEpisodio && <VideoPlayer
                    ocultarControles={true}
                    navigation={navigation}
                    route={{
                      params: {
                        _id: focusEpisodio && focusEpisodio._id,
                        isSerie: true,
                        urlVideo: focusEpisodio && focusEpisodio.url,
                        subtitulo: focusEpisodio && focusEpisodio.subtitulo,
                      },
                    }}
                    //   urlVideo={focusEpisodio.url}
                    //   subtitulo={focusEpisodio.subtitulo}
                  />} */}
                </View>
              </View>

            {selectedSeason && (
              <>
                {/* <Text style={styles.title}>
                  Capítulos de la Temporada {selectedSeason.numeroTemporada}
                </Text> */}
                <FlatList
                  // numColumns={2}
                  key={item => item._id}
                  data={episodes}
                  renderItem={renderEpisode}
                  horizontal={true}
                  // keyExtractor={item => item._id}
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
      </Surface>
    </>
  );
};

const SeriesDetails = withTracker(({route,navigation, clasificacion, filtro}) => {
  const {idSerie} = route.params;
    const ready = Meteor.subscribe('capitulos', {idSerie: idSerie}).ready();
    const temporadas = TemporadasCollection.find(
      {idSerie: idSerie},
      {sort: {nombre: 1}},
    ).fetch();


  // Extraer todos los IDs de las temporadas
  let idTemporadas = temporadas.map((temporada) => temporada._id);

  // Usar `$in` para suscribirse a múltiples IDs de temporadas
  const readyCapitulos = Meteor.subscribe(
    'capitulos',
    { idTemporada: { $in: idTemporadas } },
    {
      fields: {
        nombre: 1,
        // url: 1, urlBackground: 1,
        urlHTTPS: 1, urlBackgroundHTTPS: 1,  descripcion: 1, subtitulo: 1, idTemporada: 1, capitulo: 1, extension: 1, mostrar: 1, createdAt: 1, vistas: 1, },
    },
  ).ready();
  // "_id" : "C6yBQ2zRbBBQhizuD",
  //   "nombre" : "Lo que se avecina S05E01",
  //   "url" : "http://www.vidkar.com:3005/Series/Espanol/Lo%20que%20se%20avecina/LQSA%2015/LQSA%2015x1.mp4",
  //   "urlBackground" : null,
  //   "descripcion" : "Lo que se avecina",
  //   "subtitulo" : null,
  //   "idTemporada" : "KfAWZsKYANxDQAB2M",
  //   "capitulo" : 1,
  //   "extension" : "mp4",
  //   "urlHTTPS" : "https://www.vidkar.com:3006/Series/Espanol/Lo%20que%20se%20avecina/LQSA%2015/LQSA%2015x1.mp4",
  //   "urlBackgroundHTTPS" : null,
  //   "urlTrailer" : "",
  //   "mostrar" : true,
  //   "createdAt" : ISODate("2024-12-28T18:35:01.267+0000"),
  //   "vistas" : 0,
  //   "textSubtitle" : ""
  const capitulos = readyCapitulos && CapitulosCollection.find(
    {idTemporada:  { $in: idTemporadas }},
    {
      fields: { nombre: 1, 
        // url: 1, urlBackground: 1,
        urlHTTPS: 1, urlBackgroundHTTPS: 1,  descripcion: 1, subtitulo: 1, idTemporada: 1, capitulo: 1, extension: 1, mostrar: 1, createdAt: 1, vistas: 1, },
    sort: {capitulo: 1}},
  ).fetch();
  return {
    navigation,
    route,
    ready: ready,
    clasificacion,
    temporadas,
    readyCapitulos,
    capitulos
  };
})(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'rgb(20, 20, 20)',
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
    // backgroundColor: 'rgba(20, 20, 20, 1)',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    // padding: 20,
  },
  image: {
    width: '100%',
    height: 150,
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
    // fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    // fontSize: 16,
    marginVertical: 5,
  },
  views: {
    fontSize: 14,
  },
});

export default SeriesDetails;
