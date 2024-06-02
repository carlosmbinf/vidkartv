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
  }

  componentWillUnmount() {
    // Orientation.unlockAllOrientations();
  }

  constructor(props) {
    // const handle = Meteor.subscribe('pelis');
    // const myTodoTasks = PelisRegister.find({}).fetch();
    // console.log(props.myTodoTasks);
    super(props);
    this.flatListRef = React.createRef();
    this.state = {
      data: this.props.pelis,
      isLoading: this.props.pelis ? true : false,
    };

    console.log('props', this.state);
    // const isDarkMode = useColorScheme() === 'dark';
    // const [data, setData] = ;
    // const [isLoading, setLoading] = useState(true);
    // const carouselRef = useRef(null);
  }

  render() {
    const {navigation} = this.props;
    // console.log("navigation" , navigation);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          maxHeight: 300,
        }}>
        {this.state.isLoading && (
          // <CardPeli item={this.state.data[0]}/>
          <FlatList
            ref={this.flatListRef}
            focusable={true}
            accessible={true}
            data={this.state.data}
            renderItem={({item}) => (
              <CardPeli item={item} navigation={navigation} />
            )}
            horizontal={true}
            scrollEnabled={true}
            keyExtractor={item => item._id} // Asegúrate de tener una key única
          />
        )}
      </View>
    );
  }
}

const HomeServices = withTracker(({navigation}) => {
  // console.log(navigation);
  let ready = Meteor.subscribe('pelis', {
    clasificacion: 'Sci-Fi',
  }).ready();
  let pelis = PelisRegister.find(
    {clasificacion: 'Sci-Fi'},
    {fields: {nombrePeli: 1, urlBackground: 1, urlPeli: 1}},
  ).fetch();

  // console.log('pelis', pelis);
  return {
    navigation,
    pelis,
  };
})(App);

export default HomeServices;
