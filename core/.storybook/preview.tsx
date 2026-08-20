import type { Preview } from "@storybook/react-native-web-vite";
import { SafeAreaProvider } from "react-native-safe-area-context";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
        <Story />
      </SafeAreaProvider>
    ),
  ],
};

export default preview;
