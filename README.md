# VIDKAR TV

Aplicación independiente para Android TV basada en Expo. Reutiliza la cuenta, los contratos Meteor y el streaming HLS de VIDKAR, con una interfaz optimizada para control remoto/D-pad.

## Requisitos

- Node.js compatible con Expo SDK 54.
- Android Studio, SDK Android y un emulador o dispositivo Android TV.
- Development build o binario nativo: Expo Go no incluye VLC.

## Configuración

Copia `.env.example` como `.env` y ajusta únicamente los valores del entorno:

- `EXPO_PUBLIC_METEOR_URL`: WebSocket de Meteor.
- `EXPO_PUBLIC_HLS_SERVER_URL`: origen del servidor HLS.
- `EXPO_PUBLIC_EAS_PROJECT_ID`: proyecto EAS necesario para tokens de notificaciones push.

No incluyas credenciales, tokens ni valores de producción en el repositorio.

## Desarrollo

Instala las dependencias desde esta carpeta y genera el proyecto nativo con `expo prebuild`. Después, usa el script `android` para instalar la development build en un emulador/dispositivo TV.

Los scripts disponibles son `start`, `android`, `lint`, `typecheck`, `prebuild` y `build`.

## AAB Android TV en Codemagic

El workflow `android_tv_aab` solo genera y entrega `app-release.aab` como artefacto; no contiene publicación automática en Google Play. En Codemagic, configura el keystore compartido mediante `keystore_reference` y las variables protegidas `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS` y `CM_KEY_PASSWORD`. `CM_KEYSTORE_PATH` es opcional si la ruta montada no es `/vidkar-android/my-release.jks`.

El versionado usa `4.0.$VERSION_CODE`, donde `VERSION_CODE = 532 + PROJECT_BUILD_NUMBER`. Para una ejecución manual excepcional se puede definir `APP_VERSION_CODE` (o `CM_APP_VERSION_CODE`) y evitar una colisión previamente detectada.

Tras descargar el AAB, súbelo manualmente a una pista dedicada de Google Play configurada exclusivamente para Android TV. No se publica desde este repositorio ni desde Codemagic.

## Funcionalidad

- Login compartido con Android/iOS mediante `@meteorrn/core`.
- Catálogo de cursos con búsqueda, categorías, suscripciones, detalle de lecciones y reproducción directa protegida.
- Catálogo `pelis` y `series` con gate `subscipcionPelis`: solo se publican y renderizan cuando la suscripción está activa.
- Reproducción VLC sobre HLS por sesión, polling, cancelación y reintento.
- Controles grandes para reproducir/pausar, saltos de 10 segundos y ocultación de controles.
- Avance por película en `SecureStore` y diálogo para continuar viendo.
- Subtítulos VTT desde el contrato `/getsubtitle`.
- Registro de push mediante `push.registerToken`.
- Launcher Android TV exclusivo con `LEANBACK_LAUNCHER`, feature Leanback requerida, touchscreen opcional y banner TV.

## Rutas HLS utilizadas

La app conserva el contrato existente:

- `POST /peliculas/hls/:idPeli/prepare`
- `GET /peliculas/hls/:idPeli/status`
- `POST /peliculas/hls/:idPeli/:sessionId/cancel`
- `GET /peliculas/hls/:idPeli/:sessionId/index.m3u8`
- `GET /peliculas/hls/:idPeli/:sessionId/segment_*.ts`

La autorización de usuario y suscripción sigue siendo responsabilidad de Meteor y del servidor HLS; ocultar controles en la interfaz no concede acceso.

## Regla de contenido TV

- Toda cuenta autenticada puede entrar a la experiencia de cursos.
- Una cuenta sin `subscipcionPelis === true` ve únicamente cursos: no se suscribe a `pelis` ni `series`, no muestra sus pestañas y no puede abrir su reproductor mediante una ruta directa.
- Una cuenta con la suscripción activa ve cursos, películas y series en el mismo shell D-pad.
