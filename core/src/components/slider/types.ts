import type { StyleProp, ViewStyle } from "react-native";

import type { ComponentTypeProps } from "@/components/types";

type CommonSliderProps = ComponentTypeProps & {
  /** Visible text and the accessible base name for the slider. */
  label: string;
  min?: number;
  max?: number;
  /** Omit for continuous pointer movement; accessibility uses 1% increments. */
  step?: number;
  disabled?: boolean;
  /** Optional accessible names for individual thumbs in a multi-thumb slider. */
  thumbLabels?: string[];
  /** Controls the value announced by screen readers. */
  formatValue?: (value: number, index: number) => string;
  accessibilityHint?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type SingleSliderProps = CommonSliderProps & {
  value: number;
  onChange: (value: number) => void;
};

export type MultiSliderProps = CommonSliderProps & {
  /** Values are normalized into ascending order and thumbs cannot cross. */
  value: number[];
  onChange: (value: number[]) => void;
};

export type SliderProps = SingleSliderProps | MultiSliderProps;

export type SliderImplementationProps = SliderProps extends infer Props
  ? Props extends SliderProps
    ? Omit<Props, "type" | "style">
    : never
  : never;
