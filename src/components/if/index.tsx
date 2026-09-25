import type { ReactNode } from "react";

type Props = {
  condition: boolean;
  children: ReactNode;
};

/**
 * Renders `children` when `condition` is true, otherwise nothing — a plain
 * function returning `children` directly, so it adds no host element of its
 * own (unlike wrapping the condition in a <View>, which would introduce a
 * layout node that isn't there in `condition ? <X /> : null`).
 *
 * @example <If condition={config.backdrop}><ModalBackdrop ... /></If>
 */
export default function If({ condition, children }: Props): ReactNode {
  return condition ? children : null;
}
