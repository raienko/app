import React, {useRef, useState} from 'react';
import {
  WebView as RNWebView,
  WebViewMessageEvent,
  WebViewProps as RNWebViewProps,
} from 'react-native-webview';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
import {logger} from '~/src/utils';

import {
  createEventForWebView,
  parseEventFromWebView,
  WEBVIEW_EVENT_TYPES,
} from './types';

interface WebViewProps extends RNWebViewProps {
  uri?: string;
}

export default function WebView({uri, ...rest}: WebViewProps) {
  const [, setLoading] = useState(true);
  const ref = useRef<RNWebView>(null);

  if (!uri) {
    return null;
  }

  const handleEventFromWebView = (rawEvent: WebViewMessageEvent) => {
    const {type, data} = parseEventFromWebView(rawEvent.nativeEvent.data);
    logger.info('Event FROM WebView', {type, data});
    switch (type) {
      case 'TEST':
        // do something
        return true;
      default:
        // do something
        return false;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const passEventToVebView = (
    type: keyof typeof WEBVIEW_EVENT_TYPES,
    data?: any,
  ) => {
    const event = createEventForWebView(type, data);
    logger.info('Event TO WebView', {type, data});
    ref?.current?.postMessage(event);
  };

  const handleRedirection = (request: ShouldStartLoadRequest) => {
    return !!request;
    // const whiteList = ['google.com'];
    // const whitelisted = whiteList.some(i =>
    //   request.url?.startsWith(`https://${i}`),
    // );
    // return request.url === uri || whitelisted;
  };

  return (
    <RNWebView
      {...rest}
      ref={ref}
      source={{uri}}
      startInLoadingState
      originWhitelist={['*']}
      injectedJavaScript={injection}
      onMessage={handleEventFromWebView}
      javaScriptCanOpenWindowsAutomatically
      onShouldStartLoadWithRequest={handleRedirection}
      onLoadEnd={() => setLoading(false)}
      onError={() => setLoading(false)}
      // performance tweaks:
      useWebView2
      collapsable={false}
      cacheEnabled={false}
      domStorageEnabled={true}
      cacheMode="LOAD_NO_CACHE"
    />
  );
}

const zoomScaleFix = `
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  meta.setAttribute('name', 'viewport');
  document.head.appendChild(meta);
`;

const customCss = `
  const style = document.createElement('style');
  style.textContent = [
    'body { }',
  ].join('');
  document.head.appendChild(style);
`;

const injection = `(function() {
  ${zoomScaleFix}
  ${customCss}
})();`;
