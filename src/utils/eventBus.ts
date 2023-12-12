// @ts-ignore
import events, {EventEmitter} from 'events';
import {useEffect} from 'react';

const emitter = new events.EventEmitter();

type EventListener = (payload?: any) => any;
export type EventKey = string;

class EventBus {
  _eventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this._eventEmitter = eventEmitter;
  }

  subscribe(event: EventKey, listener: EventListener) {
    this._eventEmitter.addListener(event, listener);
    return () => this.unsubscribe(event, listener);
  }

  unsubscribe(event: EventKey, listener: EventListener) {
    return this._eventEmitter.removeListener(event, listener);
  }

  dispatch(event: EventKey, payload?: any) {
    return this._eventEmitter.emit(event, payload);
  }
}

export const eventBus = new EventBus(emitter);

export const useEventBus = (eventKey: EventKey, listener: EventListener) => {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(eventKey, listener);
    return () => {
      unsubscribe();
    };
  }, []);
};
