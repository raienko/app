import Component from './index.tsx';
import {smokeTest} from '~/__mocks__';
jest.useFakeTimers();
smokeTest(Component);
