import React from 'react';
import {it} from '@jest/globals';
import renderer from 'react-test-renderer';

export const smokeTest = (Component: any, params?: any) => {
  it(`${Component?.name} renders correctly`, () => {
    renderer.create(<Component {...params} />);
  });
};
