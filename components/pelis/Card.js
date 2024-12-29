import React, {useEffect} from 'react';
import {
  Animated,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Text, Image, Surface, Chip} from 'react-native-paper';
import FastImage from 'react-native-fast-image';

const CardPeli = props => {
  const {nombrePeli, urlBackground, urlPeli, subtitulo, _id, extension, year, vistas} = props.item;
  const idPeli = _id;
  const {navigation} = props;
  const [mostrar, setMostrar] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  // console.log('CardPeli', props.item);
  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1, // Cambia el valor de escala
      friction: 3, // Ajusta la fricción para suavizar el efecto
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity
      focusable={true}
      onFocus={e => {
        setFocused(true);
        console.log('FOCUS ' + nombrePeli);
      }}
      onBlur={e => {
        setFocused(false);
      }}
      onPressIn={() => {
        console.log('PRESS IN ' + nombrePeli);
      }}
      onPress={() => {
        console.log('PRESS ' + nombrePeli);
        navigation.navigate('Peli', {
          urlVideo: urlPeli,
          subtitulo: subtitulo,
          idPeli: idPeli,
        });
      }}
      isTVSelectable={true}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        paddingTop: 0,
        paddingBottom: 0,
        width: 175,
        opacity: focused ? 1 : 0.9,
        paddingLeft: 40,
      }}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{scale: scaleValue}],
          },
        ]}>
        <FastImage
          style={{
            width: 150,
            height: 100,
            borderRadius: 20,
            justifyContent: 'flex-end',
            backgroundColor: 'black',
          }}
          source={{
            uri: "https://www.vidkar.com/imagenesPeliculas?calidad=low&&idPeli="+idPeli,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
          renderToHardwareTextureAndroid={true}
          onLoadEnd={() => {
            console.log('onLoadEnd', nombrePeli);
          }}
          onError={e => {
            console.log('onError', "https://www.vidkar.com/imagenesPeliculas?calidad=low&&idPeli="+idPeli);
          }}
          borderRadius={20}
        >
          <View style={styles.viewDescipcionPelisTop}>
            <><Text style={[styles.textFontName, { paddingRight: 10, paddingTop: 5 }]}>{vistas} Vistas</Text></>
            <Text style={[styles.textFontName, { paddingLeft: 10, paddingTop: 5 }]}>{year}</Text>
          </View>
          <View style={styles.viewDescipcionPelis}>
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
              style={styles.gradient}>
              <Text style={styles.textFontName}>{nombrePeli}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'left', width: '100%', paddingLeft: 10, paddingBottom: 5 }}>
                {extension && <Chip textStyle={{fontSize:7, width:'100%', height:'70%', }} elevated={true} style={{ width: 45, height: 15, alignContent: 'center', justifyContent: 'center', alignItems: 'center' }} >{extension}</Chip>}
              </View>
            </LinearGradient>
          </View>
        </FastImage>

        {/* <ImageBackground
          // onLoadEnd={() => {
          //   // console.log('onLoadEnd', nombrePeli);
          //   setMostrar(true);
          // }}
          // onError={e => {
          //   console.log('onError', urlBackground);
          //   setMostrar(false);
          // }}
          source={{uri: "https://www.vidkar.com/imagenesPeliculas?calidad=low&&idPeli="+idPeli}}
          // defaultSource={require('../../components/files/not-available-rubber-stamp-seal-vector.jpg')}
          // loadingIndicatorSource={require('../../components/files/not-available-rubber-stamp-seal-vector.jpg')}
          progressiveRenderingEnabled={true}
          style={{
            width: 150,
            height: 100,
            borderRadius: 20,
            justifyContent: 'flex-end',
            backgroundColor: 'black',
          }}
          borderRadius={20}>
          <View style={styles.viewDescipcionPelis}>
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
              style={styles.gradient}>
              <Text style={styles.textFontName}>{nombrePeli}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'left', width: '100%', paddingLeft: 10, paddingBottom: 5 }}>
                {extension && <Chip textStyle={{fontSize:7, width:'100%', height:'70%', }} elevated={true} style={{ width: 45, height: 15, alignContent: 'center', justifyContent: 'center', alignItems: 'center' }} >{extension}</Chip>}
              </View>
            </LinearGradient>
          </View>
        </ImageBackground> */}
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
    flexWrap: 'wrap',
  },
  viewDescipcionPelis: {
    height: '50%',
    bottom: 0,
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
  },
  viewDescipcionPelisTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding:5,
    justifyContent: 'space-between',
    height: '50%',
    top: 0,
    borderTopEndRadius: 20,
    borderTopLeftRadius: 20,
  },
  gradient: {
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    // padding: 5,
  },
});
export default CardPeli;
