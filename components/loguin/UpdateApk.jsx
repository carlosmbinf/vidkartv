import React from 'react';
import {StyleSheet, View, ImageBackground, Text} from 'react-native';
import {Button, Card, Title} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';

const UpdateApk = ({navigation}) => {
  const handleUpdate = () => {
    // Lógica para redirigir a la actualización de la APK
    console.log('Redirigiendo a la actualización de la APK');
    // Aquí puedes agregar la lógica para redirigir a la tienda de aplicaciones o iniciar la descarga
  };

  // Obtener la versión de la aplicación
  const appVersion = DeviceInfo.getVersion();
  const appBuildNumber = DeviceInfo.getBuildNumber();

  return (
    <ImageBackground
      source={{uri: 'https://path-to-your-background-image.jpg'}} // Reemplaza con la URL de tu imagen de fondo
      style={styles.background}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.container}>
          <Title style={styles.title}>Hay Una Actualización de la APK</Title>
          <Text style={styles.message}>
            Necesita actualizar la aplicación en su TV.
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.versionText}>
                Versión Actual: {appVersion} (Build {appBuildNumber})
              </Text>
              <Button
                mode="contained"
                onPress={handleUpdate}
                style={styles.button}>
                Actualizar Ahora
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
  versionText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
});

export default UpdateApk;
