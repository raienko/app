[Docs](../../../docs/index.md) › [Features](../../../docs/features/index.md) › App services

# Event bus

> Typed, scoped publish/subscribe for decoupled parts of the app.

<sub>`src/features/event-bus` · Tests: [`index.test.ts`](index.test.ts)</sub>

```ts
import { createEventBus } from "@/features/event-bus";

const bus = createEventBus<{ ping: { count: number } }>();
const unsubscribe = bus.on("ping", (payload) => console.log(payload.count));
bus.emit("ping", { count: 1 });
unsubscribe();
```

A small typed pub/sub wrapper around the ["events"](https://www.npmjs.com/package/events) npm package (a standalone, RN/web-compatible implementation of Node's `EventEmitter` — the same one bundlers polyfill Node's own `"events"` module with; installed and pinned here as a direct dependency since it's imported directly, plus `@types/events` as a pinned dev dependency, since `tsconfig.json`'s `"types": ["jest"]` deliberately keeps `@types/node`'s ambient globals out of this RN codebase and `"events"` itself ships no types of its own). `emit`/`on` are checked against an events map — `bus.emit("ping", "wrong type")` above would be a `tsc` error — and `on` returns an unsubscribe function directly, no separate `off` call needed.

Generic and standalone on purpose: anything needing "fire an event here, react to it somewhere else with no direct reference between the two" can create its own bus with `createEventBus<...>()` instead of writing this plumbing again. `Modal` (below) is the first consumer — its `id`-based `show`/`hide` API is built entirely on one.

---

[All features](../../../docs/features/index.md) · [Docs index](../../../docs/index.md)
