import React from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';
import { Appbar, Avatar, Button, Card, Text } from 'react-native-paper';
import {
  CapitulosCollection,
  PelisRegister,
  SeriesCollection,
  TemporadasCollection,
} from '../collections/collections';
import Meteor, { Mongo, withTracker } from '@meteorrn/core';
import CardPeli from '../pelis/Card';
import CardSerie from '../series/CardSerie';

const LeftContent = props => <Avatar.Icon {...props} icon="folder" />;
class App extends React.Component {
  componentDidMount() {
    // this.flatListRef.current?.focus();
    // Orientation.lockToPortrait();
    // console.log('componentDidMount');
    this.setState = {
      data: this.props.pelis,
      isReady: this.props.ready,
    };
  }

  componentWillUnmount() {
    // console.log('componentWillUnmount');
    // Orientation.unlockAllOrientations();
    this.state = {
      data: [],
      isReady: false,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate');
    // console.log('this.props.pelis', this.props.pelis);
    // console.log('isReady', this.props.ready);
  }

  constructor(props) {
    // const handle = Meteor.subscribe('pelis');
    // const myTodoTasks = PelisRegister.find({}).fetch();
    // console.log(props.myTodoTasks);
    super(props);
    this.flatListRef = React.createRef();
    this.state = {
      data: [],
      isReady: false,
    };

    // console.log('props', this.state);
    // const isDarkMode = useColorScheme() === 'dark';
    // const [data, setData] = ;
    // const [isLoading, setLoading] = useState(true);
    // const carouselRef = useRef(null);
  }

  render() {
    const { navigation, ready, series, clasificacion } = this.props;
    // console.log('render', ready, pelis, clasificacion);

    return (
      <>
        {series && series.length > 0 && (
          <View
            style={{
              paddingTop: 50,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: 190,
            }}>
            <View style={{ width: '100%' }}>
              <Text style={{ color: '#e5e5e5' }} minimumFontScale={10}>
                {clasificacion.toUpperCase()}
              </Text>
            </View>
            <FlatList
              ref={this.flatListRef}
              focusable={true}
              accessible={true}
              data={series}
              renderItem={({ item }) => (
                <CardSerie item={item} navigation={navigation} />
              )}
              style={{ minWidth: '100%' }}
              horizontal={true}
              scrollEnabled={true}
              keyExtractor={item => item._id} // Asegúrate de tener una key única
              initialNumToRender={10}
              maxToRenderPerBatch={20}
              removeClippedSubviews={true}
            />
          </View>
        )}
      </>
    );
  }
}

const MainSeries = withTracker(({ navigation, clasificacion, filtro }) => {
  let readySeries = Meteor.subscribe('series', filtro ? {
    clasificacion: clasificacion,
    $or: [
      { nombre: { $regex: filtro, $options: 'i' } }, // 'i' hace que sea insensible a mayúsculas/minúsculas
      { anoLanzamiento: parseInt(filtro) || 0 }, // 'i' hace que sea insensible a mayúsculas/minúsculas
      { actors: { $regex: filtro, $options: 'i' } },
    ],
  } : { clasificacion: clasificacion }, { limit: 50 }).ready();

  let series = readySeries
    ? SeriesCollection.find(filtro ? {
      clasificacion: clasificacion,
      $or: [
        { nombre: { $regex: filtro, $options: 'i' } }, // 'i' hace que sea insensible a mayúsculas/minúsculas
        { anoLanzamiento: parseInt(filtro) || 0 }, // 'i' hace que sea insensible a mayúsculas/minúsculas
        { actors: { $regex: filtro, $options: 'i' } },
      ],
    } : { clasificacion: clasificacion }, { limit: 50 }).fetch()
    : null;

  return {
    navigation,
    series,
    ready: readySeries,
    clasificacion,
  };
})(App);

export default MainSeries;
