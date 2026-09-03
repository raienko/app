import type { StyleProp, ViewStyle } from "react-native";

import type { ComponentTypeProps } from "@/components/types";

export type SwitchProps = ComponentTypeProps & {
  /** Controlled on/off state. */
  value: boolean;
  /** Reports the next on/off state. */
  onChange: (value: boolean) => void;
  /** Visible text and the switch's accessible name. */
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type SwitchImplementationProps = Omit<SwitchProps, "type">;
