import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Button, Card, Title} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import RNFetchBlob from 'rn-fetch-blob';

const UpdateApk = ({navigation, apkUrl}) => {
  const [descargando, setDescargando] = useState(false);

  const handleUpdate = async () => {
    setDescargando(true);
    console.log('Iniciando la descarga del APK...');
    try {
      // Solicitar permisos en tiempo de ejecución (solo necesario para Android 6.0 y superior)
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permiso para Almacenamiento',
            message:
              'La aplicación necesita acceso al almacenamiento para descargar e instalar la actualización.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permiso denegado',
            'No se puede continuar sin el permiso de almacenamiento.',
          );
          setDescargando(false);
          return;
        }
      }

      const {config, fs} = RNFetchBlob;
      const downloadDir = fs.dirs.DownloadDir;
      const apkPath = `${downloadDir}/VidKarTV.apk`;

      config({
        fileCache: true,
        appendExt: 'apk',
        path: apkPath,
        indicator: true,
        overwrite: true,
        trusty: true,
      })
        .fetch('GET', apkUrl)
        .then(async res => {
          console.log('El APK se ha descargado en: ', res.path());
          // Iniciar la instalación del APK
          await RNFetchBlob.android.addCompleteDownload({
            title: 'APK descargado',
            description: 'La APK se ha descargado correctamente.',
            mime: 'application/vnd.android.package-archive',
            path: res.path(),
            showNotification: true,
            notification: true,
          });
          await RNFetchBlob.android.actionViewIntent(
            res.path(),
            'application/vnd.android.package-archive',
          );
          setDescargando(false);
          console.log('Descarga de APK finalizada.');
        })
        .catch(error => {
          console.error('Error al descargar el APK: ', error);
          Alert.alert(
            'Error',
            'No se pudo descargar el archivo de actualización.',
          );
          setDescargando(false);
          console.log('Descarga de APK finalizada.');
        });
    } catch (error) {
      console.error('Error en el manejo de la actualización: ', error);
      Alert.alert('Error', 'Ocurrió un error durante la actualización.');
      setDescargando(false);
      console.log('Descarga de APK finalizada.');
    }
  };

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
              <Button
                loading={descargando}
                disabled={descargando}
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
  button: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
});

export default UpdateApk;
