import {useEffect} from 'react';
import {AppState} from 'react-native';
import {RemoteConfig} from '~/src/features/firebase';
import slice from './slice';
import store, {useStoreSelector} from '../store';

const defaultConfig = {}; // used when failed to fetch remote config

const setRemoteConfig = (config: any) =>
  store.dispatch(slice.actions.setRemoteConfig(config));

const setupRemoteConfig = () => {
  if (AppState.currentState !== 'active') {
    return;
  }

  return RemoteConfig()
    .setDefaults(defaultConfig)
    .then(() => RemoteConfig().fetch(0))
    .then(() => RemoteConfig().activate())
    .then(() => RemoteConfig().getAll())
    .then(config => {
      const data: {[key: string]: any} = {};

      Object.entries(config).forEach($ => {
        const [key, entry] = $;
        const rawValue = entry.asString();
        let value: any = rawValue;

        if (rawValue.match('true|false')) {
          value = rawValue === 'true';
        }

        const isValidNumber =
          rawValue.match(/\d/) && `${+rawValue}` === rawValue;
        if (isValidNumber) {
          value = +rawValue;
        }

        data[key] = value;
      });

      setRemoteConfig(data);
    });
};

export const useRemoteConfigSetup = () => {
  useEffect(() => {
    const listener = AppState.addEventListener('change', setupRemoteConfig);
    setupRemoteConfig();
    return () => {
      listener.remove();
    };
  }, []);
};

export const useRemoteConfig = () =>
  useStoreSelector(state => state.system.remoteConfig);

export const getRemoteConfig = () => store.getState().system.remoteConfig;

export const useRemoteConfigValue = (key: string) => {
  const remoteConfig = useRemoteConfig();
  return remoteConfig?.[key];
};

export const getRemoteConfigValue = (key: string) => {
  const remoteConfig = getRemoteConfig();
  return remoteConfig?.[key];
};
