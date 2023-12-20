import {logger} from './index';

describe('Testing logger:', () => {
  it('smoke test', () => {
    logger.prefixedLog('{color: red', 'Some');
    logger.styledLog('Some');
    logger.log('Some');
    logger.warn('Some');
    logger.info('Some');
    logger.error('Some');
    logger.success('Some');
    logger.in('Some');
    logger.out('Some');
  });
  it('test prod', () => {
    // @ts-ignore
    global.__DEV__ = false;
    expect(logger.log('Test')).toBe(null);
    // @ts-ignore
    global.__DEV__ = true;
  });
});
