import { View } from "react-native";

import Image from "@/components/image";

import { artworkFromChildren, preserveAspectRatio, svgHref } from "./source";

describe("svgHref", () => {
  // The common case: a Figma export brought in with require().
  it("passes a bundled asset straight through", () => {
    expect(svgHref(42)).toBe(42);
  });

  it("takes a bare URL", () => {
    expect(svgHref("https://example.com/skeleton.svg")).toBe(
      "https://example.com/skeleton.svg",
    );
  });

  it("takes the uri out of a source object", () => {
    expect(svgHref({ uri: "https://example.com/skeleton.png" })).toBe(
      "https://example.com/skeleton.png",
    );
  });

  it("picks the first usable entry from a list", () => {
    expect(svgHref([{ uri: "" }, { uri: "https://example.com/a.png" }])).toBe(
      "https://example.com/a.png",
    );
  });

  // Not a mistake to report — the caller gets a skeleton, just an unmasked
  // one, which is why these return undefined rather than throwing.
  describe("sources SVG has no file to load from", () => {
    it.each([
      ["nothing", undefined],
      ["null", null],
      ["an empty string", ""],
      ["whitespace", "   "],
      ["an empty list", []],
      ["an SF Symbol", "sf:star"],
      ["a blurhash", "blurhash:LEHV6nWB2yk8"],
      ["a thumbhash", "thumbhash:1QcSHQRnh493"],
      ["an object with no uri", { width: 10 }],
      ["an object with an empty uri", { uri: "" }],
    ])("declines %s", (_name, source) => {
      expect(svgHref(source as never)).toBeUndefined();
    });
  });
});

describe("preserveAspectRatio", () => {
  // A mask built from a child's source has to line up with how that child
  // is actually drawn, and expo-image's own default is `cover`.
  it("defaults to cover, the way expo-image does", () => {
    expect(preserveAspectRatio(undefined)).toBe("xMidYMid slice");
  });

  it.each([
    ["contain", "xMidYMid meet"],
    ["cover", "xMidYMid slice"],
    ["fill", "none"],
    ["scale-down", "xMidYMid meet"],
  ])("maps %s", (contentFit, expected) => {
    expect(preserveAspectRatio(contentFit)).toBe(expected);
  });

  it("falls back to the default for anything it doesn't know", () => {
    expect(preserveAspectRatio("sideways")).toBe("xMidYMid slice");
  });
});

describe("artworkFromChildren", () => {
  // The point of it: the two ways of saying the same thing render the same
  // thing, rather than one getting a masked highlight and the other a band.
  it("finds the source behind a lone Image child", () => {
    expect(
      artworkFromChildren(<Image source="https://example.com/a.png" alt="" />),
    ).toEqual({ source: "https://example.com/a.png", contentFit: undefined });
  });

  it("carries the child's own contentFit with it", () => {
    expect(
      artworkFromChildren(
        <Image source={7 as never} alt="" contentFit="contain" />,
      ),
    ).toEqual({ source: 7, contentFit: "contain" });
  });

  it("declines an Image with nothing to draw", () => {
    expect(artworkFromChildren(<Image decorative />)).toBeUndefined();
  });

  // Reaching further into a caller's tree would make the effect depend on
  // layers they didn't write — the limit `withIconDefaults` puts on itself.
  it("declines anything that isn't a lone Image", () => {
    expect(artworkFromChildren(<View />)).toBeUndefined();
    expect(
      artworkFromChildren(
        <View>
          <Image source="https://example.com/a.png" alt="" />
        </View>,
      ),
    ).toBeUndefined();
    expect(
      artworkFromChildren(
        <>
          <Image source="https://example.com/a.png" alt="" />
          <View />
        </>,
      ),
    ).toBeUndefined();
    expect(artworkFromChildren(null)).toBeUndefined();
    expect(artworkFromChildren("text")).toBeUndefined();
  });
});
