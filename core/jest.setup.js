require("@expo/env").load(__dirname, { silent: true });

jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

require("react-native-gesture-handler/jestSetup");

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

// expo-audio and expo-video are native modules with no JS implementation,
// so importing either throws under Jest — which reaches any test that
// renders a tree containing MediaPlayer, the Showcase included. Stubbed
// here rather than in each of those files, the same reason the three above
// are. A test that cares about playback replaces these with its own.
jest.mock("expo-audio", () => ({
  useAudioPlayer: () => ({
    playing: false,
    muted: false,
    loop: false,
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
  }),
  useAudioPlayerStatus: () => ({
    playing: false,
    currentTime: 0,
    duration: 0,
    mute: false,
    isLoaded: false,
  }),
}));

jest.mock("expo-video", () => ({
  useVideoPlayer: (source, setup) => {
    const player = {
      playing: false,
      muted: false,
      loop: false,
      currentTime: 0,
      duration: 0,
      timeUpdateEventInterval: 0,
      play: jest.fn(),
      pause: jest.fn(),
    };
    setup?.(player);
    return player;
  },
  VideoView: () => null,
}));

// react-native-enriched-markdown renders through a native view, so it can't
// render under Jest. The package ships its own mock for exactly this.
jest.mock("react-native-enriched-markdown", () =>
  require("react-native-enriched-markdown/jest"),
);

// react-native-webview renders a native view, so it can't render under Jest
// and the package ships no mock of its own. Stubbed to a plain View that
// keeps the ref API the bridge drives (`injectJavaScript`, `reload`) and
// exposes the handlers, so a test can post a message *as the page* without
// a browser. Anything that renders the Showcase reaches this too.
jest.mock("react-native-webview", () => {
  const { forwardRef, useImperativeHandle } = require("react");
  const { View } = require("react-native");

  // Every script the app injects, in order. This is the app's only way of
  // talking into the page on native, so a test asserting that a message was
  // sent has to read it from here — see web-view/index.test.tsx.
  const injected = [];
  const reloads = [];

  const WebView = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      injectJavaScript: (script) => injected.push(script),
      reload: () => reloads.push(true),
      postMessage: jest.fn(),
      stopLoading: jest.fn(),
    }));
    return <View {...props} testID="native-web-view" />;
  });
  WebView.displayName = "WebView";

  return {
    __esModule: true,
    default: WebView,
    WebView,
    __injected: injected,
    __reloads: reloads,
  };
});
