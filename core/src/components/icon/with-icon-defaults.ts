import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import Icon from "./index";

type IconProps = ComponentProps<typeof Icon>;

type Defaults = {
  color?: IconProps["color"];
  size?: IconProps["size"];
};

/**
 * Fills in colour and size on any `Icon` passed as a direct child, so a
 * surface that already knows its own foreground — `Button`, whose palette
 * decides it — doesn't make every call site repeat it.
 *
 * Two deliberate limits:
 *
 * - **An icon's own props win.** These are defaults, not overrides, so a
 *   call site with a reason to differ (the password field's muted eye) keeps
 *   it.
 * - **Only `Icon` children are touched**, and only direct ones. Cloning
 *   whatever happens to be there would push a `color` prop onto a `View`
 *   that has no use for one, and reaching deeper would mean walking a tree
 *   this has no business walking. An icon nested inside something else
 *   takes its own props, as it always could.
 */
export default function withIconDefaults(
  children: ReactNode,
  { color, size }: Defaults,
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== Icon) return child;

    const icon = child as ReactElement<IconProps>;
    return cloneElement(icon, {
      color: icon.props.color ?? color,
      size: icon.props.size ?? size,
    });
  });
}
