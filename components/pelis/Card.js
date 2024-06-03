import React, {useEffect} from 'react';
import {Animated, ImageBackground, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Text, Image} from 'react-native-paper';

const CardPeli = props => {
  const {nombrePeli, urlBackground, urlPeli} = props.item;
  const {navigation} = props;
  const [mostrar, setMostrar] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const scaleValue = React.useRef(new Animated.Value(1)).current;
 

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.3 : 1, // Cambia el valor de escala
      friction: 5, // Ajusta la fricción para suavizar el efecto
      useNativeDriver: true,
    }).start();
  }, [focused, scaleValue]);

  return (
    <TouchableOpacity
      onFocus={e => {
        setFocused(true);
      }}
      onBlur={e => {
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
          loadingIndicatorSource={require('../../components/files/not-available-rubber-stamp-seal-vector.jpg')}
          style={{
            width: 150,
            height: 100,
            borderRadius: 10,
            justifyContent: 'flex-end',
          }}
          borderRadius={20}>
          <View style={styles.viewDescipcionPelis}>
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
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
    marginRight: 10,
    marginTop: 10,
  },
  card: {
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
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
  },
  gradient: {
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 5,
  },
});
export default CardPeli;
