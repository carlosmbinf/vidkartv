import React, {useEffect} from 'react';
import {Animated, ImageBackground, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Text, Image} from 'react-native-paper';

const CardPeli = props => {
  const {nombrePeli, urlBackground, urlPeli} = props.item;
  const {navigation} = props;
  const [mostrar, setMostrar] = React.useState(false);
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        paddingTop: 0,
        paddingBottom: 0,
        width: 175,
        opacity: focused ? 1 : 0.9,
      }}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{scale: scaleValue}],
          },
        ]}>
        <ImageBackground
          onLoadEnd={() => {
            console.log('onLoadEnd', nombrePeli);
            setMostrar(true);
          }}
          source={{uri: urlBackground}}
          style={{
            width: 150,
            height: 100,
            borderRadius: 10,
            justifyContent: 'flex-end',
          }}
          borderRadius={20}>
          <View style={styles.viewDescipcionPelis}>
            <LinearGradient
              colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
              style={styles.gradient}>
              <Text style={styles.textFontName}>{nombrePeli}</Text>
            </LinearGradient>
          </View>
        </ImageBackground>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    padding: 10,
    // backgroundColor: '$000000',
    marginRight: 10,
    marginTop: 10,
  },
  card: {
    // backgroundColor: '#000000',
    // padding: 10,
    // height: 150,
    borderRadius: 20,
    opacity: 1,
  },
  textFontName: {
    color: 'white',
    fontSize: 10,
  },
  viewDescipcionPelis: {
    height: '50%',
    bottom: 0,
    // backgroundColor:
    //   'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 5,
  },
});
export default CardPeli;
