import {visibleById} from '../../../e2e/tools';

export const checkHomeScreen = () =>
  it('Should have Home screen', async () => {
    await visibleById('Home');
  });
