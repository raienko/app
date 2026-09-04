import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import Badge, { type BadgeType } from "@/components/badge";
import Icon, { withIconDefaults } from "@/components/icon";
import Image, { type ImageSourceProp } from "@/components/image";
import Text from "@/components/text";
import { disabledA11yProps, imageA11yProps } from "@/features/accessibility";
import { useLocale } from "@/features/localization";
import {
  createStyles,
  useSizes,
  type TypographyToken,
} from "@/features/responsive";
import { useTheme } from "@/features/theme";

import { getInitials } from "./initials";

export type AvatarSize = "small" | "medium" | "large";

/**
 * Which step of the type scale the monogram is set in, roughly 40% of the
 * circle at each size — the ratio at which initials read as a monogram
 * rather than as text that happens to be in a circle.
 *
 * The title steps carry heading semantics in `Text`, which is why the
 * monogram is also spread with `disabledA11yProps()` below: the container
 * owns the name, so the letters inside it are decoration and have no
 * business in a screen reader's heading rotor.
 */
const SIZE_TEXT: Record<AvatarSize, TypographyToken> = {
  small: "footnote",
  medium: "title3",
  large: "title1",
};

/**
 * A status dot is colour, and colour is not information on its own (WCAG
 * 1.4.1). Requiring the label with the dot is what keeps "online" from
 * being a green circle and nothing else — the same reason every `Toast`
 * type carries an `announcement`.
 */
type StatusProps =
  | { status?: never; statusLabel?: never }
  | {
      /** A `Badge` dot pinned to the corner — presence, sync state, unread. */
      status: BadgeType;
      /** What the dot means, in words: "Online", "Syncing", "Offline". */
      statusLabel: string;
    };

