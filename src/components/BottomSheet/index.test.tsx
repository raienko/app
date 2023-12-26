import {smokeTest} from '~/__mocks__';
import Component from './';

smokeTest(Component, {condition: false});
smokeTest(Component, {condition: true});
