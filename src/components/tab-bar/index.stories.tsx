import { useState } from "react";
import { View } from "react-native";

import Icon from "@/components/icon";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import Component from "./tab-bar";
import useTabBarSpace from "./space";
import type { TabBarItem, TabBarVariant } from "./types";

const meta = {
  title: "components/TabBar",
  component: Component,
};

export default meta;

const ITEMS: TabBarItem[] = [
  { key: "home", label: "Home", icon: <Icon name="home" /> },
  { key: "search", label: "Search", icon: <Icon name="search" /> },
  { key: "saved", label: "Saved", icon: <Icon name="bookmark" /> },
  { key: "profile", label: "Profile", icon: <Icon name="user" /> },
];

function Demo({
  variant,
  avoidChin,
}: {
  variant?: TabBarVariant;
  avoidChin?: boolean;
}) {
  const [value, setValue] = useState("home");

  return (
    <Component
      items={ITEMS}
      value={value}
      onChange={setValue}
      variant={variant}
      avoidChin={avoidChin}
    />
  );
}

export const Sticky = () => <Demo />;

export const Floating = () => <Demo variant="floating" />;

export const WithoutChinPadding = () => <Demo avoidChin={false} />;

/** Two tabs divide the row the same way four do. */
export const TwoTabs = () => {
  const [value, setValue] = useState("home");

  return (
    <Component items={ITEMS.slice(0, 2)} value={value} onChange={setValue} />
  );
};

/** Labels truncate rather than pushing their neighbours out of shape. */
export const LongLabels = () => {
  const [value, setValue] = useState("home");

  return (
    <Component
      items={ITEMS.map((item) => ({
        ...item,
        label: `${item.label} and then some`,
      }))}
      value={value}
      onChange={setValue}
    />
  );
};

/** What `useTabBarSpace()` is for: the last row clears the bar. */
export const ReservingSpace = () => {
  const theme = useTheme();
  const styles = useStyles();
  const space = useTabBarSpace();
  const [value, setValue] = useState("home");

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingBottom: space }]}>
        <Text value="Screen content" type="headline" />
        <Text
          value={`useTabBarSpace() reserves ${Math.round(space)}pt at the bottom.`}
          type="footnote"
          style={{ color: theme.colors.textSecondary }}
        />
      </View>
      <Component items={ITEMS} value={value} onChange={setValue} />
    </View>
  );
};

const useStyles = createStyles(({ spacing }) => ({
  screen: {
    alignSelf: "stretch",
  },
  content: {
    padding: spacing.x16,
    gap: spacing.x4,
  },
}));