type Props = StatusProps & {
  /**
   * Who or what this represents. Required, and doing double duty on
   * purpose: it's the avatar's accessible name *and* what the monogram is
   * derived from, so the two can't disagree.
   */
  name: string;
  /**
   * The picture. Anything `Image` takes. Missing or failing to load falls
   * through to the monogram underneath — see the note below.
   */
  source?: ImageSourceProp;
  /**
   * Shown instead of the monogram — for a group, a company, or a person
   * whose name isn't known. Usually an `<Icon />`, which takes its colour
   * and size from here.
   */
  icon?: ReactNode;
  /** Defaults to `"medium"`. */
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The picture of a person or a thing, in a circle: a list row's leading
 * slot, a comment's author, the account button in a header.
 *
 * **The fallbacks are a stack, not a branch.** The monogram (or `icon`) is
 * always rendered, and the picture sits on top of it — so an avatar with no
 * source shows initials, one whose source fails shows initials, and one
 * that is still loading shows initials until the picture arrives. There is
 * no separate loading state to design, because the thing underneath is
 * already the right thing to look at. `Image` owns the error detection and
 * the log; this just declines its generic placeholder (`fallback={null}`)
 * in favour of something that actually says who this is.
 *
 * **It reuses `Image`, so it reuses that cache.** No second one — an avatar
 * URL preloaded through `Image.preload()` is already warm here.
 *
 * **The whole avatar is one accessibility element**, named `name` (with the
 * status appended when there is one). The picture is `decorative`, and the
 * monogram is hidden: a screen reader announcing "A L" would be reading the
 * abbreviation instead of the person. An avatar left with nothing to be
 * called — no name and no status — is hidden outright rather than left as
 * an element with an empty name, the same treatment an unlabelled `Badge`
 * dot gets.
 *
 * **The monogram doesn't scale with the OS text size.** The circle is a
 * fixed graphic that has to line up down a list, so letters that grew would
 * clip rather than help — and the name is available in full to anyone
 * reading by screen reader. Everything else here scales with the device
 * through `units()` as usual.
 *
 * **It isn't pressable.** An avatar that navigates is a button with an
 * avatar in it; wrap it rather than growing a second press channel here.
 *
 * @example <Avatar name="Ada Lovelace" source={user.avatarUrl} />
 * @example <Avatar name="Ada Lovelace" status="success" statusLabel="Online" />
 * @example <Avatar name="Design team" icon={<Icon name="users" />} size="large" />
 */
export default function Avatar({
  name,
  source,
  icon,
  size = "medium",
  status,
  statusLabel,
  style,
  testID,
}: Props) {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();
  const { locale } = useLocale();

  const initials = getInitials(name, locale);
  // Joined from the parts that exist, rather than interpolated: a nameless
  // avatar with a status should announce the status, not ", Online".
  const label = [name.trim(), statusLabel].filter(Boolean).join(", ");
  // Deliberately last: a name with no letters in it at all is the one case
  // with nothing to draw, and a person glyph beats an empty circle.
  const placeholder =
    icon ?? (initials === "" ? <Icon name="user" /> : undefined);

  return (
    <View
      testID={testID}
      {...(label === "" ? disabledA11yProps() : imageA11yProps({ label }))}
      style={[styles.avatar, style]}
    >
      <View
        style={[
          styles.surface,
          styles[size],
          {
            backgroundColor: theme.colors.backgroundElement,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {placeholder === undefined ? (
          <Text
            {...disabledA11yProps()}
            value={initials}
            type={SIZE_TEXT[size]}
            allowFontScaling={false}
            style={{ color: theme.colors.textSecondary }}
          />
        ) : (
          <View {...disabledA11yProps()}>
            {withIconDefaults(placeholder, {
              color: theme.colors.textSecondary,
              size: spacing[ICON_SIZE[size]],
            })}
          </View>
        )}

        {/* On top of whatever is underneath, and transparent until it
            loads — which is what makes the monogram the loading state. */}
        <Image
          source={source}
          fallback={null}
          decorative
          contentFit="cover"
          style={styles.picture}
        />
      </View>

      {status === undefined ? null : (
        // Sat in the corner of the square the circle is inscribed in, which
        // the circle itself doesn't reach — so it reads against the page
        // rather than against the picture, and needs no ring to separate
        // it. Outside the clipping surface above, or it would be cut in
        // half.
        <Badge
          dot
          type={status}
          style={[styles.status, styles[`dot-${size}`]]}
        />
      )}
    </View>
  );
}

/** Roughly half the circle, so a glyph fills it the way a monogram does. */
const ICON_SIZE: Record<AvatarSize, "x16" | "x24" | "x32"> = {
  small: "x16",
  medium: "x24",
  large: "x32",
};

/**
 * The circle diameters are this component's own business rather than
 * entries in the sizes styleguide: nothing else in the app is measured in
 * avatars, and the styleguide's own note says a bespoke measurement stays
 * local. They still go through `units()`, like every other size here.
 */
const useStyles = createStyles(({ units, isRTL }) => ({
  avatar: {
    // Sized by the circle inside it, and never stretched to its container:
    // an avatar is a fixed graphic, not a surface.
    alignSelf: "flex-start",
  },
  surface: {
    alignItems: "center",
    justifyContent: "center",
    // Same reason `Button`'s `secondary` and `ImageFallback` carry one: the
    // fill is `backgroundElement`, which is invisible against any other
    // raised surface the avatar might sit on.
    borderWidth: units(1),
    // Clips the picture to the circle. It also clips anything else in here,
    // which is why the status dot is a sibling rather than a child.
    overflow: "hidden",
  },
  // Fills the surface rather than restating its size, and takes its round
  // corners from the surface's `overflow: "hidden"` rather than repeating
  // the radius — one place decides how big the circle is.
  picture: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  status: {
    position: "absolute",
    bottom: 0,
    // A physical side chosen from the locale flag rather than RN's `end`,
    // which resolves through I18nManager and so lags a locale switch by a
    // native reload — the reason `createStyles` hands out `isRTL` at all.
    ...(isRTL ? { left: 0 } : { right: 0 }),
  },
  small: {
    width: units(32),
    height: units(32),
    borderRadius: units(16),
  },
  medium: {
    width: units(48),
    height: units(48),
    borderRadius: units(24),
  },
  large: {
    width: units(64),
    height: units(64),
    borderRadius: units(32),
  },
  // A presence dot is about a quarter of the circle at every size — fixed
  // at `Badge`'s own 8pt it would vanish on a large avatar.
  "dot-small": {
    width: units(10),
    height: units(10),
    borderRadius: units(5),
  },
  "dot-medium": {
    width: units(14),
    height: units(14),
    borderRadius: units(7),
  },
  "dot-large": {
    width: units(18),
    height: units(18),
    borderRadius: units(9),
  },
}));
