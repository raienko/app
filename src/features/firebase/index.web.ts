import Config from 'react-native-config';
import * as Firebase from 'firebase/app';
import * as RemoteConfig from 'firebase/remote-config';

const config = {
  apiKey: `${Config.FIREBASE_API_KEY}`,
  projectId: `${Config.FIREBASE_PROJECT_ID}`,
  databaseURL: `${Config.FIREBASE_DB_URL}`,
  authDomain: `${Config.FIREBASE_AUTH_DOMAIN}`,
  // OPTIONAL
  storageBucket: `${Config.FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${Config.FIREBASE_MESSAGING_SENDER_ID}`,
};

const app = Firebase.initializeApp(config);
const remoteConfig = RemoteConfig.getRemoteConfig(app);

export const fetchRemoteConfig = async (defaultConfig: any) => {
  remoteConfig.defaultConfig = defaultConfig;
  await RemoteConfig.fetchAndActivate(remoteConfig);
  return RemoteConfig.getAll(remoteConfig);
};
