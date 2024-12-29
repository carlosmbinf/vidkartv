import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Button, Card, Title, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';
const LoginScreen = () => {
  const [username, setUsername] = useState(''); // Estado para el campo de usuario
  const [password, setPassword] = useState(''); // Estado para el campo de contraseña
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const theme = useTheme();

  const loguear = () => {
    console.log('Logging in');
    Meteor.loginWithPassword(username, password, error => {
      if (error) {
        console.log(error);
      } else {
        console.log('Logged in');
      }
    });
  };
  useEffect(() => {
    // Enfocar el campo de usuario al cargar la pantalla
    usernameRef.current.focus();
  }, []);

  return (
    <ImageBackground
      source={{uri: 'https://path-to-your-background-image.jpg'}} // Reemplaza con la URL de tu imagen de fondo
      style={styles.background}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.container}>
          <Title style={styles.welcomeText}>Welcome to VidKar</Title>
          <Text style={styles.subTitle}>Streaming Movies</Text>

          <Card style={styles.card}>
            <Card.Content>
              <TouchableOpacity onPress={() => usernameRef.current.focus()} activeOpacity={0.5}>
                <TextInput
                  autoComplete="username"
                  ref={usernameRef}
                  value={username}
                  label="Usuario"
                  placeholder="Ingrese su usuario"
                  style={styles.input}
                  keyboardType="default"
                  underlineColorAndroid="transparent"
                  placeholderTextColor="#fff"
                  focusable={true}
                  importantForAccessibility="yes"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current.focus()} // Pasar el foco al siguiente campo
                  onChangeText={text => setUsername(text)}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => usernameRef.current.focus()} activeOpacity={0.5}>
                <TextInput
                  autoComplete="password"
                  ref={passwordRef}
                  value={password}
                  label="Contraseña"
                  placeholder="Ingrese su contraseña"
                  secureTextEntry
                  style={styles.input}
                  underlineColorAndroid="transparent"
                  placeholderTextColor="#fff"
                  focusable={true}
                  importantForAccessibility="yes"
                  returnKeyType="go"
                  onSubmitEditing={() => console.log('Logging in')}
                  onChangeText={text => setPassword(text)}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => loguear()} activeOpacity={0.5}>
              <Button
                mode="contained"
                textColor={theme.colors.onPrimaryContainer}
                style={[styles.button, {backgroundColor: theme.colors.primaryContainer}]}>
                Iniciar Sesión
              </Button>
              </TouchableOpacity>
              
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
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  subTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginBottom: 20,
    color: '#fff',
  },
  button: {
    marginTop: 20,
    // backgroundColor: '#6200ee',
  },
});

export default LoginScreen;
