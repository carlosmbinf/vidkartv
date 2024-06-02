/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import MyCarousel from './components/components/MyCarousel';
import {Button, PaperProvider, Text} from 'react-native-paper';
import {VideoPlayer} from './components/video/VideoPlayer';
import {NavigationContainer} from '@react-navigation/native';
import Main from './components/Main/Main';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';

class MyApp extends React.Component {
  componentDidMount() {}

  componentWillUnmount() {}

  constructor(props) {
    super(props);
    // this.state = {
    //   data: this.props.pelis,
    //   isLoading: this.props.pelis ? true : false,
    // };
  }

  render() {
    const {isConected} = this.props;
    // const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
      // backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
      <NavigationContainer>
        <PaperProvider>
          <StatusBar
            barStyle={'light-content'} //isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          {isConected ? (
            <Main />
          ) : (
            <>
              <Text style={{fontSize: 30}}>OFFLINE</Text>
            </>
          )}
        </PaperProvider>
      </NavigationContainer>
    );
  }
}
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

const App = withTracker(() => {
  const isConected = Meteor.status().connected;
  console.log('isConected', isConected);
  return {isConected};
})(MyApp);

export default App;
