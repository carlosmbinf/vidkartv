import React from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';
import {Avatar, Button, Card, Text} from 'react-native-paper';
import {PelisRegister} from '../collections/collections';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';
import CardPeli from '../pelis/Card';

const LeftContent = props => <Avatar.Icon {...props} icon="folder" />;
class App extends React.Component {
  componentDidMount() {
    console.log('componentDidMount');
    // console.log(this.flatListRef.current);
    // this.flatListRef.current?.focus();
    // Orientation.lockToPortrait();
    console.log('componentDidMount');
    this.setState = {
      data: this.props.pelis,
      isReady: this.props.ready,
    };
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    // Orientation.unlockAllOrientations();
    this.state = {
      data: [],
      isReady: false,
    };
  }

  componentDidUpdate(prevProps) {
    console.log('componentDidUpdate');
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
    const {navigation, ready, pelis, clasificacion} = this.props;
    console.log('render');
    return (
      <>
        {ready ? (
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
              ref={this.flatListRef}
              focusable={true}
              accessible={true}
              data={pelis}
              renderItem={({item}) => (
                <CardPeli item={item} navigation={navigation} />
              )}
              horizontal={true}
              scrollEnabled={true}
              keyExtractor={item => item._id} // Asegúrate de tener una key única
            />
          </View>
        ) : (
          <Text>Loading...</Text>
        )}
      </>
    );
  }
}

const MainPelis = withTracker(({navigation, clasificacion}) => {
  // console.log(navigation);
  let ready = Meteor.subscribe(
    'pelis',
    {
      clasificacion: clasificacion,
    },
    {fields: {nombrePeli: 1, urlBackground: 1, urlPeli: 1, clasificacion: 1}},
  ).ready();
  let pelis = ready
    ? PelisRegister.find(
        {clasificacion: clasificacion},
        {fields: {nombrePeli: 1, urlBackground: 1, urlPeli: 1}},
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
