import { View } from "react-native";

import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  index: number;
  /** The character here, or "" while this position is still empty. */
  character: string;
  /** Where the next character will land, with the field focused. */
  active: boolean;
  invalid: boolean;
};

/**
 * One box in the code row — a plain `View`, not a `TextInput`. iOS fills a
 * one-time code into a *single* field, so a row of inputs would take the
 * whole code into the first box; the real input is the invisible one in
 * ./index and these only draw what it holds.
 */
export default function CodeCell({ index, character, active, invalid }: Props) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View
      testID={`code-cell-${index}`}
      // Otherwise a screen reader gets six unlabelled single-character stops
      // competing with the field that carries the actual announcement.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.cell,
        {
          backgroundColor: active
            ? theme.colors.backgroundElementSelected
            : theme.colors.backgroundElement,
          // A resting box needs a visible border for the reason Button's
          // `secondary` does: its fill is `backgroundElement` and it sits on
          // surfaces using that same token, so a fill-only box vanishes.
          // `textSecondary` because the neighbouring grey is 1.19:1 against
          // it, under the 3:1 WCAG 1.4.11 wants for a control's only edge.
          borderColor: invalid
            ? theme.colors.error
            : active
              ? theme.colors.primary
              : theme.colors.textSecondary,
        },
      ]}
    >
      <Text
        value={character}
        type="title3"
        style={{ color: theme.colors.text }}
      />
    </View>
  );
}

const useStyles = createStyles(({ spacing, radius, sizes }) => ({
  cell: {
    flex: 1,
    height: sizes.elementHeightLg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.x8,
    // Always present so a box doesn't resize when it becomes active.
    borderWidth: spacing.x1,
  },
}));
