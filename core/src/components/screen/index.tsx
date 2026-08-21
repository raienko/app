import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "@/features/theme";

export default function Screen({ style, ...props }: ViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
