import { Text as RNText, type TextProps as RNTextProps } from "react-native";

type Props = Omit<RNTextProps, "children"> & {
  value: string;
};

export default function Text({ value, ...props }: Props) {
  return <RNText {...props}>{value}</RNText>;
}
