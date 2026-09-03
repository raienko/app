import type { StyleProp, ViewStyle } from "react-native";

import type { ComponentTypeProps } from "@/components/types";

export type RadioButtonProps = ComponentTypeProps & {
  /** Controlled selected state. */
  value: boolean;
  /** Reports `true` when this option is selected. */
  onChange: (value: boolean) => void;
  /** Visible text and the radio button's accessible name. */
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type RadioButtonImplementationProps = Omit<RadioButtonProps, "type">;

export type RadioIndicatorProps = {
  selected: boolean;
};
