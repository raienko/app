import type { StorybookConfig } from "@storybook/react-native-web-vite";
import { loadEnv } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-native-web-vite",
  stories: ["../src/**/*.stories.?(ts|tsx|js)"],
  async viteFinal(viteConfig) {
    // Metro inlines EXPO_PUBLIC_* vars from .env automatically; Vite doesn't,
    // so mirror that here for parity between the on-device and web Storybook.
    const env = loadEnv("development", process.cwd(), "EXPO_PUBLIC_");
    return {
      ...viteConfig,
      define: {
        ...viteConfig.define,
        ...Object.fromEntries(
          Object.entries(env).map(([key, value]) => [
            `process.env.${key}`,
            JSON.stringify(value),
          ]),
        ),
      },
    };
  },
};

export default config;
