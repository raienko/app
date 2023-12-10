import {AppRegistry} from 'react-native';
import Root from '~/src/root';
import {name} from './package.json';

AppRegistry.registerComponent(name, () => Root);
