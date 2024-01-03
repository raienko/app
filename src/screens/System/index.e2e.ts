import {visibleById} from '../../../e2e/tools';

export const checkSystemScreen = () =>
  it('Should have System screen', async () => {
    await visibleById('System');
  });
