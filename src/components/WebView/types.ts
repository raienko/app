export type WEBVIEW_EVENT = {
  event: 'app-event-bus';
  payload: {
    type: keyof typeof WEBVIEW_EVENT_TYPES;
    data: any;
  };
};

export enum WEBVIEW_EVENT_TYPES {
  'TEST' = 'TEST',
}

export const parseEventFromWebView = (rawEvent: string) => {
  const event: WEBVIEW_EVENT = JSON.parse(rawEvent);
  return event.payload;
};

export const createEventForWebView = (
  type: keyof typeof WEBVIEW_EVENT_TYPES,
  data: any,
) => {
  const event: WEBVIEW_EVENT = {
    event: 'app-event-bus',
    payload: {
      type,
      data,
    },
  };
  return JSON.stringify(event);
};
