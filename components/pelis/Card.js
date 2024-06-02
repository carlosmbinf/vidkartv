import React, {useEffect} from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Text} from 'react-native-paper';

const CardPeli = props => {
  const {nombrePeli, urlBackground, urlPeli} = props.item;
  const {navigation} = props;
  // console.log("navigation" , navigation);
  const [focused, setFocused] = React.useState(false);
  // const [nombrePeli, setNombrePeli] = React.useState();
  // const [urlBackground, setUrlBackground] = React.useState();
  // const [urlPeli, setUrlPeli] = React.useState();
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    console.log('props', props.item);
    // setNombrePeli(props.item.nombrePeli);
    // setUrlBackground(props.item.urlBackground);
    // setUrlPeli(props.item.urlPeli);
  }, [props.item]);

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1, // Cambia el valor de escala
      friction: 5, // Ajusta la fricción para suavizar el efecto
      useNativeDriver: true,
    }).start();
  }, [focused, scaleValue]);

  return (
    <TouchableOpacity
      onFocus={e => {
        // e.preventDefault();
        setFocused(true);
      }}
      onBlur={e => {
        // e.preventDefault();
        setFocused(false);
      }}
      onPress={() => {
        console.log('PRESS ' + nombrePeli);
        navigation.navigate('Peli', {
          urlPeli: urlPeli,
        });
      }}
      style={{
        // backgroundColor: focused ? 'black' : 'white',
        marginRight: 10,
        marginTop: 10,
        //ampliar el touchable
        // width: focused ? '100%' : '80%',
        // height: focused ? '100%' : '80%',
        // zoom: focused ? 1.2 : 1,
        opacity: focused ? 1 : 0.9,
      }}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{scale: scaleValue}],
          },
        ]}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{nombrePeli}</Text>
          <Image
            source={{uri: urlBackground ? urlBackground : ''}}
            style={{width: 200, height: 200}}
          />
          <Button title="Go to Details">Go to Details</Button>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    backgroundColor: '$000000',
    marginRight: 10,
    marginTop: 10,
  },
  card: {
    // backgroundColor: '#000000',
    padding: 20,
    height: 300,
    borderRadius: 8,
    opacity: 1,
  },
});
export default CardPeli;
