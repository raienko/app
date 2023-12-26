import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {env} from '~/src/constants';
import store from '~/src/features/store';
import {logger} from './logger';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

export const userAgent = [
  `${Platform?.OS}(${DeviceInfo?.getSystemVersion?.()})`,
  `Version: ${DeviceInfo?.getVersion?.()}(${DeviceInfo?.getBuildNumber?.()})`,
  DeviceInfo?.getDeviceId?.(),
].join(' ');

let reqNumber = 0;

interface Config extends AxiosRequestConfig {
  useRawResponse?: boolean;
  formData?: object;
}
export default function request(uri: string, config: Config = {}) {
  config.headers = config.headers ?? {};
  config.baseURL = config.baseURL || env.baseUrl;
  const url = uri.includes('https://') ? uri : `${config.baseURL}/${uri}`;
  if (uri.includes('https://')) {
    config.baseURL = undefined;
  }

  const {headers} = config;
  headers.accept = 'application/json';
  headers.apikey = headers?.apikey || env.apiKey;
  headers.userInfo = headers?.userInfo || userAgent;

  const Authorization = store.getState()?.auth?.accessToken;
  if (Authorization) {
    config.headers = {
      Authorization,
      ...config.headers,
    };
  }

  if (config.formData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  const id = `[${reqNumber++}] ${url}`;
  logger.out(id, config);

  const handleResponse = async (response: AxiosResponse) => {
    logger.in(id, response.data, response);
    // do something with offline mode
    if (config.useRawResponse) {
      return response;
    }
    return response?.data;
  };

  const handleError = async (err: AxiosError) => {
    logger.error(id, err.message, err, err.response?.status);
    // @ts-ignore
    const error = new Error(err.response?.data?.error || err.message);
    //@ts-ignore
    error.status = err.response?.status;

    if (err.message?.toLowerCase() === 'network error') {
      // do something with offline mode
    } else {
      // do something with offline mode
    }
    throw error;
  };

  if (config.formData) {
    const formData = new FormData();
    Object.keys(config.formData).forEach(key =>
      // @ts-ignore
      formData.append(key, config?.formData?.[key]),
    );
    return axios
      .post(url, formData, config)
      .then(handleResponse)
      .catch(handleError);
  }

  return axios({url, ...config})
    .then(handleResponse)
    .catch(handleError);
}
