import React from 'react';
import {StyleSheet, View, ImageBackground, Text, Alert} from 'react-native';
import {Button, Card, Title} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';
const NoConnectionScreen = () => {
  return (
    <ImageBackground
      source={{uri: ''}} // Reemplaza con la URL de tu imagen de fondo
      style={styles.background}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.container}>
          <Title style={styles.title}>Sin Conexión a Internet</Title>
          <Text style={styles.message}>
            Parece que no hay conexión a Internet. Por favor, verifica tu
            conexión y vuelve a intentarlo.
          </Text>
          <Card style={styles.card}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={() => {
                  // Alert.alert(JSON.stringify(Meteor.status()));
                  Meteor.reconnect();
                }}
                style={styles.button}>
                Reintentar
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

export default NoConnectionScreen;
