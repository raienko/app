import detox from 'detox';

describe('Root', () => {
  beforeAll(async () => {
    await detox.device.launchApp();
    await detox.device.setURLBlacklist([
      'https://google.com',
      'https://firebaseinstallations.googleapis.com/*',
      'https://device-provisioning.googleapis.com/checkin',
    ]);
  });

  beforeEach(async () => {
    await detox.device.reloadReactNative();
  });

  it('Should have home screen', async () => {
    await detox.expect(element(by.id('Home'))).toBeVisible();
  });
});
