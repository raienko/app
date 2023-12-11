import React from 'react';
import 'react-native';
import {render} from '@testing-library/react-native';

export const smokeTest = (Component: any, params?: any) => {
  test(`${Component?.name} renders correctly`, () => {
    render(<Component {...params} />);
  });
};
