import { View, type ViewProps } from "react-native";

import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

export default function Screen({ style, ...props }: ViewProps) {
  const theme = useTheme();
  const styles = useStyles();

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

const useStyles = createStyles(({ spacing }) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.x16,
  },
}));
