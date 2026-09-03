import type { StyleProp, ViewStyle } from "react-native";

import type { ComponentTypeProps } from "@/components/types";

export type CheckboxProps = ComponentTypeProps & {
  /** Controlled checked state. */
  value: boolean;
  /** Reports the next checked state. */
  onChange: (value: boolean) => void;
  /** Visible text and the checkbox's accessible name. */
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type CheckboxImplementationProps = Omit<CheckboxProps, "type">;
