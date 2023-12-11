import {RefObject} from 'react';
import ref from './ref';

class Navigation {
  _navigation: any;

  constructor(navigation: RefObject<any>) {
    this._navigation = navigation;
  }

  navigate(screen: string, params?: object) {
    return this._navigation?.navigate(screen, params);
  }

  goBack() {
    return this._navigation?.goBack();
  }

  getParams() {
    return this._navigation?.getCurrentRoute()?.params || {};
  }

  getCurrentRoute() {
    return this._navigation?.getCurrentRoute()?.name;
  }
}

export default new Navigation(ref);
