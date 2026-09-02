/**
 * Shared implementation switch for components that offer both the app's
 * design-system UI and an @expo/ui-backed alternative.
 *
 * The public behavior stays the same for both implementations. Components
 * default to the custom implementation and opt into Expo UI with
 * `type="expo"`.
 */
export type ComponentType = "custom" | "expo";

export type ComponentTypeProps = {
  type?: ComponentType;
};

export const DEFAULT_COMPONENT_TYPE: ComponentType = "custom";
