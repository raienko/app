// @ts-ignore
import detox from 'detox';
export const findById = (id: string) => detox.element(detox.by.id(id));
export const findByLabel = (id: string, index = 0) =>
  detox.element(detox.by.label(id)).atIndex(index);
export const findByText = (id: string, index = 0) =>
  detox.element(detox.by.text(id)).atIndex(index);

export const typeTextById = async (id: string, text: string) => {
  const input = await findById(id);
  return input.typeText(text);
};

export const setTextById = async (id: string, text: string) => {
  const input = await findById(id);
  return input.replaceText(text);
};

export const pressById = async (id: string, point?: {x: number; y: number}) =>
  findById(id).tap(point);

export const existsById = async (id: string) =>
  detox.expect(findById(id)).toExist();
export const visibleById = async (id: string) =>
  detox.expect(findById(id)).toBeVisible();

export const existsByText = async (text: string, index?: number) =>
  detox.expect(findByText(text, index)).toExist();
export const visibleByText = async (text: string, index?: number) =>
  detox.expect(findByText(text, index)).toBeVisible();

export const iOS = detox.device.getPlatform() === 'ios';
export const android = !iOS;

export const waitFor = (timeout = 1000) =>
  new Promise(resolve => setTimeout(() => resolve(true), timeout));
export const toBackgroundAndBack = async () => {
  await detox.device.sendToHome();
  await detox.device.launchApp({newInstance: false});
};
export const inform = (message: string) => detox.log.info(message);
export const notVisibleById = (id: string) =>
  detox.expect(findById(id)).not.toBeVisible();

export const notVisibleByText = (text: string) =>
  detox.expect(findByText(text)).not.toBeVisible();

export const startApp = (config?: Detox.DeviceLaunchAppConfig) => {
  beforeAll(async () => {
    await detox.device.launchApp(config);
    await detox.device.setURLBlacklist([
      'https://google.com',
      'https://firebaseinstallations.googleapis.com/*',
      'https://device-provisioning.googleapis.com/checkin',
    ]);
  });
};
