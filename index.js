/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Meteor, {Mongo, withTracker} from '@meteorrn/core';

Meteor.connect('ws://vidkar.ddns.net:6000/websocket');
AppRegistry.registerComponent(appName, () => App);
