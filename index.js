/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerNotificationBackgroundHandler } from './src/services/NotificationService';

registerNotificationBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
