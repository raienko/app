import { createEventBus } from "./index";

describe("createEventBus smoke test", () => {
  it("delivers an emitted payload to a listener", () => {
    const bus = createEventBus<{ ping: { count: number } }>();
    const listener = jest.fn();
    bus.on("ping", listener);

    bus.emit("ping", { count: 1 });

    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it("unsubscribes when the returned function is called", () => {
    const bus = createEventBus<{ ping: { count: number } }>();
    const listener = jest.fn();
    const unsubscribe = bus.on("ping", listener);

    unsubscribe();
    bus.emit("ping", { count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  it("only delivers to listeners of the same event", () => {
    const bus = createEventBus<{ a: number; b: string }>();
    const aListener = jest.fn();
    const bListener = jest.fn();
    bus.on("a", aListener);
    bus.on("b", bListener);

    bus.emit("a", 1);

    expect(aListener).toHaveBeenCalledWith(1);
    expect(bListener).not.toHaveBeenCalled();
  });

  it("supports multiple listeners on the same event", () => {
    const bus = createEventBus<{ ping: undefined }>();
    const first = jest.fn();
    const second = jest.fn();
    bus.on("ping", first);
    bus.on("ping", second);

    bus.emit("ping", undefined);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
