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
