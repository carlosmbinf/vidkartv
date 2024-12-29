import React from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';
import {Appbar, Avatar, Button, Card, Text} from 'react-native-paper';
import {PelisRegister} from '../collections/collections';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';
import CardPeli from '../pelis/Card';

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
    const {navigation, ready, pelis, clasificacion, filtro} = this.props;
    // console.log('render', ready, pelis, clasificacion);

    return (
      <>
        {ready && pelis && pelis.length > 0 && (
          <View
            style={{
              paddingTop: 50,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: 190,
            }}>
            <View style={{width: '100%'}}>
              <Text style={{color: '#e5e5e5'}} minimumFontScale={10}>
                {clasificacion.toUpperCase()}
              </Text>
            </View>
            <FlatList
            viewabilityConfig={{
      waitForInteraction: true,
      viewAreaCoveragePercentThreshold: 95
  }}
            progressViewOffset={5}
              ref={this.flatListRef}
              focusable={true}
              accessible={true}
              data={pelis}
              isTVSelectable={true}
              renderItem={({item}) => (
                <CardPeli item={item} navigation={navigation} />
              )}
              style={{minWidth: '100%'}}
              horizontal={true}
              scrollEnabled={true}
              keyExtractor={item => item._id} // Asegúrate de tener una key única
              initialNumToRender={10}
              maxToRenderPerBatch={20}
              removeClippedSubviews={false}
            />
          </View>
        )}
      </>
    );
  }
}

const MainPelis = withTracker(({navigation, clasificacion, filtro}) => {
  // console.log(navigation);
  // Construye dinámicamente los filtros
let query = { clasificacion: clasificacion }; // Campo obligatorio

if (filtro) {
  query.nombrePeli = { $regex: filtro, $options: "i" }; // Agrega el filtro dinámicamente
}
  let ready = Meteor.subscribe(
    'pelis', filtro ? {
      clasificacion: clasificacion,
      $or: [
        { nombrePeli: { $regex: filtro, $options: 'i' } }, // 'i' hace que sea insensible a mayúsculas/minúsculas
        { year: parseInt(filtro) || 0 }, // 'i' hace que sea insensible a mayúsculas/minúsculas
        { extension: { $regex: filtro, $options: 'i' } },
        { actors: { $regex: filtro, $options: 'i' } }
      ],
    } : { clasificacion: clasificacion },
    {
      fields: {
        _id: 1,
        nombrePeli: 1,
        // urlBackground: 1,
        urlPeli: 1,
        clasificacion: 1,
        subtitulo: 1,
        vistas: 1,
        extension: 1,
        year: 1,
        actors: 1,
      },
      sort: { vistas: -1 },
      limit: 20,
    },
  ).ready();
  //ordenar por vistas
  let pelis = ready
    ? PelisRegister.find(filtro ? {
      clasificacion: clasificacion,
      $or: [
        { nombrePeli: { $regex: filtro, $options: 'i' } }, // 'i' hace que sea insensible a mayúsculas/minúsculas
        { year: { $regex: filtro, $options: 'i' } }, // 'i' hace que sea insensible a mayúsculas/minúsculas
        { extension: { $regex: filtro, $options: 'i' } },
        { actors: { $regex: filtro, $options: 'i' } }
      ],
    } : { clasificacion: clasificacion },
        {
          fields: {
            _id: 1,
            nombrePeli: 1,
            // urlBackground: 1,
            urlPeli: 1,
            subtitulo: 1,
            vistas: 1,
            extension: 1,
            year: 1,
            actors: 1,
          },
          sort: { vistas: -1 },
          limit: 30,
        },
      ).fetch()
    : null;

  // console.log('pelis', pelis);
  return {
    navigation,
    pelis,
    ready,
    clasificacion,
  };
})(App);

export default MainPelis;
