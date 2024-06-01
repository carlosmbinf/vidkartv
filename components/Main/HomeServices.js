//componente react native home Pelis
import React from 'react';
import {View, ScrollView, FlatList, Image} from 'react-native';
import {VideoPlayer} from '../video/VideoPlayer';
import {Avatar, Button, Card, Text} from 'react-native-paper';
import PelisRegister from '../collections/collections';

const datosPelis = [
  {
    id: 1,
    title: 'Peli 1',
    img: 'https://picsum.photos/200/300',
    urlPeli:
      'http://vidkar.ddns.net:3005/Peliculas/Extranjeras/2024/5lbs%20Of%20Pressure%20(2024)/5lbs.Of.Pressure.2024.720p.WEBRip.x264.AAC-LAMA.mp4',
  },
  {
    id: 2,
    title: 'Peli 2',
    img: 'https://picsum.photos/200/300',
    urlPeli:
      'http://vidkar.ddns.net:3005/Peliculas/Extranjeras/2024/5lbs%20Of%20Pressure%20(2024)/5lbs.Of.Pressure.2024.720p.WEBRip.x264.AAC-LAMA.mp4',
  },
  {
    id: 3,
    title: 'Peli 3',
    img: 'https://picsum.photos/200/300',
    urlPeli:
      'http://vidkar.ddns.net:3005/Peliculas/Extranjeras/2024/5lbs%20Of%20Pressure%20(2024)/5lbs.Of.Pressure.2024.720p.WEBRip.x264.AAC-LAMA.mp4',
  },
  {
    id: 4,
    title: 'Peli 4',
    img: 'https://picsum.photos/200/300',
    urlPeli:
      'http://vidkar.ddns.net:3005/Peliculas/Extranjeras/2024/5lbs%20Of%20Pressure%20(2024)/5lbs.Of.Pressure.2024.720p.WEBRip.x264.AAC-LAMA.mp4',
  },
  {
    id: 5,
    title: 'Peli 5',
    img: 'https://picsum.photos/200/300',
    urlPeli:
      'http://vidkar.ddns.net:3005/Peliculas/Extranjeras/2024/5lbs%20Of%20Pressure%20(2024)/5lbs.Of.Pressure.2024.720p.WEBRip.x264.AAC-LAMA.mp4',
  },
];
const LeftContent = props => <Avatar.Icon {...props} icon="folder" />;
export const App = ({navigation}) => {
  const Item = ({title, img, urlPeli}) => {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>{title}</Text>
        <Image source={{uri: img}} style={{width: 200, height: 300}} />
        <Button
          title="Go to Details"
          onPress={() =>
            navigation.navigate('Peli', {
              urlPeli: urlPeli,
            })
          }>
          Go to Details
        </Button>
      </View>
    );
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <FlatList
        data={datosPelis}
        renderItem={({item}) => Item(item)}
        horizontal={true}>
        <Card>
          <Card.Title
            title="Card Title"
            subtitle="Card Subtitle"
            left={LeftContent}
          />
          <Card.Content>
            <Text variant="titleLarge">Card title</Text>
            <Text variant="bodyMedium">Card content</Text>
          </Card.Content>
          <Card.Cover source={{uri: 'https://picsum.photos/700'}} />
          <Card.Actions>
            <Button>Cancel</Button>
            <Button>Ok</Button>
          </Card.Actions>
        </Card>
      </FlatList>
      <Text>Home Pelis</Text>
      <Button
        title="Go to Details"
        onPress={() =>
          navigation.navigate('Peli', {
            urlPeli:
              'http://vidkar.ddns.net:3005/Peliculas/Extranjeras/2024/5lbs%20Of%20Pressure%20(2024)/5lbs.Of.Pressure.2024.720p.WEBRip.x264.AAC-LAMA.mp4',
          })
        }>
        Go to Details
      </Button>
    </View>
  );
};

let HomeServices = withTracker(props => {
  let ready = Meteor.subscribe('pelis', {clasificacion: 'Sci-Fi'}).ready;
  let pelis = PelisRegister.find({clasificacion: 'Sci-Fi'}).fetch();

  return {
    props,
    pelis,
    ready,
  };
})(App);

export default HomeServices;
