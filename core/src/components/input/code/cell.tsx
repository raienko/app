import { View } from "react-native";

import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  /** Position in the row — its identity, and what tests query it by. */
  index: number;
  /** The character here, or "" while this position is still empty. */
  character: string;
  /** This is where the next digit will land, and the field has the keyboard. */
  active: boolean;
  invalid: boolean;
};

/**
 * One box in the code row — a plain `View`, deliberately not a `TextInput`.
 *
 * A box per input is the usual way to build these and it breaks the one
 * thing this field exists for: iOS fills a one-time code into a *single*
 * text input, so a row of six would take the whole code into the first box.
 * The real input is the invisible one in ./index; these only draw what it
 * holds, and stay out of the accessibility tree entirely.
 */
export default function CodeCell({ index, character, active, invalid }: Props) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View
      testID={`code-cell-${index}`}
      // The boxes are a drawing of what the field holds, and the field
      // itself carries the label and the error. Left visible to a screen
      // reader they'd be six unlabelled stops announcing single characters,
      // competing with the one control that actually means something.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.cell,
        {
          backgroundColor: active
            ? theme.colors.backgroundElementSelected
            : theme.colors.backgroundElement,
          // A resting box carries a visible border for the same reason
          // Button's `secondary` does: its fill is `backgroundElement`, and
          // these sit on an Accordion or a Modal, which use that same token
          // — so a fill-only box is the colour of what's behind it and
          // vanishes. `textSecondary` rather than a neighbouring grey, which
          // contrasts at 1.19:1 against that surface, well under the 3:1
          // WCAG 1.4.11 asks of the only thing marking a control's edge.
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
    // Square-ish rather than square: six boxes across a phone would be
    // 50pt wide, and a 50pt-tall row of them dwarfs every other field.
    height: sizes.elementHeightLg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.x8,
    // Always present so a box doesn't change size when it becomes active.
    borderWidth: spacing.x1,
  },
}));
