import {startApp} from './tools';
import {checkHomeScreen} from '../src/screens/Home/index.e2e';
import {checkSystemScreen} from '../src/screens/System/index.e2e';
describe('Smoke test', () => {
  startApp();
  checkHomeScreen();
  checkSystemScreen();
});
