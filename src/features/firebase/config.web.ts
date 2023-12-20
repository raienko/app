import Config from 'react-native-config';
// @ts-ignore
import {FirebaseOptions, initializeApp} from '@firebase/app';

const config: FirebaseOptions = {
  appId: `${Config.FIREBASE_APP_ID}`,
  apiKey: `${Config.FIREBASE_API_KEY}`,
  projectId: `${Config.FIREBASE_PROJECT_ID}`,
  databaseURL: `${Config.FIREBASE_DB_URL}`,
  authDomain: `${Config.FIREBASE_AUTH_DOMAIN}`,
  // OPTIONAL
  storageBucket: `${Config.FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${Config.FIREBASE_MESSAGING_SENDER_ID}`,
};

export const app = initializeApp(config);
