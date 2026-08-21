import {
  render as rtlRender,
  type RenderOptions,
} from "@testing-library/react-native";
import type { ReactElement } from "react";

import Providers from "./providers";

/**
 * Drop-in replacement for @testing-library/react-native's render, wrapping
 * every rendered tree in the same Providers used by the real app (and by
 * Storybook's preview.tsx). Import render/screen/etc. from here instead of
 * @testing-library/react-native directly, so a new provider added to
 * providers.tsx doesn't require touching every test file that renders a
 * component depending on it.
 */
export function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react-native";
