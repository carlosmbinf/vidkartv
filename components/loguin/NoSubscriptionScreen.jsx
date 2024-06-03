import React from 'react';
import {StyleSheet, View, ImageBackground, Text} from 'react-native';
import {Button, Card, Title} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';

const NoSubscriptionScreen = ({navigation}) => {
  const handleLogout = () => {
    // Lógica para cerrar sesión en Meteor
    console.log('Cerrando sesión');
    Meteor.logout(() => {
    //   navigation.navigate('Login');
    });
  };

  return (
    <ImageBackground
      source={{uri: 'https://path-to-your-background-image.jpg'}} // Reemplaza con la URL de tu imagen de fondo
      style={styles.background}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.container}>
          <Title style={styles.title}>Hola {Meteor.user() && Meteor.user().profile.firstName}, No tienes una Suscripción Activa</Title>
          <Text style={styles.message}>
            Para acceder al contenido de VidKar, por favor adquiere una
            suscripción.
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.button}>
                Cerrar Sesión
              </Button>
            </Card.Content>
          </Card>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  container: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
});

export default NoSubscriptionScreen;
