import Config from 'react-native-config';

const config = {
  apiKey: `${Config.FIREBASE_API_KEY}`,
  projectId: `${Config.FIREBASE_PROJECT_ID}`,
  databaseURL: `${Config.FIREBASE_DB_URL}`,
  authDomain: `${Config.FIREBASE_AUTH_DOMAIN}`,
  // OPTIONAL
  storageBucket: `${Config.FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${Config.FIREBASE_MESSAGING_SENDER_ID}`,
};

export const RemoteConfig = () => {};
