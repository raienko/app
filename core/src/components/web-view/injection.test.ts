import { BRIDGE_CHANNEL, BRIDGE_GLOBAL, encodeMessage } from "./bridge";
import {
  READY_MESSAGE,
  STYLE_MESSAGE,
  bridgeScript,
  deliverInjection,
  nativeInjection,
} from "./injection";

/**
 * Every string literal in the generated source, decoded back to its value.
 *
 * The literals are escaped, so comparing raw text would only be testing the
 * escaping's spelling. What is worth asserting is that the value still
 * *decodes* to what was passed in — `jsLiteral` produces valid JSON, so
 * `JSON.parse` is exactly the page's own reading of it.
 */
function literalsIn(script: string): string[] {
  const literals = script.match(/"(?:[^"\\]|\\.)*"/g) ?? [];
  return literals.flatMap((literal) => {
    try {
      const value: unknown = JSON.parse(literal);
      return typeof value === "string" ? [value] : [];
    } catch {
      return [];
    }
  });
}

describe("bridgeScript", () => {
  it("publishes the page-side API under one name", () => {
    const script = bridgeScript();

    expect(script).toContain(`window.${BRIDGE_GLOBAL} = {`);
    expect(script).toContain("post: function");
    expect(script).toContain("on: function");
    expect(script).toContain("receive: deliver");
  });

  // The whole point of the shim: the page writes one thing and the shim
  // knows which transport it has.
  it("carries both transports", () => {
    const script = bridgeScript();

    expect(script).toContain("window.ReactNativeWebView.postMessage");
    expect(script).toContain("window.parent.postMessage");
  });

  it("only speaks on our own channel", () => {
    expect(bridgeScript()).toContain(BRIDGE_CHANNEL);
  });

  it("announces itself so the app knows when to send", () => {
    expect(bridgeScript()).toContain(READY_MESSAGE);
  });

  it("applies a stylesheet delivered over the bridge", () => {
    expect(bridgeScript()).toContain(STYLE_MESSAGE);
  });

  it("does not install itself twice", () => {
    expect(bridgeScript()).toContain(`if (window.${BRIDGE_GLOBAL}) return;`);
  });

  describe("the baked-in stylesheet", () => {
    it("is applied when there is one", () => {
      expect(literalsIn(bridgeScript("body { color: red }"))).toContain(
        "body { color: red }",
      );
    });

    /**
     * This string becomes code. A stylesheet is caller data — it can come
     * from a prop, a CMS, a theme override — so anything that could close
     * the script tag or escape the literal has to be neutralised, and
     * JSON.stringify is what does it.
     */
    it("cannot break out of the script", () => {
      const hostile = `</script><script>window.stolen=1</script>`;
      const script = bridgeScript(hostile);

      expect(script).not.toContain("</script>");
      expect(script).not.toContain("<script>");
      // Escaped, not mangled: it still decodes to what was passed in.
      expect(literalsIn(script)).toContain(hostile);
    });

    it.each([
      ["a quote", `body::after { content: "'" }`],
      ["a backslash", `body::after { content: "\\\\" }`],
      ["a newline", "body {\n  color: red;\n}"],
      ["a line separator", "body { color: red }  "],
    ])("survives %s intact", (_name, css) => {
      const script = bridgeScript(css);

      expect(literalsIn(script)).toContain(css);
      // Parseable as JS, which is the only claim that actually matters.
      expect(() => new Function(script)).not.toThrow();
    });
  });

  it("is valid JavaScript", () => {
    expect(
      () => new Function(bridgeScript("body { margin: 0 }")),
    ).not.toThrow();
  });
});

describe("nativeInjection", () => {
  // iOS warns when the injected script's completion value isn't `true` —
  // the library's own guide says so, and it is not decoration.
  it("ends with true", () => {
    expect(nativeInjection().trimEnd().endsWith("true;")).toBe(true);
  });

  it("is the same script underneath", () => {
    expect(nativeInjection("body { margin: 0 }")).toContain(
      bridgeScript("body { margin: 0 }"),
    );
  });
});

describe("deliverInjection", () => {
  it("hands the encoded message to the shim", () => {
    const encoded = encodeMessage({ type: "cart", payload: { items: 2 } });

    expect(literalsIn(deliverInjection(encoded))).toContain(encoded);
  });

  // The page may not have got the shim yet, or may have navigated away
  // from it; injecting a call on a missing object would throw in the page.
  it("checks the shim is there first", () => {
    expect(deliverInjection("{}")).toContain(`window.${BRIDGE_GLOBAL} &&`);
  });

  it("ends with true", () => {
    expect(deliverInjection("{}").trimEnd().endsWith("true;")).toBe(true);
  });

  it("is valid JavaScript for a hostile payload", () => {
    const encoded = encodeMessage({
      type: "x",
      payload: `</script>'"\\`,
    });

    expect(() => new Function(deliverInjection(encoded))).not.toThrow();
  });
});
