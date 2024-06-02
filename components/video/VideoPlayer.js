// Load the module

import {useRef} from 'react';
import {Alert, StyleSheet} from 'react-native';
import Video, {VideoRef} from 'react-native-video';

// Within your render function, assuming you have a file called
// "background.mp4" in your project. You can include multiple videos
// on a single screen if you like.

export const VideoPlayer = ({navigation, route}) => {
  const {urlPeli} = route.params;
  //  const videoRef = useRef<VideoRef>(null);
  //  const background = require(urlPeli);
  console.log(urlPeli);
  const onError = ({error}) => {
    Alert.alert('Error', error.errorString);
    console.error(error.errorString);
  };
  return (
    <Video
      // Can be a URL or a local file.
      bufferConfig={{
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 15000,
        bufferForPlaybackAfterRebufferMs: 15000,
      }}
      source={{uri: urlPeli}}
      // Store reference
      // ref={videoRef}
      // // Callback when remote video is buffering
      // onBuffer={onBuffer}
      // // Callback when video cannot be loaded
      onError={onError}
      paused={false}
      controls={true}
      auto
      style={styles.backgroundVideo}
      onBuffer={(buffer) => {
        console.log("Buffering: ", buffer);
      }}
      onLoad={(data) => {
        console.log("Loaded: ", data);
      }}
      onEnd={() => {
        console.log("Playback finished");
      }}
    />
  );
};

// Later on in your styles..
var styles = StyleSheet.create({
  backgroundVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});
