import { EventEmitter } from "events";

/**
 * A typed pub/sub bus — `emit`/`on` are checked against an events map, so a
 * payload's shape can't drift from its event name at any call site. Backed
 * by the "events" npm package (the same Node-`EventEmitter`-compatible
 * implementation bundlers polyfill Node's own "events" module with — works
 * the same in RN/web here), not a bespoke implementation.
 *
 * Generic and standalone on purpose — anything needing "fire an event here,
 * react to it somewhere else with no direct reference between the two" can
 * create its own bus instead of writing this plumbing again. Modal
 * (src/components/modal/event-bus.ts) is the first consumer: showing/hiding
 * a modal by `id` from anywhere without threading a ref through props.
 */
export type EventMap = Record<string, unknown>;

export type EventBus<Events extends EventMap> = {
  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void;
  /** Returns an unsubscribe function. */
  on<K extends keyof Events & string>(
    event: K,
    listener: (payload: Events[K]) => void,
  ): () => void;
};

export function createEventBus<Events extends EventMap>(): EventBus<Events> {
  const emitter = new EventEmitter();

  return {
    emit(event, payload) {
      emitter.emit(event, payload);
    },
    on(event, listener) {
      emitter.on(event, listener);
      return () => emitter.off(event, listener);
    },
  };
}
