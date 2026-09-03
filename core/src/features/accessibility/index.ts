export { default as AccessibilityProvider } from "./accessibility-provider";
export {
  useAccessibility,
  useAnimationDuration,
  useIsScreenReaderEnabled,
  useFontScale,
} from "./hooks";
export {
  checkboxA11yProps,
  controlA11yProps,
  fieldA11yProps,
  headingA11yProps,
  radioA11yProps,
  sliderA11yProps,
  statusA11yProps,
  switchA11yProps,
  type HeadingLevel,
} from "./props";
export { ACCESSIBILITY_FLAGS } from "./settings";
export type {
  Accessibility,
  AccessibilityFlag,
  AccessibilityFlags,
} from "./types";
