import {AppRegistry} from 'react-native';
import Root from '~/src/root';
import {name} from './package.json';
// Web support:
import {isWeb} from '~/src/utils';
import {createRoot} from 'react-dom/client';

AppRegistry.registerComponent(name, () => Root);
if (isWeb) {
  const root = createRoot(document.getElementById('root'));
  root.render(<Root />);
}
